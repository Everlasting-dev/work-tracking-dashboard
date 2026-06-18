/* canvas.js — Standalone brainstorm canvas, decoupled from projects.
 *
 * Opened from the landing page (#/canvas). You create or join named "rooms";
 * each room is a live tldraw whiteboard (the vendor/orbicanvas island) synced
 * over Supabase Realtime broadcast. A room can be handed to the AI Copilot to
 * become a real project. Persistence is isolated from the normal task/project
 * sync queue (its own IndexedDB + wt_canvas_rooms / wt_canvas_room_docs tables),
 * so a Yjs blob never collides with the last-write-wins pipeline.
 *
 * Pattern mirrors chat.js / notes.js: IIFE exposing window.WTCanvas, using only
 * global helpers (DB, SupabaseDB, getSession, actorId, isCloudMode, showToast…).
 */
(function () {
  let _db = null;
  let _handle = null;       // current mounted island handle
  let _room = null;         // current room object

  function db() {
    if (_db !== null) return _db;
    try {
      _db = new Dexie('orbitrack-canvas-rooms');
      _db.version(1).stores({ rooms: '&id', docs: '&roomId' });
    } catch (_) { _db = false; }
    return _db;
  }
  const sb = () => (window.SupabaseDB && window.SupabaseDB._client) || null;
  const newId = () => (window.crypto?.randomUUID ? crypto.randomUUID() : 'room-' + Date.now() + '-' + Math.floor(Math.random() * 1e6));

  /* ── Rooms ──────────────────────────────────────────────────── */
  async function listRooms() {
    let local = [];
    try { const d = db(); if (d) local = await d.rooms.toArray(); } catch (_) {}
    if (isCloudMode() && !isOffline() && sb()) {
      try {
        const uid = actorId();
        // Shared rooms + your own private rooms.
        const { data } = await sb().from('wt_canvas_rooms').select('*').or(`is_private.eq.false,owner_id.eq.${uid}`);
        if (Array.isArray(data)) {
          const mapped = data.map(r => ({ id: r.id, name: r.name, ownerId: r.owner_id, classroomId: r.classroom_id, isPrivate: !!r.is_private, createdAt: r.created_at, updatedAt: r.updated_at }));
          try { const d = db(); if (d) await d.rooms.bulkPut(mapped); } catch (_) {}
          const byId = new Map(local.map(r => [r.id, r]));
          mapped.forEach(r => byId.set(r.id, r));
          local = [...byId.values()];
        }
      } catch (_) {}
    }
    return local.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }

  async function createRoom(name, isPrivate) {
    const now = new Date().toISOString();
    let classroomId = null;
    try { const ids = await userClassroomIds(); classroomId = Array.isArray(ids) && ids.length ? ids[0] : null; } catch (_) {}
    const room = { id: newId(), name: (name || 'Untitled canvas').slice(0, 120), ownerId: actorId(), classroomId, isPrivate: !!isPrivate, createdAt: now, updatedAt: now };
    try { const d = db(); if (d) await d.rooms.put(room); } catch (_) {}
    if (isCloudMode() && !isOffline() && sb()) {
      try { await sb().from('wt_canvas_rooms').upsert({ id: room.id, name: room.name, owner_id: room.ownerId, classroom_id: room.classroomId, is_private: room.isPrivate, created_at: now, updated_at: now }); } catch (_) {}
    }
    return room;
  }

  /* ── Doc persistence (isolated from the sync queue) ─────────────── */
  async function loadDoc(roomId) {
    try { const d = db(); const row = d ? await d.docs.get(roomId) : null; if (row?.doc) return row.doc; } catch (_) {}
    try {
      if (isCloudMode() && !isOffline() && sb()) {
        const { data } = await sb().from('wt_canvas_room_docs').select('doc').eq('room_id', roomId).maybeSingle();
        if (data?.doc) return data.doc;
      }
    } catch (_) {}
    return null;
  }
  async function saveDoc(roomId, b64) {
    const now = new Date().toISOString();
    try { const d = db(); if (d) await d.docs.put({ roomId, doc: b64, updatedAt: now }); } catch (_) {}
    try { if (isCloudMode() && !isOffline() && sb()) await sb().from('wt_canvas_room_docs').upsert({ room_id: roomId, doc: b64, updated_at: now }, { onConflict: 'room_id' }); } catch (_) {}
  }

  /* ── Views ──────────────────────────────────────────────────── */
  async function renderRoute() {
    closeRoom();
    const content = document.getElementById('content');
    if (!content) return;
    const rooms = await listRooms();
    content.innerHTML = `
      <div class="view-header">
        <div class="breadcrumb"><a href="#/projects" class="breadcrumb-link">${ICONS.arrowLeft || '←'} Projects</a><span class="breadcrumb-sep">/</span><span>Brainstorm</span></div>
      </div>
      <div class="canvas-rooms">
        <div class="canvas-rooms-head">
          <div><h1>Brainstorm canvas</h1><p class="text-muted text-sm">Sketch ideas together before they become a project. Join a shared board or start your own.</p></div>
          <button type="button" class="btn btn-primary" id="canvas-new-btn">${ICONS.plus || '+'} New canvas</button>
        </div>
        <form id="canvas-new-form" class="canvas-new-form hidden">
          <input type="text" id="canvas-new-name" class="canvas-new-name" placeholder="Canvas name (e.g. Q3 planning)" autocomplete="off" maxlength="120">
          <label class="canvas-new-private"><input type="checkbox" id="canvas-new-priv"> Private (only you)</label>
          <button type="submit" class="btn btn-primary btn-sm">Create &amp; open</button>
        </form>
        <div class="canvas-rooms-grid">
          ${rooms.length ? rooms.map(r => `
            <button type="button" class="canvas-room-card" data-room-id="${esc(String(r.id))}">
              <span class="canvas-room-name">${esc(r.name)}</span>
              <span class="canvas-room-meta">${r.isPrivate ? 'Private' : 'Shared'} · ${r.updatedAt ? timeAgo(r.updatedAt) : ''}</span>
            </button>`).join('') : '<p class="text-muted text-sm">No canvases yet — create one to start brainstorming.</p>'}
        </div>
      </div>`;

    const newBtn = content.querySelector('#canvas-new-btn');
    const form = content.querySelector('#canvas-new-form');
    newBtn?.addEventListener('click', () => { form?.classList.toggle('hidden'); content.querySelector('#canvas-new-name')?.focus(); });
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = content.querySelector('#canvas-new-name')?.value?.trim();
      const priv = content.querySelector('#canvas-new-priv')?.checked;
      const room = await createRoom(name, priv);
      openRoom(room.id);
    });
    content.querySelectorAll('.canvas-room-card').forEach(card => {
      card.addEventListener('click', () => openRoom(card.dataset.roomId));
    });
  }

  async function openRoom(roomId) {
    window.OrbiObs?.track('canvas_room_opened');
    const rooms = await listRooms();
    _room = rooms.find(r => String(r.id) === String(roomId)) || { id: roomId, name: 'Canvas' };
    const content = document.getElementById('content');
    if (!content) return;
    const canConvert = !!window.copilotCreateProjectWithTasks;
    content.innerHTML = `
      <div class="view-header canvas-room-header">
        <div class="breadcrumb"><a href="#/canvas" class="breadcrumb-link" id="canvas-back">${ICONS.arrowLeft || '←'} Canvases</a><span class="breadcrumb-sep">/</span><span>${esc(_room.name)}</span></div>
        <div class="view-actions">
          ${canConvert ? `<button type="button" class="btn btn-primary" id="canvas-to-project">${ICONS.sparkles || '✦'} Make this a project</button>` : ''}
        </div>
      </div>
      <div id="orbi-canvas-mount" class="orbi-canvas-mount"></div>`;
    content.querySelector('#canvas-back')?.addEventListener('click', () => closeRoom());
    content.querySelector('#canvas-to-project')?.addEventListener('click', () => convertToProject());

    if (!window.OrbiCanvas) {
      document.getElementById('orbi-canvas-mount').innerHTML = '<p class="text-muted" style="padding:20px">The canvas module failed to load.</p>';
      return;
    }
    const s = getSession();
    _handle = window.OrbiCanvas.mount(document.getElementById('orbi-canvas-mount'), {
      roomId,
      channelName: `canvas:room:${roomId}`,
      user: { id: s?.userId, name: s?.displayName || s?.username || 'Teammate', color: s?.color || '#38bdf8' },
      supabase: sb(),
    }, {
      loadDoc: () => loadDoc(roomId),
      saveDoc: (b64) => saveDoc(roomId, b64),
    });
  }

  function closeRoom() {
    try { _handle?.unmount?.(); } catch (_) {}
    _handle = null;
  }

  async function convertToProject() {
    const text = (_handle?.getText?.() || '').trim();
    if (!text) { showToast('Add some notes to the canvas first', 'warning'); return; }
    if (window.WTCopilot?.proposeFromText) {
      window.WTCopilot.proposeFromText(`Turn this brainstorm into a project:\n${text}`);
    } else {
      showToast('AI Copilot is not available in this build', 'info');
    }
  }

  window.WTCanvas = { renderRoute, openRoom, createRoom, listRooms, convertToProject };
})();
