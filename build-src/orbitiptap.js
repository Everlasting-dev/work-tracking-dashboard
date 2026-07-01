/* orbitiptap.js — TipTap-powered rich-text editor for the Notes panel.
 *
 * The legacy notes editor used document.execCommand('insertOrderedList' /
 * 'insertUnorderedList'), which is notoriously buggy for bullets/numbering.
 * This island swaps in TipTap (ProseMirror), whose schema-driven lists behave
 * correctly and sanitize pastes for free. Bundled by esbuild into
 * vendor/orbitiptap/orbitiptap.js (IIFE) exposing window.OrbiTipTap.mount(...),
 * which matches the editor contract notes.js expects:
 *   { getHTML(), setHTML(html), unmount(), focus() }
 *
 * It builds the same .rte / .rte-toolbar / .rte-btn DOM the fallback editor uses
 * so it inherits existing theming; only list/heading rendering needs extra CSS.
 *
 * Rebuild after editing:  npm run build:orbitiptap
 * Roll back: remove the <script> tag in index.html, this file, and the
 * window.OrbiTipTap branch in notes.js mountPreferredEditor().
 */
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const TOOLBAR = `
  <div class="rte-toolbar" contenteditable="false">
    <button type="button" class="rte-btn" data-cmd="bold" title="Bold"><b>B</b></button>
    <button type="button" class="rte-btn" data-cmd="italic" title="Italic"><i>I</i></button>
    <button type="button" class="rte-btn" data-cmd="strike" title="Strikethrough"><s>S</s></button>
    <span class="rte-sep"></span>
    <button type="button" class="rte-btn" data-cmd="h2" title="Heading">H</button>
    <button type="button" class="rte-btn" data-cmd="bullet" title="Bullet list">&bull;</button>
    <button type="button" class="rte-btn" data-cmd="ordered" title="Numbered list">1.</button>
    <button type="button" class="rte-btn" data-cmd="quote" title="Quote">&ldquo;</button>
    <button type="button" class="rte-btn" data-cmd="code" title="Code block">&lt;/&gt;</button>
  </div>`;

const NOOP = { getHTML() { return ''; }, setHTML() {}, unmount() {}, focus() {} };

function mount(container, initialHTML, onChange, opts = {}) {
  if (!container) return NOOP;

  container.innerHTML = `<div class="rte rte--tiptap">${TOOLBAR}<div class="rte-area" data-tt-host></div></div>`;
  const toolbar = container.querySelector('.rte-toolbar');
  const host = container.querySelector('[data-tt-host]');

  const editor = new Editor({
    element: host,
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: initialHTML || '',
    editorProps: { attributes: { 'data-placeholder': opts.placeholder || 'Write a note…' } },
    onUpdate: ({ editor }) => { try { onChange && onChange(editor.getHTML()); } catch (_) {} },
  });

  // data-cmd → command + the isActive() key used to light the button up.
  const RUN = {
    bold: (c) => c.toggleBold(),
    italic: (c) => c.toggleItalic(),
    strike: (c) => c.toggleStrike(),
    h2: (c) => c.toggleHeading({ level: 2 }),
    bullet: (c) => c.toggleBulletList(),
    ordered: (c) => c.toggleOrderedList(),
    quote: (c) => c.toggleBlockquote(),
    code: (c) => c.toggleCodeBlock(),
  };
  const ACTIVE = {
    bold: () => editor.isActive('bold'),
    italic: () => editor.isActive('italic'),
    strike: () => editor.isActive('strike'),
    h2: () => editor.isActive('heading', { level: 2 }),
    bullet: () => editor.isActive('bulletList'),
    ordered: () => editor.isActive('orderedList'),
    quote: () => editor.isActive('blockquote'),
    code: () => editor.isActive('codeBlock'),
  };

  const sync = () => {
    toolbar.querySelectorAll('.rte-btn').forEach((b) => {
      const fn = ACTIVE[b.dataset.cmd];
      b.classList.toggle('is-active', !!(fn && fn()));
    });
  };

  // mousedown (not click) so the editor selection isn't lost before the command.
  toolbar.addEventListener('mousedown', (e) => {
    const b = e.target.closest('.rte-btn');
    if (!b) return;
    e.preventDefault();
    const run = RUN[b.dataset.cmd];
    if (run) run(editor.chain().focus()).run();
    sync();
  });
  editor.on('selectionUpdate', sync);
  editor.on('transaction', sync);
  sync();

  return {
    getHTML() { try { return editor.getHTML(); } catch (_) { return ''; } },
    setHTML(html) { try { editor.commands.setContent(html || '', false); } catch (_) {} },
    unmount() { try { editor.destroy(); } catch (_) {} try { container.innerHTML = ''; } catch (_) {} },
    focus() { try { editor.commands.focus('end'); } catch (_) {} },
  };
}

window.OrbiTipTap = { mount };
