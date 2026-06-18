/* notes.js - personal notes panel for WorkTracker. */

(function () {
/* ──── UI v3: Personal notes panel ──── */
let _notesPanelOpen = false;
let _notesSaveTimers = {};
function formatNoteTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch (_) { return ''; }
}

async function renderNotesPanel(focusNoteId = null) {
  const list = document.getElementById('notes-panel-list');
  const searchEl = document.getElementById('notes-panel-search');
  if (searchEl && searchEl.value !== (state.notesSearch || '')) searchEl.value = state.notesSearch || '';
  if (!list || !DB.getPersonalNotes) return;
  const uid = getSession()?.userId;
  if (!uid) { list.innerHTML = '<p class="notes-panel-empty">Sign in to use notes.</p>'; return; }
  const q = (state.notesSearch || '').trim().toLowerCase();
  let notes = await DB.getPersonalNotes(uid);
  if (q) notes = notes.filter(n => (n.content || '').toLowerCase().includes(q));
  if (!notes.length) {
    list.innerHTML = `<p class="notes-panel-empty">${q ? 'No notes match your search.' : 'Click + to add your first note.'}</p>`;
    return;
  }
  list.innerHTML = notes.map((n, i) => `
    <div class="note-editor-wrap" data-note-id="${n.id}" style="animation-delay:${Math.min(i * 40, 200)}ms">
      <div class="notes-sticky-top">
        <span class="notes-sticky-time">${esc(formatNoteTime(n.updatedAt || n.createdAt))}</span>
        <button type="button" class="notes-sticky-delete" data-action="delete-personal-note" data-id="${n.id}" title="Delete note" aria-label="Delete note">×</button>
      </div>
      <div class="note-quill-editor" data-note-id="${n.id}">${n.content || ''}</div>
    </div>`).join('');
  if (window.Quill) _initNoteEditors(focusNoteId);
}

function _initNoteEditors(focusNoteId = null) {
  const list = document.getElementById('notes-panel-list');
  if (!list) return;
  list.querySelectorAll('.note-quill-editor:not([data-quill-initialized])').forEach(edEl => {
    const noteId = Number(edEl.dataset.noteId);
    edEl.setAttribute('data-quill-initialized', 'true');
    const editor = new Quill(edEl, {
      theme: 'snow',
      modules: { toolbar: ['bold', 'italic', 'underline', { list: 'bullet' }, { list: 'ordered' }, 'link'] }
    });
    editor.on('text-change', () => {
      const html = editor.root.innerHTML;
      scheduleNoteSave(noteId, html);
    });
    if (focusNoteId === noteId) {
      requestAnimationFrame(() => editor.focus());
    }
  });
}
function openNotesPanel() {
  const panel = document.getElementById('notes-panel');
  const backdrop = document.getElementById('notes-backdrop');
  if (!panel) return;
  _notesPanelOpen = true;
  document.body.classList.add('notes-panel-open');
  panel.classList.remove('hidden');
  backdrop?.classList.remove('hidden');
  renderNotesPanel();
  window.WTChat?.renderDock?.().catch(() => {});
}
function closeNotesPanel() {
  _notesPanelOpen = false;
  document.body.classList.remove('notes-panel-open');
  document.getElementById('notes-panel')?.classList.add('hidden');
  document.getElementById('notes-backdrop')?.classList.add('hidden');
  window.WTChat?.renderDock?.().catch(() => {});
}
function scheduleNoteSave(id, content) {
  clearTimeout(_notesSaveTimers[id]);
  _notesSaveTimers[id] = setTimeout(async () => {
    if (DB.updatePersonalNote) await DB.updatePersonalNote(Number(id), { content });
  }, 400);
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
  const id = await DB.createPersonalNote({ userId: uid, content: '' });
  await renderNotesPanel(id);
}

async function toggleDone(btn) {
  const id = Number(btn.dataset.id);
  if (!id || !DB.updatePersonalNote) return;
  await DB.updatePersonalNote(id, { done: btn.checked });
  await renderNotesPanel();
}

async function deleteNote(btn) {
  const id = Number(btn.dataset.id);
  if (!id || !DB.deletePersonalNote) return;
  await DB.deletePersonalNote(id);
  await renderNotesPanel();
}

let _notesEventsBound = false;
function bindEvents() {
  if (_notesEventsBound) return;
  _notesEventsBound = true;
  document.getElementById('notes-panel-search')?.addEventListener('input', (e) => {
    state.notesSearch = e.target.value || '';
    renderNotesPanel();
  });
  document.getElementById('notes-panel-list')?.addEventListener('input', (e) => {
    const ta = e.target.closest('[data-note-edit]');
    if (ta) scheduleNoteSave(ta.dataset.noteEdit, ta.value);
  });
  document.getElementById('notes-backdrop')?.addEventListener('click', closeNotesPanel);
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
  toggleDone
};
})();
