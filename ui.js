/* ui.js - Floating UI tooltips for selected Orbitask icon buttons only. */

(function () {
  const Floating = window.FloatingUIDOM;
  const ICON_TOOLTIP_SELECTOR = [
    '.notes-dock-launcher',
    '.chat-dock-launcher'
  ].join(',');

  let activeTooltip = null;
  let cleanupPosition = null;

  const ICON_PATHS = {
    file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/>',
    fileText: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
    fileImage: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><circle cx="10" cy="13" r="1.5"/><path d="m9 18 2.2-2.2a1.2 1.2 0 0 1 1.7 0L16 19"/>',
    filePdf: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M8 16h1.6a1.6 1.6 0 0 0 0-3.2H8v4.2"/><path d="M13 12.8V17h1.1a2.1 2.1 0 0 0 0-4.2Z"/>',
    fileSheet: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M8 13h8"/><path d="M8 16h8"/><path d="M11 10v9"/>',
    fileCode: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="m10 13-2 2 2 2"/><path d="m14 13 2 2-2 2"/>',
    archive: '<path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><path d="M10 12h4"/><path d="M22 3H2v5h20Z"/>',
    presentation: '<path d="M3 4h18"/><path d="M4 4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="m12 17-4 4"/><path d="m12 17 4 4"/><path d="M9 9h6"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };

  const LUCIDE_NAMES = {
    file: 'File',
    fileText: 'FileText',
    fileImage: 'FileImage',
    filePdf: 'FileText',
    fileSheet: 'FileSpreadsheet',
    fileCode: 'FileCode',
    archive: 'FileArchive',
    presentation: 'Presentation',
    upload: 'Upload',
    folder: 'Folder',
    trash: 'Trash2',
    x: 'X'
  };

  function icon(name, options = {}) {
    const size = Number(options.size || 18);
    const label = options.label ? ` role="img" aria-label="${escapeAttr(options.label)}"` : ' aria-hidden="true"';
    const cls = options.className ? ` class="${escapeAttr(options.className)}"` : '';
    const path = lucidePathMarkup(name) || ICON_PATHS[name] || ICON_PATHS.file;
    return `<svg${cls}${label} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${options.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  function lucidePathMarkup(name) {
    const lucideName = LUCIDE_NAMES[name] || name;
    const nodes = window.lucide?.icons?.[lucideName];
    if (!Array.isArray(nodes)) return '';
    return nodes.map(([tag, attrs]) => {
      const attrText = Object.entries(attrs || {})
        .map(([key, value]) => ` ${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${escapeAttr(value)}"`)
        .join('');
      return `<${tag}${attrText}/>`;
    }).join('');
  }

  function escapeAttr(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fileIconName(file = {}) {
    const mime = String(file.mimeType || file.type || '').toLowerCase();
    const name = String(file.fileName || file.name || '').toLowerCase();
    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name)) return 'fileImage';
    if (mime === 'application/pdf' || /\.pdf$/.test(name)) return 'filePdf';
    if (/spreadsheet|excel|csv/.test(mime) || /\.(xlsx?|csv)$/.test(name)) return 'fileSheet';
    if (/presentation|powerpoint/.test(mime) || /\.(pptx?|key)$/.test(name)) return 'presentation';
    if (/zip|rar|7z|tar|gzip/.test(mime) || /\.(zip|rar|7z|tar|gz)$/.test(name)) return 'archive';
    if (/json|javascript|typescript|html|css|xml/.test(mime) || /\.(js|ts|tsx|jsx|html|css|json|xml|sql|md)$/.test(name)) return 'fileCode';
    if (/text|word|document/.test(mime) || /\.(txt|docx?|rtf)$/.test(name)) return 'fileText';
    return 'file';
  }

  function fileKind(file = {}) {
    const iconName = fileIconName(file);
    return {
      iconName,
      label: {
        fileImage: 'Image',
        filePdf: 'PDF',
        fileSheet: 'Sheet',
        presentation: 'Slides',
        archive: 'Archive',
        fileCode: 'Code',
        fileText: 'Document',
        file: 'File'
      }[iconName] || 'File',
      tone: iconName.replace(/^file/, '').toLowerCase() || 'file'
    };
  }

  function fileIcon(file, options = {}) {
    const kind = fileKind(file);
    return icon(kind.iconName, { ...options, label: options.label || kind.label });
  }

  function hasFloating() {
    return !!(Floating?.computePosition && Floating?.offset && Floating?.flip && Floating?.shift);
  }

  function tooltipText(el) {
    return (el?.dataset?.uiTooltip || el?.getAttribute?.('title') || el?.getAttribute?.('aria-label') || '').trim();
  }

  function iconTarget(node) {
    const el = node?.closest?.(ICON_TOOLTIP_SELECTOR);
    if (!el || el.matches('[disabled], [aria-disabled="true"]')) return null;
    return tooltipText(el) ? el : null;
  }

  function preserveNativeTitle(el) {
    if (!el?.hasAttribute('title')) return;
    el.dataset.uiNativeTitle = el.getAttribute('title') || '';
    el.removeAttribute('title');
  }

  function restoreNativeTitle(el) {
    if (!el?.dataset || !Object.prototype.hasOwnProperty.call(el.dataset, 'uiNativeTitle')) return;
    el.setAttribute('title', el.dataset.uiNativeTitle);
    delete el.dataset.uiNativeTitle;
  }

  function applyArrow(arrowEl, placement, middlewareData) {
    const arrowData = middlewareData?.arrow || {};
    const side = placement.split('-')[0];
    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[side];
    Object.assign(arrowEl.style, {
      left: arrowData.x != null ? `${arrowData.x}px` : '',
      top: arrowData.y != null ? `${arrowData.y}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-4px'
    });
  }

  function positionTooltip(reference, tooltip, arrowEl) {
    const middleware = [
      Floating.offset(10),
      Floating.flip({ padding: 8 }),
      Floating.shift({ padding: 8 })
    ];
    if (Floating.arrow) middleware.push(Floating.arrow({ element: arrowEl, padding: 8 }));

    const update = () => {
      Floating.computePosition(reference, tooltip, {
        placement: reference.dataset.uiPlacement || 'top',
        strategy: 'fixed',
        middleware
      }).then(({ x, y, placement, middlewareData }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`
        });
        applyArrow(arrowEl, placement, middlewareData);
      }).catch(() => {});
    };

    update();
    return Floating.autoUpdate ? Floating.autoUpdate(reference, tooltip, update) : null;
  }

  function hideTooltip() {
    if (cleanupPosition) cleanupPosition();
    cleanupPosition = null;
    if (activeTooltip?.target) restoreNativeTitle(activeTooltip.target);
    activeTooltip?.el?.remove();
    activeTooltip = null;
  }

  function showTooltip(target) {
    if (!hasFloating() || !target) return;
    const text = tooltipText(target);
    if (!text) return;
    hideTooltip();
    preserveNativeTitle(target);

    const tooltip = document.createElement('div');
    tooltip.className = 'wt-floating-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = '<span class="wt-floating-tooltip-text"></span><span class="wt-floating-arrow" aria-hidden="true"></span>';
    tooltip.querySelector('.wt-floating-tooltip-text').textContent = text;
    document.body.appendChild(tooltip);
    requestAnimationFrame(() => tooltip.classList.add('is-visible'));

    activeTooltip = { el: tooltip, target };
    cleanupPosition = positionTooltip(target, tooltip, tooltip.querySelector('.wt-floating-arrow'));
  }

  function bindEvents() {
    document.addEventListener('pointerenter', (event) => {
      const target = iconTarget(event.target);
      if (target) showTooltip(target);
    }, true);
    document.addEventListener('pointerleave', (event) => {
      if (activeTooltip?.target && !activeTooltip.target.contains(event.relatedTarget)) hideTooltip();
    }, true);
    document.addEventListener('focusin', (event) => {
      const target = iconTarget(event.target);
      if (target) showTooltip(target);
    });
    document.addEventListener('focusout', (event) => {
      if (activeTooltip?.target === event.target) hideTooltip();
    });
    document.addEventListener('click', hideTooltip, true);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideTooltip();
    });
  }

  function init() {
    document.documentElement.classList.toggle('wt-floating-ready', hasFloating());
    if (hasFloating()) bindEvents();
  }

  window.WTUI = {
    init,
    hideTooltip,
    icon,
    fileIcon,
    fileIconName,
    fileKind
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
