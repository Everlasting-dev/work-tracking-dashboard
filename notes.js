/* notes.js - notebook-style personal notes panel for Orbitask. */

(function () {
let _notesPanelOpen = false;
let _activeNoteId = null;
let _noteEditor = null;
let _notesSaveTimers = {};
let _noteSavePatches = {};
let _notesEventsBound = false;
let _renderSerial = 0;

function stripNoteHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = String(html || '');
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function deriveNoteTitle(note) {
  const title = String(note?.title || '').trim();
  if (title) return title.slice(0, 90);
  const text = stripNoteHtml(note?.content || '');
  return (text ? text.slice(0, 90) : 'Untitled note');
}

function noteExcerpt(note) {
  const text = stripNoteHtml(note?.content || '');
  if (!text) return 'No content yet.';
  return text.length > 110 ? `${text.slice(0, 110)}...` : text;
}

function formatNoteStamp(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    return sameDay
      ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (_) {
    return '';
  }
}

function noteIdFromEventTarget(target) {
  return Number(target?.closest?.('[data-note-id]')?.dataset?.noteId || target?.dataset?.id || 0);
}

function renderShell({ signedIn = true, notes = [], filtered = [], activeNote = null, query = '' } = {}) {
  const panel = document.getElementById('notes-panel');
  if (!panel) return;
  const hasNotes = notes.length > 0;
  const canvasOpen = !!window.WTCanvas?.isRoomOpen?.();
  const emptyMessage = signedIn
    ? (query ? 'No notes match your search.' : 'Create a note to start collecting ideas, tasks, and tiny sparks.')
    : 'Sign in to use notes.';

  panel.innerHTML = `
    <div class="notes-panel-head">
      <div class="notes-panel-title">
        <h2>Notes</h2>
        <span>${hasNotes ? `${notes.length} note${notes.length === 1 ? '' : 's'}` : 'Personal notebook'}</span>
      </div>
      <button type="button" class="notes-panel-add-btn" data-notes-action="add" title="New note" aria-label="New note">+</button>
      <button type="button" class="btn-icon" data-notes-action="close" aria-label="Close notes">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div class="notes-notebook">
      <aside class="notes-list-pane">
        <div class="notes-panel-search-wrap">
          <svg class="notes-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="notes-panel-search" class="notes-panel-search" placeholder="Search notes..." value="${esc(query)}" autocomplete="off" aria-label="Search notes">
        </div>
        <div class="notes-panel-list" id="notes-panel-list">
          ${signedIn && filtered.length ? filtered.map(n => `
            <button type="button" class="notes-list-item ${Number(n.id) === Number(activeNote?.id) ? 'active' : ''}" data-notes-action="select" data-note-id="${n.id}" draggable="true" data-note-title="${esc(deriveNoteTitle(n))}" data-note-text="${esc(stripNoteHtml(n.content || '').slice(0, 1600))}" title="Drag onto the brainstorm canvas to drop it as a text box">
              <span class="notes-list-title">${esc(deriveNoteTitle(n))}</span>
              <span class="notes-list-excerpt">${esc(noteExcerpt(n))}</span>
              <span class="notes-list-meta">${esc(formatNoteStamp(n.updatedAt || n.createdAt))}</span>
            </button>
          `).join('') : `<p class="notes-panel-empty">${esc(emptyMessage)}</p>`}
        </div>
      </aside>
      <section class="notes-editor-pane">
        ${activeNote ? `
          <div class="notes-editor-head" data-note-id="${activeNote.id}">
            <input class="notes-title-input" data-notes-title value="${esc(activeNote.title || '')}" placeholder="${esc(deriveNoteTitle(activeNote))}" maxlength="140" autocomplete="off">
            <div class="notes-editor-actions">
              <span class="notes-save-status" id="notes-save-status">Saved</span>
              ${canvasOpen ? `<button type="button" class="btn btn-sm btn-ghost" data-notes-action="send-canvas" data-note-id="${activeNote.id}">Add to canvas</button>` : ''}
              <button type="button" class="btn btn-sm btn-ghost" data-notes-action="import-tasks" data-note-id="${activeNote.id}">Import tasks</button>
              <button type="button" class="btn-icon notes-delete-btn" data-notes-action="delete" data-note-id="${activeNote.id}" title="Delete note" aria-label="Delete note">×</button>
            </div>
          </div>
          <div class="notes-editor-meta">
            <span>${esc(formatNoteStamp(activeNote.updatedAt || activeNote.createdAt)) || 'New note'}</span>
            <span>Autosaves as you type</span>
          </div>
          <div id="notes-active-editor" class="note-blocknote-editor notes-active-editor" data-note-id="${activeNote.id}"></div>
        ` : `
          <div class="notes-editor-empty">
            <strong>${signedIn ? 'Pick a note or create a new one.' : 'Notes are available after sign-in.'}</strong>
            <span>${signedIn ? 'Your ideas, meeting fragments, and quick task drafts live here.' : 'Sign in to sync your notebook.'}</span>
          </div>
        `}
      </section>
    </div>`;
}

async function renderNotesPanel(focusNoteId = null) {
  const serial = ++_renderSerial;
  const uid = getSession()?.userId;
  _teardownActiveEditor();
  if (!uid || !DB.getPersonalNotes) {
    renderShell({ signedIn: false });
    return;
  }

  const query = (state.notesSearch || '').trim().toLowerCase();
  let notes = await DB.getPersonalNotes(uid);
  if (serial !== _renderSerial) return;
  notes = (notes || []).map(n => ({
    ...n,
    title: n.title || ''
  }));
  const filtered = query
    ? notes.filter(n => `${deriveNoteTitle(n)} ${stripNoteHtml(n.content || '')}`.toLowerCase().includes(query))
    : notes;

  if (focusNoteId) _activeNoteId = Number(focusNoteId);
  if (!_activeNoteId || !notes.some(n => Number(n.id) === Number(_activeNoteId))) {
    _activeNoteId = filtered[0]?.id || notes[0]?.id || null;
  }
  if (query && !filtered.some(n => Number(n.id) === Number(_activeNoteId))) {
    _activeNoteId = filtered[0]?.id || null;
  }
  const activeNote = notes.find(n => Number(n.id) === Number(_activeNoteId)) || null;
  renderShell({ signedIn: true, notes, filtered, activeNote, query: state.notesSearch || '' });
  _mountActiveEditor(activeNote);
}

// Lightweight fallback rich-text editor. It stores HTML, matching the Quill
// island's contract, and keeps notes usable if a packaged editor bundle fails.
function mountRichEditor(container, initialHTML, onChange, opts = {}) {
  if (!container) return { getHTML() { return ''; }, setHTML() {}, unmount() {}, focus() {} };
  container.innerHTML = `
    <div class="rte">
      <div class="rte-toolbar" contenteditable="false">
        <button type="button" class="rte-btn" data-cmd="bold" title="Bold"><b>B</b></button>
        <button type="button" class="rte-btn" data-cmd="italic" title="Italic"><i>I</i></button>
        <button type="button" class="rte-btn" data-cmd="underline" title="Underline"><u>U</u></button>
        <button type="button" class="rte-btn" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
        <span class="rte-sep"></span>
        <button type="button" class="rte-btn" data-cmd="insertUnorderedList" title="Bullet list">•</button>
        <button type="button" class="rte-btn" data-cmd="insertOrderedList" title="Numbered list">1.</button>
      </div>
      <div class="rte-area" contenteditable="true" spellcheck="true" data-placeholder="${esc(opts.placeholder || 'Write a note...')}"></div>
    </div>`;
  const area = container.querySelector('.rte-area');
  area.innerHTML = initialHTML || '';
  const emit = () => onChange && onChange(area.innerHTML);
  container.querySelectorAll('.rte-btn').forEach(b => {
    b.addEventListener('mousedown', (e) => {
      e.preventDefault();
      area.focus();
      try { document.execCommand(b.dataset.cmd, false, null); } catch (_) {}
      emit();
    });
  });
  area.addEventListener('input', emit);
  return {
    getHTML() { return area.innerHTML; },
    setHTML(html) { area.innerHTML = html || ''; },
    unmount() { try { container.innerHTML = ''; } catch (_) {} },
    focus() { try { area.focus(); } catch (_) {} }
  };
}

function mountPreferredEditor(container, initialHTML, onChange, opts = {}) {
  if (!container) return { getHTML() { return ''; }, setHTML() {}, unmount() {}, focus() {} };
  // Always use the built-in contenteditable editor. The BlockNote island
  // (window.OrbiNotes) mounts without throwing but renders a blank, non-typeable
  // box in packaged Electron builds, so the try/catch fallback never triggered.
  // See memory: notes-editor. Do not reintroduce OrbiNotes without verifying a
  // packaged dist build actually renders it.
  return mountRichEditor(container, initialHTML, onChange, opts);
}

function _mountActiveEditor(note) {
  if (!note) return;
  const editorEl = document.getElementById('notes-active-editor');
  if (!editorEl) return;
  _noteEditor = mountPreferredEditor(editorEl, note.content || '', (html) => {
    scheduleNoteSave(note.id, { content: html });
  }, { placeholder: 'Write the useful version. Bullets, links, fragments, anything.' });
  setTimeout(() => _noteEditor?.focus?.(), 40);
}

function _teardownActiveEditor() {
  try { _noteEditor?.unmount?.(); } catch (_) {}
  _noteEditor = null;
}

function openNotesPanel(focusNoteId = null) {
  const panel = document.getElementById('notes-panel');
  const backdrop = document.getElementById('notes-backdrop');
  if (!panel) return;
  _notesPanelOpen = true;
  document.body.classList.add('notes-panel-open');
  panel.classList.remove('hidden');
  backdrop?.classList.remove('hidden');
  renderNotesPanel(focusNoteId);
  window.dispatchEvent(new CustomEvent('wt-notes-panel-toggle', { detail: { open: true } }));
  window.WTChat?.renderDock?.().catch(() => {});
}

function closeNotesPanel() {
  _notesPanelOpen = false;
  _teardownActiveEditor();
  document.body.classList.remove('notes-panel-open');
  document.getElementById('notes-panel')?.classList.add('hidden');
  document.getElementById('notes-backdrop')?.classList.add('hidden');
  window.dispatchEvent(new CustomEvent('wt-notes-panel-toggle', { detail: { open: false } }));
  window.WTChat?.renderDock?.().catch(() => {});
}

function scheduleNoteSave(id, patchOrContent) {
  const noteId = Number(id);
  if (!noteId || !DB.updatePersonalNote) return;
  const patch = typeof patchOrContent === 'string' ? { content: patchOrContent } : (patchOrContent || {});
  _noteSavePatches[noteId] = { ...(_noteSavePatches[noteId] || {}), ...patch };
  const status = document.getElementById('notes-save-status');
  if (status) status.textContent = 'Saving...';
  clearTimeout(_notesSaveTimers[noteId]);
  _notesSaveTimers[noteId] = setTimeout(async () => {
    const nextPatch = _noteSavePatches[noteId] || {};
    delete _noteSavePatches[noteId];
    try {
      await DB.updatePersonalNote(noteId, nextPatch);
      const saved = document.getElementById('notes-save-status');
      if (saved && Number(_activeNoteId) === noteId) saved.textContent = 'Saved';
    } catch (err) {
      console.warn('[notes] save failed', err);
      const failed = document.getElementById('notes-save-status');
      if (failed && Number(_activeNoteId) === noteId) failed.textContent = 'Save failed';
      showToast?.('Could not save note', 'error');
    }
  }, 420);
}

function isOpen() {
  return _notesPanelOpen;
}

function toggle() {
  return _notesPanelOpen ? closeNotesPanel() : openNotesPanel();
}

async function addNote() {
  const uid = getSession()?.userId;
  if (!uid || !DB.createPersonalNote) return;
  const id = await DB.createPersonalNote({ userId: uid, title: '', content: '' });
  _activeNoteId = id;
  await renderNotesPanel(id);
}

async function deleteNote(btnOrId) {
  const id = Number((typeof btnOrId === 'number' || typeof btnOrId === 'string') ? btnOrId : (btnOrId?.dataset?.id || btnOrId?.dataset?.noteId || noteIdFromEventTarget(btnOrId)));
  if (!id || !DB.deletePersonalNote) return;
  await DB.deletePersonalNote(id);
  if (Number(_activeNoteId) === id) _activeNoteId = null;
  await renderNotesPanel();
}

async function toggleDone(btn) {
  const id = Number(btn.dataset.id);
  if (!id || !DB.updatePersonalNote) return;
  await DB.updatePersonalNote(id, { done: btn.checked });
  await renderNotesPanel();
}

async function importActiveNoteTasks(noteId) {
  const id = Number(noteId || _activeNoteId);
  if (!id) return;
  if (_noteEditor?.getHTML && Number(_activeNoteId) === id) {
    scheduleNoteSave(id, { content: _noteEditor.getHTML() });
  }
  const notes = await DB.getPersonalNotes(getSession()?.userId);
  const note = (notes || []).find(n => Number(n.id) === id);
  const liveHTML = Number(_activeNoteId) === id && _noteEditor?.getHTML ? _noteEditor.getHTML() : '';
  const text = stripNoteHtml(liveHTML || note?.content || '');
  if (!text.trim()) {
    showToast?.('This note has no task text yet', 'warning');
    return;
  }
  if (window.WTTasks?.importFromText) {
    window.WTTasks.importFromText(text, { source: 'note', noteId: id, title: deriveNoteTitle(note) });
  } else if (window.WTCopilot?.proposeFromText) {
    window.WTCopilot.proposeFromText(text);
  } else {
    showToast?.('Task import is not available yet', 'warning');
  }
}

async function notePayload(noteId) {
  const id = Number(noteId || _activeNoteId);
  if (!id || !DB.getPersonalNotes) return null;
  if (_noteEditor?.getHTML && Number(_activeNoteId) === id) {
    scheduleNoteSave(id, { content: _noteEditor.getHTML() });
  }
  const notes = await DB.getPersonalNotes(getSession()?.userId);
  const note = (notes || []).find(n => Number(n.id) === id);
  if (!note) return null;
  const liveHTML = Number(_activeNoteId) === id && _noteEditor?.getHTML ? _noteEditor.getHTML() : '';
  const text = stripNoteHtml(liveHTML || note.content || '');
  return {
    type: 'personal-note',
    noteId: id,
    title: deriveNoteTitle({ ...note, content: liveHTML || note.content || '' }),
    text: text.slice(0, 2000),
    updatedAt: note.updatedAt || note.createdAt || ''
  };
}

async function sendActiveNoteToCanvas(noteId) {
  const payload = await notePayload(noteId);
  if (!payload || !(payload.text || payload.title || '').trim()) {
    showToast?.('This note has no text to add yet', 'warning');
    return;
  }
  if (!window.WTCanvas?.addNoteFromPayload?.(payload)) {
    showToast?.('Open a canvas first, then add this note', 'warning');
    return;
  }
  showToast?.('Note added to canvas', 'success');
  if (window.matchMedia?.('(max-width: 760px)').matches) closeNotesPanel();
}

function bindEvents() {
  if (_notesEventsBound) return;
  _notesEventsBound = true;
  document.getElementById('notes-backdrop')?.addEventListener('click', closeNotesPanel);
  // Drag a note from the list onto the brainstorm canvas (handled in canvas.js).
  document.addEventListener('dragstart', (e) => {
    const item = e.target.closest?.('.notes-list-item[draggable="true"]');
    if (!item || !e.dataTransfer) return;
    const payload = {
      type: 'personal-note',
      noteId: Number(item.dataset.noteId || 0) || null,
      title: item.dataset.noteTitle || item.querySelector('.notes-list-title')?.textContent || 'Note',
      text: item.dataset.noteText || ''
    };
    const plain = [payload.title, payload.text].filter(Boolean).join('\n\n');
    e.dataTransfer.setData('application/x-wt-note-json', JSON.stringify(payload));
    e.dataTransfer.setData('application/x-wt-note', plain);
    e.dataTransfer.setData('text/plain', plain);
    e.dataTransfer.effectAllowed = 'copy';
  });
  document.addEventListener('click', async (e) => {
    const actionEl = e.target.closest('[data-notes-action]');
    if (!actionEl) return;
    const panel = actionEl.closest('#notes-panel');
    if (!panel) return;
    e.preventDefault();
    e.stopPropagation();
    const action = actionEl.dataset.notesAction;
    if (action === 'close') closeNotesPanel();
    else if (action === 'add') await addNote();
    else if (action === 'select') {
      _activeNoteId = Number(actionEl.dataset.noteId);
      await renderNotesPanel(_activeNoteId);
    } else if (action === 'delete') {
      await deleteNote(actionEl.dataset.noteId);
    } else if (action === 'import-tasks') {
      await importActiveNoteTasks(actionEl.dataset.noteId);
    } else if (action === 'send-canvas') {
      await sendActiveNoteToCanvas(actionEl.dataset.noteId);
    }
  });
  document.addEventListener('input', (e) => {
    const search = e.target.closest('#notes-panel-search');
    if (search) {
      state.notesSearch = search.value || '';
      renderNotesPanel(_activeNoteId);
      return;
    }
    const titleInput = e.target.closest('[data-notes-title]');
    if (titleInput) {
      const id = noteIdFromEventTarget(titleInput);
      scheduleNoteSave(id, { title: titleInput.value || '' });
      const activeRow = document.querySelector(`.notes-list-item.active[data-note-id="${id}"] .notes-list-title`);
      if (activeRow) activeRow.textContent = titleInput.value.trim() || titleInput.getAttribute('placeholder') || 'Untitled note';
    }
  });
}

window.WTNotes = {
  open: openNotesPanel,
  close: closeNotesPanel,
  toggle,
  renderPanel: renderNotesPanel,
  scheduleSave: scheduleNoteSave,
  isOpen,
  bindEvents,
  addNote,
  deleteNote,
  toggleDone,
  mountEditor: mountPreferredEditor
};
})();
