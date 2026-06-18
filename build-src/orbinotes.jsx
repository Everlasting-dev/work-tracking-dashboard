/* orbinotes.jsx — BlockNote rich-text editor island (replaces Quill for notes).
 *
 * Keeps the existing storage format (HTML string): imports note HTML on mount
 * and exports HTML on change, so no DB/schema migration is needed.
 *
 * window.OrbiNotes.mount(container, { initialHTML, theme }, { onChangeHTML })
 *
 * Rebuild after editing:  npm run build:orbinotes
 */
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

function Editor({ data, handlers }) {
  const editor = useCreateBlockNote();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const html = (data.initialHTML || '').trim();
      if (!html) return;
      try {
        const blocks = await editor.tryParseHTMLToBlocks(html);
        if (!cancelled && Array.isArray(blocks) && blocks.length) {
          editor.replaceBlocks(editor.document, blocks);
        }
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, [editor]);

  const onChange = async () => {
    if (!handlers.onChangeHTML) return;
    try {
      const html = await editor.blocksToHTMLLossy(editor.document);
      handlers.onChangeHTML(html);
    } catch (_) {}
  };

  return React.createElement(BlockNoteView, { editor, theme: data.theme || 'light', onChange });
}

const roots = new WeakMap();

function mount(container, data = {}, handlers = {}) {
  if (!container) return;
  let root = roots.get(container);
  if (!root) { root = createRoot(container); roots.set(container, root); }
  root.render(React.createElement(Editor, { data, handlers }));
  return { unmount() { try { root.unmount(); } catch (_) {} roots.delete(container); } };
}

window.OrbiNotes = { mount };
