/* Team map emoji picker — Emoji Mart bundled for vanilla app.js */
import data from '@emoji-mart/data';
import { Picker } from 'emoji-mart';

const CSS = `
em-emoji-picker {
  --em-rgb-background: var(--card, #fff);
  --em-rgb-input: var(--bg, #f4f4f5);
  --em-rgb-color: var(--text, #111);
  --em-rgb-border: var(--border, #e4e4e7);
  --em-rgb-accent: var(--accent, #4f46e5);
  width: 352px;
  max-width: min(352px, calc(100vw - 24px));
}
`;

let portal = null;
let pickerEl = null;
let onPickCb = null;
let outsideHandler = null;

function injectCss() {
  if (document.getElementById('orbiemoji-style')) return;
  const s = document.createElement('style');
  s.id = 'orbiemoji-style';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function ensurePortal() {
  injectCss();
  if (portal) return;
  portal = document.createElement('div');
  portal.className = 'team-emoji-picker-portal hidden';
  portal.setAttribute('role', 'dialog');
  portal.setAttribute('aria-label', 'Emoji picker');
  document.body.appendChild(portal);
}

function positionPortal(anchorRect) {
  const pw = 360;
  const ph = 420;
  const margin = 12;
  let left = anchorRect.left + anchorRect.width / 2 - pw / 2;
  let top = anchorRect.top - ph - 8;
  if (top < margin) top = anchorRect.bottom + 8;
  if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin;
  if (left < margin) left = margin;
  if (top + ph > window.innerHeight - margin) top = window.innerHeight - ph - margin;
  portal.style.left = `${left}px`;
  portal.style.top = `${top}px`;
}

function close() {
  if (outsideHandler) {
    document.removeEventListener('mousedown', outsideHandler, true);
    outsideHandler = null;
  }
  if (portal) {
    portal.classList.add('hidden');
    portal.innerHTML = '';
  }
  pickerEl = null;
  onPickCb = null;
}

function open(anchorRect, onPick) {
  ensurePortal();
  close();
  onPickCb = onPick;
  const theme = document.body.classList.contains('theme-black') ? 'dark' : 'light';
  pickerEl = new Picker({
    data,
    theme,
    previewPosition: 'none',
    skinTonePosition: 'search',
    onEmojiSelect: (emoji) => {
      const native = emoji?.native || emoji?.skins?.[0]?.native;
      if (native) onPickCb?.(native);
      close();
    },
  });
  portal.appendChild(pickerEl);
  positionPortal(anchorRect);
  portal.classList.remove('hidden');
  outsideHandler = (e) => {
    if (!portal.contains(e.target) && !e.target.closest('[data-emoji-open]')) close();
  };
  setTimeout(() => document.addEventListener('mousedown', outsideHandler, true), 0);
}

function toggle(anchorRect, onPick) {
  if (portal && !portal.classList.contains('hidden')) close();
  else open(anchorRect, onPick);
}

window.TeamEmojiPicker = { open, close, toggle };
