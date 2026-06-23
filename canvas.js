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
  let _mobileReadonly = false;
  let _modeTimer = null;

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
  function currentThemeMode() {
    try {
      if (document.documentElement.dataset.theme === 'black' || document.body.classList.contains('theme-black')) return 'black';
    } catch (_) {}
    return 'normal';
  }
  function isMobileCanvasView() {
    try {
      return window.matchMedia('(max-width: 760px)').matches
        || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    } catch (_) {
      return window.innerWidth <= 760;
    }
  }
  function syncCanvasMode() {
    const mount = document.getElementById('orbi-canvas-mount');
    if (!mount || !_handle) return;
    _mobileReadonly = isMobileCanvasView();
    mount.classList.toggle('orbi-canvas-mobile-readonly', _mobileReadonly);
    mount.classList.toggle('orbi-canvas-readonly', _mobileReadonly);
    try { _handle.setReadonly?.(_mobileReadonly); } catch (_) {}
  }
  function scheduleCanvasModeSync() {
    clearTimeout(_modeTimer);
    _modeTimer = setTimeout(() => {
      syncCanvasMode();
      if (_handle) window.dispatchEvent(new Event('resize'));
    }, 120);
  }

  function normalizeNotePayload(input) {
    if (!input) return null;
    if (typeof input === 'string') {
      const text = input.trim();
      return text ? { type: 'personal-note', title: '', text } : null;
    }
    const title = String(input.title || input.noteTitle || '').trim().slice(0, 140);
    const text = String(input.text || input.content || '').replace(/\s+\n/g, '\n').trim().slice(0, 2000);
    if (!title && !text) return null;
    return {
      type: 'personal-note',
      noteId: input.noteId || input.id || null,
      title,
      text,
      updatedAt: input.updatedAt || ''
    };
  }

  function parseDroppedNote(dataTransfer) {
    if (!dataTransfer) return null;
    const json = dataTransfer.getData('application/x-wt-note-json');
    if (json) {
      try { return normalizeNotePayload(JSON.parse(json)); } catch (_) {}
    }
    return normalizeNotePayload(
      dataTransfer.getData('application/x-wt-note')
      || dataTransfer.getData('text/plain')
      || ''
    );
  }

  function isNoteTransfer(dataTransfer) {
    const types = Array.from(dataTransfer?.types || []);
    return types.includes('application/x-wt-note-json')
      || types.includes('application/x-wt-note')
      || types.includes('text/plain');
  }

  function addNoteFromPayload(payload, clientX = null, clientY = null) {
    if (!_handle?.addNote) return false;
    if (_mobileReadonly || isMobileCanvasView()) {
      showToast?.('Canvas is read-only on mobile', 'info');
      return false;
    }
    const note = normalizeNotePayload(payload);
    if (!note) return false;
    let x = clientX;
    let y = clientY;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      const mount = document.getElementById('orbi-canvas-mount');
      const rect = mount?.getBoundingClientRect?.();
      x = rect ? rect.left + rect.width * 0.5 : window.innerWidth * 0.5;
      y = rect ? rect.top + rect.height * 0.5 : window.innerHeight * 0.5;
    }
    return !!_handle.addNote(note, x, y);
  }

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
    _mobileReadonly = isMobileCanvasView();
    const theme = currentThemeMode();
    content.innerHTML = `
      <div class="view-header canvas-room-header">
        <div class="breadcrumb"><a href="#/canvas" class="breadcrumb-link" id="canvas-back">${ICONS.arrowLeft || '←'} Canvases</a><span class="breadcrumb-sep">/</span><span>${esc(_room.name)}</span></div>
        <div class="view-actions">
          <button type="button" class="btn btn-ghost" id="canvas-notes" title="Open notes — drag a note onto the canvas">${ICONS.edit || '✎'} Notes</button>
          <button type="button" class="btn btn-ghost" id="canvas-fs" title="Fullscreen (Esc to exit)">⛶ Fullscreen</button>
          ${canConvert ? `<button type="button" class="btn btn-primary" id="canvas-to-project">${ICONS.sparkles || '✦'} Make this a project</button>` : ''}
        </div>
      </div>
      <div id="orbi-canvas-mount" class="orbi-canvas-mount${_mobileReadonly ? ' orbi-canvas-mobile-readonly orbi-canvas-readonly' : ''}" data-canvas-theme="${theme}"></div>`;
    // Opening a room never changes the hash (it's still #/canvas), so a plain
    // <a href="#/canvas"> fires no hashchange and the user gets stuck. Re-render
    // the room list directly instead (renderRoute() unmounts the island first).
    content.querySelector('#canvas-back')?.addEventListener('click', (e) => { e.preventDefault(); renderRoute(); });
    content.querySelector('#canvas-to-project')?.addEventListener('click', () => convertToProject());
    content.querySelector('#canvas-notes')?.addEventListener('click', () => window.WTNotes?.open?.());
    content.querySelector('#canvas-fs')?.addEventListener('click', () => toggleFullscreen());

    const mountEl = document.getElementById('orbi-canvas-mount');
    if (!window.OrbiCanvas) {
      mountEl.innerHTML = '<p class="text-muted" style="padding:20px">The canvas module failed to load.</p>';
      return;
    }
    const s = getSession();
    _handle = window.OrbiCanvas.mount(mountEl, {
      roomId,
      channelName: `canvas:room:${roomId}`,
      user: { id: s?.userId, name: s?.displayName || s?.username || 'Teammate', color: s?.color || '#38bdf8' },
      supabase: sb(),
      readonly: _mobileReadonly,
      mobileReadonly: _mobileReadonly,
      theme,
    }, {
      loadDoc: () => loadDoc(roomId),
      saveDoc: (b64) => saveDoc(roomId, b64),
    });
    syncCanvasMode();

    // Drag a note from the notes panel onto the canvas and drop it as a text box.
    let dragDepth = 0;
    mountEl.addEventListener('dragenter', (e) => {
      if (_mobileReadonly) return;
      if (!isNoteTransfer(e.dataTransfer)) return;
      dragDepth += 1;
      mountEl.classList.add('is-note-dragover');
    });
    mountEl.addEventListener('dragleave', () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) mountEl.classList.remove('is-note-dragover');
    });
    mountEl.addEventListener('dragover', (e) => {
      if (_mobileReadonly) return;
      if (!isNoteTransfer(e.dataTransfer)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    mountEl.addEventListener('drop', (e) => {
      if (_mobileReadonly) {
        e.preventDefault();
        mountEl.classList.remove('is-note-dragover');
        showToast?.('Canvas is read-only on mobile', 'info');
        return;
      }
      const payload = parseDroppedNote(e.dataTransfer);
      if (!payload) return;
      e.preventDefault();
      dragDepth = 0;
      mountEl.classList.remove('is-note-dragover');
      if (addNoteFromPayload(payload, e.clientX, e.clientY)) showToast?.('Note added to canvas', 'success');
    });
  }

  // Figma-style fullscreen: the tldraw mount (with its own side panels/toolbars)
  // expands to fill the viewport; toggle off via the button or Escape.
  function toggleFullscreen() {
    const m = document.getElementById('orbi-canvas-mount');
    if (!m) return;
    const on = m.classList.toggle('orbi-canvas-fullscreen');
    document.body.classList.toggle('canvas-fs-lock', on);
    if (on) {
      let controls = document.getElementById('canvas-fs-controls');
      if (!controls) {
        controls = document.createElement('div');
        controls.id = 'canvas-fs-controls';
        controls.className = 'canvas-fs-controls';
        const boardsBtn = document.createElement('button');
        const exitBtn = document.createElement('button');
        const notesBtn = document.createElement('button');
        boardsBtn.id = 'canvas-fs-boards';
        boardsBtn.type = 'button';
        boardsBtn.className = 'canvas-fs-btn canvas-fs-boards';
        boardsBtn.textContent = 'Boards';
        boardsBtn.title = 'Return to the canvas list';
        boardsBtn.addEventListener('click', () => {
          if (m.classList.contains('orbi-canvas-fullscreen')) toggleFullscreen();
          renderRoute();
        });
        exitBtn.id = 'canvas-fs-exit';
        exitBtn.type = 'button';
        exitBtn.className = 'canvas-fs-btn canvas-fs-exit';
        exitBtn.textContent = 'Exit';
        exitBtn.addEventListener('click', toggleFullscreen);
        notesBtn.id = 'canvas-fs-notes';
        notesBtn.type = 'button';
        notesBtn.className = 'canvas-fs-btn canvas-fs-notes';
        notesBtn.textContent = 'Notes';
        notesBtn.title = 'Open notes and drag notes onto the canvas';
        notesBtn.addEventListener('click', () => window.WTNotes?.open?.());
        controls.append(boardsBtn, notesBtn, exitBtn);
        m.appendChild(controls);
      }
      document.addEventListener('keydown', _onFsEsc);
    } else {
      document.getElementById('canvas-fs-controls')?.remove();
      document.removeEventListener('keydown', _onFsEsc);
    }
    // Nudge tldraw to re-measure its container.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  }
  function _onFsEsc(e) { if (e.key === 'Escape') toggleFullscreen(); }

  function closeRoom() {
    try { _handle?.unmount?.(); } catch (_) {}
    _handle = null;
    _mobileReadonly = false;
    clearTimeout(_modeTimer);
    document.getElementById('canvas-fs-controls')?.remove();
    document.body.classList.remove('canvas-fs-lock');
    document.removeEventListener('keydown', _onFsEsc);
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

  // Tear down the live island (unsubscribe the Realtime channel, unmount tldraw)
  // whenever the user navigates away from the canvas route via the sidebar or a
  // breadcrumb — otherwise the room's channel subscription leaks.
  window.addEventListener('hashchange', () => {
    const h = (window.location.hash || '').slice(1);
    if (h !== '/canvas' && _handle) closeRoom();
  });
  window.addEventListener('wt-notes-panel-toggle', () => {
    if (!_handle) return;
    setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
  });
  window.addEventListener('resize', scheduleCanvasModeSync);
  window.addEventListener('orientationchange', scheduleCanvasModeSync);
  window.addEventListener('wt-theme-changed', (event) => {
    if (!_handle) return;
    const theme = event?.detail?.theme || currentThemeMode();
    const mount = document.getElementById('orbi-canvas-mount');
    if (mount) mount.dataset.canvasTheme = theme;
    try { _handle.setTheme?.(theme); } catch (_) {}
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  });

  window.WTCanvas = {
    renderRoute,
    openRoom,
    createRoom,
    listRooms,
    convertToProject,
    addNoteFromPayload,
    isRoomOpen: () => !!_handle,
    isFullscreen: () => !!document.querySelector('.orbi-canvas-fullscreen')
  };
})();
