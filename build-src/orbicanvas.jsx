/* orbicanvas.jsx — Collaborative tldraw infinite canvas island.
 *
 * tldraw store <-> Yjs (CRDT) binding, with a transport that rides the app's
 * EXISTING Supabase Realtime broadcast (no new server). Concurrent edits merge
 * conflict-free; live cursors come from the Yjs awareness protocol. The doc is
 * persisted (debounced) through app-provided loadDoc/saveDoc callbacks, so it
 * survives reloads and syncs offline-first.
 *
 * Bundled by esbuild into vendor/orbicanvas/orbicanvas.js (IIFE) exposing
 * window.OrbiCanvas.mount(container, data, handlers).
 *   data:     { projectId, channelName, user:{id,name,color}, supabase, readonly, mobileReadonly, theme }
 *   handlers: { loadDoc(): Promise<base64|null>, saveDoc(base64): void }
 *
 * Rebuild after editing:  npm run build:orbicanvas
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils,
  InstancePresenceRecordType, createPresenceStateDerivation,
  react, atom, toRichText, createShapeId,
} from 'tldraw';
import 'tldraw/tldraw.css';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';

// Uint8Array <-> base64 so binary Yjs updates survive Supabase's JSON broadcast.
const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); };
const fromB64 = (b64) => { const s = atob(b64); const u8 = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i); return u8; };
const colorSchemeForTheme = (theme) => theme === 'black' || theme === 'dark' ? 'dark' : 'light';

function applyCanvasMode(editor, data = {}) {
  if (!editor) return;
  const readonly = !!(data.readonly || data.mobileReadonly);
  try { editor.setColorMode(colorSchemeForTheme(data.theme)); } catch (_) {}
  try { editor.updateInstanceState({ isReadonly: readonly }); } catch (_) {}
  if (readonly) {
    try { editor.setCurrentTool('hand'); } catch (_) {}
  }
}

function CanvasApp({ data, handlers }) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils, bindingUtils: defaultBindingUtils }));
  const mobileReadonly = !!data.mobileReadonly;
  const readonly = !!(data.readonly || mobileReadonly);
  const colorScheme = colorSchemeForTheme(data.theme);

  useEffect(() => {
    const doc = new Y.Doc();
    const yRecords = doc.getMap('tl_records'); // record.id -> tldraw record
    const awareness = new Awareness(doc);
    const clientId = doc.clientID;
    let disposed = false;
    const cleanups = [];

    (async () => {
      // 1. Load any persisted state into the doc before connecting.
      try {
        const saved = handlers.loadDoc ? await handlers.loadDoc() : null;
        if (saved && !disposed) Y.applyUpdate(doc, fromB64(saved), 'persist');
      } catch (_) {}
      if (disposed) return;

      // 2. Persistence (debounced) — write the whole doc state out.
      let persistTimer = null;
      const schedulePersist = () => {
        if (!handlers.saveDoc) return;
        clearTimeout(persistTimer);
        persistTimer = setTimeout(() => {
          try { handlers.saveDoc(toB64(Y.encodeStateAsUpdate(doc))); } catch (_) {}
        }, 800);
      };
      cleanups.push(() => clearTimeout(persistTimer));

      // 3. Seed: load existing doc records into the store, or seed the doc.
      if (yRecords.size > 0) {
        const records = [...yRecords.values()];
        store.mergeRemoteChanges(() => { store.put(records); });
      } else {
        doc.transact(() => { store.allRecords().forEach(r => yRecords.set(r.id, r)); }, clientId);
      }

      // 4. store -> doc (only user-driven document changes; origin = our id).
      cleanups.push(store.listen((event) => {
        doc.transact(() => {
          for (const r of Object.values(event.changes.added)) yRecords.set(r.id, r);
          for (const [, r] of Object.values(event.changes.updated)) yRecords.set(r.id, r);
          for (const r of Object.values(event.changes.removed)) yRecords.delete(r.id);
        }, clientId);
      }, { source: 'user', scope: 'document' }));

      // 5. doc -> store (skip our own writes; CRDT-merged remote changes).
      const onRecords = (events, txn) => {
        if (txn.origin === clientId) return;
        const toPut = [], toRemove = [];
        for (const ev of events) {
          ev.changes.keys.forEach((change, key) => {
            if (change.action === 'delete') toRemove.push(key);
            else { const v = yRecords.get(key); if (v) toPut.push(v); }
          });
        }
        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };
      yRecords.observeDeep(onRecords);
      cleanups.push(() => yRecords.unobserveDeep(onRecords));

      // 6. Presence / live cursors via awareness.
      const u = data.user || {};
      const userAtom = atom('user', { id: String(u.id || clientId), name: u.name || 'Teammate', color: u.color || '#38bdf8' });
      const presenceId = InstancePresenceRecordType.createId(String(clientId));
      const presence = createPresenceStateDerivation(userAtom, presenceId)(store);
      cleanups.push(react('broadcast-presence', () => {
        const p = presence.get();
        awareness.setLocalStateField('presence', p || null);
      }));
      const applyRemotePresence = () => {
        const toPut = [], liveIds = new Set();
        awareness.getStates().forEach((state, cid) => {
          if (cid === clientId || !state?.presence) return;
          toPut.push(state.presence);
          liveIds.add(state.presence.id);
        });
        const toRemove = store.allRecords()
          .filter(r => r.typeName === 'instance_presence' && r.id !== presenceId && !liveIds.has(r.id))
          .map(r => r.id);
        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };
      awareness.on('change', applyRemotePresence);
      cleanups.push(() => awareness.off('change', applyRemotePresence));

      // 7. Transport: ride the existing Supabase Realtime broadcast.
      const sb = data.supabase || window.SupabaseDB?._client;
      let channel = null;
      const onDocUpdate = (update, origin) => {
        if (origin !== 'remote' && channel) {
          try { channel.send({ type: 'broadcast', event: 'doc', payload: toB64(update) }); } catch (_) {}
        }
        if (origin !== 'remote' && origin !== 'persist') schedulePersist();
      };
      doc.on('update', onDocUpdate);
      cleanups.push(() => doc.off('update', onDocUpdate));

      if (sb && data.channelName) {
        channel = sb.channel(data.channelName, { config: { broadcast: { self: false, ack: false } } });
        const onAwareness = ({ added, updated, removed }) => {
          const changed = [...added, ...updated, ...removed];
          try { channel.send({ type: 'broadcast', event: 'awareness', payload: toB64(encodeAwarenessUpdate(awareness, changed)) }); } catch (_) {}
        };
        awareness.on('update', onAwareness);
        cleanups.push(() => awareness.off('update', onAwareness));

        // Push our full local awareness state (name/color/cursor) so existing
        // peers immediately render our avatar — incremental 'update' events only
        // fire on later changes, which is why joiners were invisible before.
        const broadcastPresence = () => {
          try { channel.send({ type: 'broadcast', event: 'awareness', payload: toB64(encodeAwarenessUpdate(awareness, [clientId])) }); } catch (_) {}
        };
        channel.on('broadcast', { event: 'doc' }, ({ payload }) => { try { Y.applyUpdate(doc, fromB64(payload), 'remote'); } catch (_) {} });
        channel.on('broadcast', { event: 'awareness' }, ({ payload }) => { try { applyAwarenessUpdate(awareness, fromB64(payload), 'remote'); } catch (_) {} });
        channel.on('broadcast', { event: 'sync-req' }, () => {
          // A new peer joined: send them the current doc AND our presence.
          try { channel.send({ type: 'broadcast', event: 'doc', payload: toB64(Y.encodeStateAsUpdate(doc)) }); } catch (_) {}
          broadcastPresence();
        });
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            try { channel.send({ type: 'broadcast', event: 'sync-req', payload: '1' }); } catch (_) {}
            broadcastPresence();
          }
        });
        cleanups.push(() => { try { channel.unsubscribe(); } catch (_) {} });
      }

      cleanups.push(() => { try { removeAwarenessStates(awareness, [clientId], 'cleanup'); } catch (_) {} });
      cleanups.push(() => { try { awareness.destroy(); } catch (_) {} });
      cleanups.push(() => { try { doc.destroy(); } catch (_) {} });
    })();

    return () => { disposed = true; cleanups.forEach(fn => { try { fn(); } catch (_) {} }); };
  }, [store, data, handlers]);

  return React.createElement('div', {
    className: `orbi-canvas-app ${readonly ? 'orbi-canvas-app-readonly' : ''} ${mobileReadonly ? 'orbi-canvas-app-mobile-readonly' : ''}`,
    style: { position: 'absolute', inset: 0 }
  },
    React.createElement(Tldraw, {
      store,
      hideUi: mobileReadonly,
      forceMobile: mobileReadonly,
      autoFocus: !mobileReadonly,
      initialState: mobileReadonly ? 'hand' : undefined,
      colorScheme,
      onMount: (editor) => {
        applyCanvasMode(editor, data);
        data.__onEditor && data.__onEditor(editor);
      }
    })
  );
}

// Pull plain text out of every text-bearing shape, so the canvas can be handed
// to the AI Copilot to turn a brainstorm into a real project.
function extractText(editor) {
  if (!editor) return '';
  try {
    const shapes = editor.getCurrentPageShapes();
    const lines = [];
    for (const shape of shapes) {
      let t = '';
      try { t = editor.getShapeUtil(shape).getText?.(shape) || ''; } catch (_) {}
      if (!t && typeof shape.props?.text === 'string') t = shape.props.text;
      if (t && t.trim()) lines.push(t.trim());
    }
    return lines.join('\n');
  } catch (_) { return ''; }
}

function normalizeCanvasNote(input) {
  if (typeof input === 'string') {
    const text = input.trim();
    return text ? { title: '', text } : null;
  }
  if (!input) return null;
  const title = String(input.title || input.noteTitle || '').trim().slice(0, 140);
  const text = String(input.text || input.content || '').trim().slice(0, 2000);
  if (!title && !text) return null;
  return { title, text };
}

function canvasNoteText(input) {
  const note = normalizeCanvasNote(input);
  if (!note) return '';
  return [note.title, note.text].filter(Boolean).join('\n\n');
}

function estimateNoteWidth(text) {
  const longest = Math.max(0, ...String(text || '').split(/\n/).map(line => line.length));
  return Math.max(260, Math.min(460, longest * 8 + 42));
}

const roots = new WeakMap();

function mount(container, data = {}, handlers = {}) {
  if (!container) return;
  let root = roots.get(container);
  if (!root) { root = createRoot(container); roots.set(container, root); }
  const handle = {
    _editor: null,
    _readonly: !!(data.readonly || data.mobileReadonly),
    getText() { return extractText(this._editor); },
    setReadonly(value) {
      this._readonly = !!value;
      data.readonly = !!value;
      try { this._editor?.updateInstanceState?.({ isReadonly: this._readonly }); } catch (_) {}
      if (this._readonly) {
        try { this._editor?.setCurrentTool?.('hand'); } catch (_) {}
      }
    },
    setTheme(theme) {
      data.theme = colorSchemeForTheme(theme) === 'dark' ? 'black' : 'normal';
      try { this._editor?.setColorMode?.(colorSchemeForTheme(data.theme)); } catch (_) {}
    },
    // Create a sticky note at a screen position (used for drag-drop from the
    // notes panel). tldraw 5 uses richText; fall back to plain text/older APIs.
    addNote(input, clientX, clientY) {
      if (this._readonly) return false;
      const e = this._editor;
      if (!e) return false;
      const str = canvasNoteText(input);
      if (!str) return false;
      const width = estimateNoteWidth(str);
      let pt = { x: 120, y: 120 };
      try { pt = e.screenToPage({ x: clientX, y: clientY }); } catch (_) {}
      const tries = [];
      try { tries.push({ type: 'note', props: { richText: toRichText(str), w: width, color: 'yellow', size: 'm' } }); } catch (_) {}
      try { tries.push({ type: 'text', props: { richText: toRichText(str), w: width, color: 'black', size: 'm' } }); } catch (_) {}
      tries.push({ type: 'note', props: { text: str, w: width, color: 'yellow', size: 'm' } });
      tries.push({ type: 'text', props: { text: str, w: width, color: 'black', size: 'm' } });
      for (const shape of tries) {
        const id = createShapeId();
        try {
          e.createShape({ id, x: pt.x, y: pt.y, ...shape });
          try { e.select(id); } catch (_) {}
          return true;
        } catch (_) {}
      }
      return false;
    },
    unmount() { try { root.unmount(); } catch (_) {} roots.delete(container); },
  };
  data.__onEditor = (editor) => { handle._editor = editor; };
  root.render(React.createElement(CanvasApp, { data, handlers }));
  return handle;
}

window.OrbiCanvas = { mount };
