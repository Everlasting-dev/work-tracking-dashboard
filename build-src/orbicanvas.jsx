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
 *   data:     { projectId, channelName, user:{id,name,color}, supabase }
 *   handlers: { loadDoc(): Promise<base64|null>, saveDoc(base64): void }
 *
 * Rebuild after editing:  npm run build:orbicanvas
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Tldraw, createTLStore, defaultShapeUtils, defaultBindingUtils,
  InstancePresenceRecordType, createPresenceStateDerivation,
  react, atom,
} from 'tldraw';
import 'tldraw/tldraw.css';
import * as Y from 'yjs';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';

// Uint8Array <-> base64 so binary Yjs updates survive Supabase's JSON broadcast.
const toB64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); };
const fromB64 = (b64) => { const s = atob(b64); const u8 = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i); return u8; };

function CanvasApp({ data, handlers }) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils, bindingUtils: defaultBindingUtils }));

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

        channel.on('broadcast', { event: 'doc' }, ({ payload }) => { try { Y.applyUpdate(doc, fromB64(payload), 'remote'); } catch (_) {} });
        channel.on('broadcast', { event: 'awareness' }, ({ payload }) => { try { applyAwarenessUpdate(awareness, fromB64(payload), 'remote'); } catch (_) {} });
        channel.on('broadcast', { event: 'sync-req' }, () => {
          try { channel.send({ type: 'broadcast', event: 'doc', payload: toB64(Y.encodeStateAsUpdate(doc)) }); } catch (_) {}
        });
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            try { channel.send({ type: 'broadcast', event: 'sync-req', payload: '1' }); } catch (_) {}
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

  return React.createElement('div', { style: { position: 'absolute', inset: 0 } },
    React.createElement(Tldraw, { store, onMount: (editor) => { data.__onEditor && data.__onEditor(editor); } })
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

const roots = new WeakMap();

function mount(container, data = {}, handlers = {}) {
  if (!container) return;
  let root = roots.get(container);
  if (!root) { root = createRoot(container); roots.set(container, root); }
  const handle = {
    _editor: null,
    getText() { return extractText(this._editor); },
    unmount() { try { root.unmount(); } catch (_) {} roots.delete(container); },
  };
  data.__onEditor = (editor) => { handle._editor = editor; };
  root.render(React.createElement(CanvasApp, { data, handlers }));
  return handle;
}

window.OrbiCanvas = { mount };
