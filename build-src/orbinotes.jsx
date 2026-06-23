/* orbinotes.jsx - Quill rich-text editor island for Orbitask notes.
 *
 * Stable API:
 *   window.OrbiNotes.mount(container, { initialHTML, placeholder, theme }, { onChangeHTML })
 *
 * Returns:
 *   { getHTML, setHTML, focus, unmount }
 *
 * Rebuild after editing: npm run build:orbinotes
 */
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const handles = new WeakMap();

function htmlOrEmpty(html) {
  const value = String(html || '');
  return value === '<p><br></p>' ? '' : value;
}

function pasteHTML(quill, html) {
  const value = htmlOrEmpty(html);
  try {
    quill.setText('', 'silent');
    if (value) quill.clipboard.dangerouslyPasteHTML(0, value, 'silent');
  } catch (_) {
    try {
      quill.root.innerHTML = value;
    } catch (_) {}
  }
}

function mount(container, data = {}, handlers = {}) {
  if (!container) return null;
  const existing = handles.get(container);
  if (existing) {
    try { existing.unmount(); } catch (_) {}
  }

  container.innerHTML = '';
  container.classList.add('orbinotes-mounted');

  const editor = document.createElement('div');
  editor.className = 'orbinotes-quill-host';
  container.appendChild(editor);

  const quill = new Quill(editor, {
    theme: data.theme || 'snow',
    placeholder: data.placeholder || 'Write a note...',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'blockquote', 'code-block'],
        ['clean']
      ]
    }
  });

  pasteHTML(quill, data.initialHTML || '');

  const emit = () => {
    try {
      handlers.onChangeHTML && handlers.onChangeHTML(htmlOrEmpty(quill.root.innerHTML));
    } catch (_) {}
  };
  quill.on('text-change', emit);

  const handle = {
    getHTML() {
      return htmlOrEmpty(quill.root.innerHTML);
    },
    setHTML(html) {
      pasteHTML(quill, html);
    },
    focus() {
      try { quill.focus(); } catch (_) {}
    },
    unmount() {
      try { quill.off('text-change', emit); } catch (_) {}
      try { container.innerHTML = ''; } catch (_) {}
      try { container.classList.remove('orbinotes-mounted'); } catch (_) {}
      handles.delete(container);
    }
  };

  handles.set(container, handle);
  return handle;
}

window.OrbiNotes = { mount };
