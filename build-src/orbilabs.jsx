/* orbilabs.jsx — Orbitrack "Labs" library showcase + hidden games hub entry.
 *
 * Two things live here now:
 *  1. mountShowcase(container): renders the UI-library demo grid (Motion,
 *     AutoAnimate, Howler, TipTap, Phaser, dnd-kit, Sonner, cmdk, React Flow)
 *     into a caller-supplied element — used by the Admin portal "Library" tab.
 *  2. The brand-logo easter egg: spam-clicking the top-left Orbitrack logo spins
 *     it and, past a threshold, opens the hidden multiplayer games hub
 *     (window.OrbiGames, defined in games/hub.js, imported here so it bundles).
 *
 * Rebuild after editing:  npm run build:orbilabs
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'motion';
import autoAnimate from '@formkit/auto-animate';
import { Howl } from 'howler';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Phaser from 'phaser';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Toaster, toast } from 'sonner';
import { Command } from 'cmdk';

import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Importing the hub self-registers window.OrbiGames + window.OrbiGamesToast.
import './games/hub.js';

const reduceMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (_) { return false; }
};

/* ─────────────────────────── Styles ─────────────────────────── */
const CSS_TEXT = `
.orbilabs-grid{padding:2px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.ol-card{border:1px solid var(--border,rgba(255,255,255,.1));border-radius:14px;padding:14px;background:var(--card,#15181e)}
.ol-card-h{display:flex;align-items:baseline;gap:8px;font-weight:700;font-size:.92rem;margin-bottom:10px}
.ol-card-h em{font-style:normal;font-size:.7rem;color:var(--text-muted,#9aa0aa);background:var(--accent-light,rgba(255,255,255,.08));padding:2px 7px;border-radius:999px}
.ol-btn{border:1px solid var(--border,rgba(255,255,255,.16));background:var(--accent-light,rgba(255,255,255,.06));color:var(--text,inherit);
  padding:7px 12px;border-radius:9px;font-size:.8rem;font-weight:600;cursor:pointer;margin:3px 4px 3px 0}
.ol-btn:hover{border-color:var(--accent,#818cf8)}
.ol-motion-box{width:64px;height:64px;border-radius:14px;background:linear-gradient(135deg,#818cf8,#38bdf8);margin:6px 0 12px}
.ol-aa-list{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.ol-aa-list li{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 11px;border-radius:9px;
  background:var(--accent-light,rgba(255,255,255,.06));font-size:.82rem}
.ol-aa-list li button{border:none;background:transparent;color:var(--text-muted,#9aa0aa);cursor:pointer;font-size:1rem}
.ol-tiptap-tools{display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap}
.ol-tiptap-tools button{border:1px solid var(--border,rgba(255,255,255,.16));background:transparent;color:var(--text,inherit);border-radius:7px;
  padding:4px 9px;font-size:.78rem;cursor:pointer}
.ol-tiptap-tools button.is-active{background:var(--accent,#818cf8);color:#fff;border-color:var(--accent,#818cf8)}
.ol-tiptap .tiptap{min-height:90px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:9px;padding:8px 11px;font-size:.85rem;outline:none}
.ol-tiptap .tiptap:focus{border-color:var(--accent,#818cf8)}
.ol-phaser{border-radius:10px;overflow:hidden;background:rgba(0,0,0,.25);min-height:150px}
.ol-flow-wrap{height:200px;border-radius:10px;overflow:hidden;border:1px solid var(--border,rgba(255,255,255,.12))}
.ol-sortable{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.ol-sortable li{padding:9px 12px;border-radius:9px;background:var(--accent-light,rgba(255,255,255,.07));font-size:.82rem;
  border:1px solid var(--border,rgba(255,255,255,.1));cursor:grab;user-select:none}
.orbilabs-cmdk-backdrop{position:fixed;inset:0;z-index:9200;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;padding-top:14vh}
[cmdk-root].ol-cmdk{width:min(560px,92vw);background:var(--card,#15181e);color:var(--text,#e8e8ea);border:1px solid var(--border,rgba(255,255,255,.12));
  border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,.55);overflow:hidden;font-size:.9rem}
[cmdk-input].ol-cmdk-input{width:100%;border:none;outline:none;background:transparent;color:inherit;padding:15px 16px;font-size:.95rem;
  border-bottom:1px solid var(--border,rgba(255,255,255,.1))}
[cmdk-list]{max-height:340px;overflow:auto;padding:6px}
[cmdk-item]{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:9px;cursor:pointer;color:inherit}
[cmdk-item][data-selected="true"]{background:var(--accent,#818cf8);color:#fff}
[cmdk-empty]{padding:16px;text-align:center;color:var(--text-muted,#9aa0aa);font-size:.85rem}
[cmdk-group-heading]{padding:8px 12px 4px;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted,#9aa0aa)}
`;

function injectStyles() {
  if (document.getElementById('orbilabs-style')) return;
  const s = document.createElement('style');
  s.id = 'orbilabs-style';
  s.textContent = CSS_TEXT;
  document.head.appendChild(s);
}

/* ─────────────────────── Vanilla: Howler beeps ─────────────────────── */
function beepDataUri(freq = 440, ms = 130, vol = 0.28) {
  const sr = 44100, len = Math.floor((sr * ms) / 1000);
  const buf = new ArrayBuffer(44 + len * 2);
  const view = new DataView(buf);
  const w = (o, str) => { for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); view.setUint32(4, 36 + len * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, len * 2, true);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.min(1, (len - i) / (sr * 0.04));
    const s = Math.sin(2 * Math.PI * freq * t) * vol * env;
    view.setInt16(44 + i * 2, s * 32767, true);
  }
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}
const howls = {
  click: new Howl({ src: [beepDataUri(523, 90)], format: ['wav'] }),
  success: new Howl({ src: [beepDataUri(784, 220, 0.3)], format: ['wav'] }),
  error: new Howl({ src: [beepDataUri(196, 260, 0.32)], format: ['wav'] }),
};

/* ─────────────────────── Vanilla: TipTap (scoped) ─────────────────────── */
function setupTiptap(container, toolbar) {
  if (!container) return;
  const editor = new Editor({
    element: container,
    extensions: [StarterKit],
    content: '<p>This editor is <strong>TipTap</strong> (<code>@tiptap/core</code>). Try <em>bold</em>, bullets, headings…</p>',
  });
  const sync = () => {
    toolbar.querySelectorAll('button[data-mark]').forEach((b) => {
      b.classList.toggle('is-active', editor.isActive(b.getAttribute('data-mark')));
    });
  };
  toolbar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-cmd]');
    if (!b) return;
    const cmd = b.getAttribute('data-cmd');
    const chain = editor.chain().focus();
    if (cmd === 'bold') chain.toggleBold().run();
    else if (cmd === 'italic') chain.toggleItalic().run();
    else if (cmd === 'bullet') chain.toggleBulletList().run();
    else if (cmd === 'h2') chain.toggleHeading({ level: 2 }).run();
    sync();
  });
  editor.on('selectionUpdate', sync);
  editor.on('transaction', sync);
}

/* ─────────────────────── Vanilla: Phaser mini-game (scoped) ─────────────────────── */
let lastPhaserHost = null;
function setupPhaser(container) {
  if (!container || container._phaser) return;
  // The Admin tab re-renders into a fresh container each time it's opened; tear
  // down the previous Phaser game so we don't leak WebGL contexts (browser cap).
  if (lastPhaserHost && lastPhaserHost._phaser) {
    try { lastPhaserHost._phaser.destroy(true); } catch (_) {}
    lastPhaserHost._phaser = null;
  }
  lastPhaserHost = container;
  const W = container.clientWidth || 260, H = 150;
  container._phaser = new Phaser.Game({
    type: Phaser.AUTO, parent: container, width: W, height: H, transparent: true,
    scene: {
      create() {
        this.score = 0;
        this.label = this.add.text(8, 8, 'Catch the orb! Score: 0', { fontSize: '13px', color: '#cbd5e1' });
        this.orb = this.add.circle(W / 2, H / 2, 15, 0x818cf8).setInteractive({ useHandCursor: true });
        this.vx = 90; this.vy = 70;
        this.orb.on('pointerdown', () => {
          this.score++;
          this.label.setText('Catch the orb! Score: ' + this.score);
          try { howls.click.play(); } catch (_) {}
          this.orb.setFillStyle(Phaser.Display.Color.RandomRGB(120, 255).color);
        });
      },
      update(_t, dt) {
        const o = this.orb, step = dt / 1000;
        o.x += this.vx * step; o.y += this.vy * step;
        if (o.x < 16 || o.x > W - 16) this.vx *= -1;
        if (o.y < 16 || o.y > H - 16) this.vy *= -1;
      },
    },
  });
}

/* ─────────────────────── React islands ─────────────────────── */
function SortableRow({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return <li ref={setNodeRef} style={style} {...attributes} {...listeners}>⠿ {label}</li>;
}
function SortableDemo() {
  const [items, setItems] = useState([
    { id: 'a', label: 'Design review' },
    { id: 'b', label: 'Ship build' },
    { id: 'c', label: 'Write changelog' },
    { id: 'd', label: 'Celebrate 🎉' },
  ]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          setItems((it) => {
            const oldIndex = it.findIndex((x) => x.id === active.id);
            const newIndex = it.findIndex((x) => x.id === over.id);
            return arrayMove(it, oldIndex, newIndex);
          });
          try { howls.click.play(); } catch (_) {}
        }
      }}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="ol-sortable">
          {items.map((i) => <SortableRow key={i.id} id={i.id} label={i.label} />)}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SonnerDemo() {
  return (
    <div>
      <Toaster richColors position="bottom-center" />
      <button className="ol-btn" onClick={() => { toast('Plain toast from Sonner'); }}>Toast</button>
      <button className="ol-btn" onClick={() => { toast.success('Saved!'); try { howls.success.play(); } catch (_) {} }}>Success</button>
      <button className="ol-btn" onClick={() => { toast.error('Something broke'); try { howls.error.play(); } catch (_) {} }}>Error</button>
      <button className="ol-btn" onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1200)), { loading: 'Syncing…', success: 'Synced', error: 'Failed' })}>Promise</button>
    </div>
  );
}

function nodeStyle(c) {
  return { background: c, color: '#0b0d12', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, padding: '6px 10px' };
}
function FlowDemo() {
  const nodes = [
    { id: '1', position: { x: 20, y: 20 }, data: { label: 'Idea' }, style: nodeStyle('#818cf8') },
    { id: '2', position: { x: 180, y: 90 }, data: { label: 'Project' }, style: nodeStyle('#38bdf8') },
    { id: '3', position: { x: 40, y: 150 }, data: { label: 'Task' }, style: nodeStyle('#22c55e') },
  ];
  const edges = [
    { id: 'e1', source: '1', target: '2', animated: true },
    { id: 'e2', source: '2', target: '3', animated: true },
  ];
  return (
    <div className="ol-flow-wrap">
      <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

/* ─────────────────────── cmdk demo palette ─────────────────────── */
const ROUTES = [
  { label: 'Go to Projects', hash: '#/projects' },
  { label: 'Go to Tasks', hash: '#/tasks' },
  { label: 'Go to Team', hash: '#/users' },
  { label: 'Go to Calendar', hash: '#/calendar' },
  { label: 'Go to Dashboard', hash: '#/dashboard' },
  { label: 'Open Support', hash: '#/support' },
];
function CmdkPalette() {
  const [open, setOpen] = useState(false);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onEvt = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('orbilabs:cmdk', onEvt);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('orbilabs:cmdk', onEvt); };
  }, []);
  if (!open) return null;
  const run = (fn) => { fn(); setOpen(false); };
  return (
    <div className="orbilabs-cmdk-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <Command className="ol-cmdk" label="Command palette">
        <Command.Input className="ol-cmdk-input" placeholder="Type a command or search… (cmdk)" autoFocus />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Navigate">
            {ROUTES.map((r) => (
              <Command.Item key={r.hash} value={r.label} onSelect={() => run(() => { window.location.hash = r.hash; })}>
                {r.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Actions">
            <Command.Item value="Toggle theme" onSelect={() => run(() => { document.querySelector('[data-action="toggle-theme-mode"]')?.click(); })}>Toggle theme mode</Command.Item>
            <Command.Item value="Celebrate" onSelect={() => run(() => window.OrbiFun?.celebrate?.({ big: true }))}>Celebrate 🎉</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

/* ─────────────────────── Showcase grid (mounts into a container) ─────────────────────── */
const SHOWCASE_HTML = `
<div class="orbilabs-grid">
  <section class="ol-card"><div class="ol-card-h">Motion <em>motion</em></div>
    <div class="ol-motion-box" data-motion-box></div>
    <button class="ol-btn" data-motion="spring">Spring pop</button>
    <button class="ol-btn" data-motion="spin">Spin</button>
  </section>
  <section class="ol-card"><div class="ol-card-h">AutoAnimate <em>@formkit/auto-animate</em></div>
    <button class="ol-btn" data-aa="add">Add item</button>
    <button class="ol-btn" data-aa="shuffle">Shuffle</button>
    <ul class="ol-aa-list" data-aa-list></ul>
  </section>
  <section class="ol-card"><div class="ol-card-h">Howler.js <em>howler</em></div>
    <button class="ol-btn" data-howl="click">Click</button>
    <button class="ol-btn" data-howl="success">Success</button>
    <button class="ol-btn" data-howl="error">Error</button>
  </section>
  <section class="ol-card"><div class="ol-card-h">TipTap <em>@tiptap/core</em></div>
    <div class="ol-tiptap-tools" data-tiptap-tools>
      <button data-cmd="bold" data-mark="bold">Bold</button>
      <button data-cmd="italic" data-mark="italic">Italic</button>
      <button data-cmd="h2" data-mark="heading">H2</button>
      <button data-cmd="bullet" data-mark="bulletList">• List</button>
    </div>
    <div class="ol-tiptap" data-tiptap></div>
  </section>
  <section class="ol-card"><div class="ol-card-h">Phaser <em>phaser</em></div>
    <div class="ol-phaser" data-phaser></div>
  </section>
  <section class="ol-card"><div class="ol-card-h">dnd-kit <em>@dnd-kit</em></div>
    <div data-dnd></div>
  </section>
  <section class="ol-card"><div class="ol-card-h">Sonner <em>sonner</em></div>
    <div data-sonner></div>
  </section>
  <section class="ol-card"><div class="ol-card-h">React Flow <em>@xyflow/react</em></div>
    <div data-flow></div>
  </section>
  <section class="ol-card"><div class="ol-card-h">cmdk <em>cmdk</em></div>
    <p style="font-size:.82rem;color:var(--text-muted,#9aa0aa);margin:0 0 10px">The app already uses <kbd>Ctrl</kbd>+<kbd>K</kbd>, so this demo palette opens from the button below.</p>
    <button class="ol-btn" data-cmdk="open">Open palette</button>
  </section>
</div>`;

function mountShowcase(container) {
  if (!container) return;
  injectStyles();
  ensureCmdkRoot();
  container.innerHTML = SHOWCASE_HTML;

  // Motion
  const motionBox = container.querySelector('[data-motion-box]');
  container.querySelectorAll('[data-motion]').forEach((b) => b.addEventListener('click', () => {
    if (reduceMotion()) return;
    if (b.dataset.motion === 'spring') animate(motionBox, { transform: ['scale(1)', 'scale(1.35)', 'scale(1)'] }, { duration: 0.5, easing: [0.34, 1.4, 0.64, 1] });
    else animate(motionBox, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, { duration: 0.7, easing: 'ease-in-out' });
  }));

  // AutoAnimate
  const aaList = container.querySelector('[data-aa-list]');
  autoAnimate(aaList);
  let aaSeq = 0;
  const aaAdd = (text) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${text}</span><button title="Remove">×</button>`;
    li.querySelector('button').addEventListener('click', () => li.remove());
    aaList.appendChild(li);
  };
  ['Milestone', 'Sprint', 'Review'].forEach(aaAdd);
  container.querySelectorAll('[data-aa]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.aa === 'add') aaAdd('Item ' + (++aaSeq));
    else {
      const kids = Array.from(aaList.children);
      for (let i = kids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); aaList.insertBefore(kids[i], kids[j]); }
    }
  }));

  // Howler
  container.querySelectorAll('[data-howl]').forEach((b) => b.addEventListener('click', () => {
    try { howls[b.dataset.howl]?.play(); } catch (_) {}
  }));

  // cmdk open button
  container.querySelector('[data-cmdk="open"]').addEventListener('click', () => window.dispatchEvent(new Event('orbilabs:cmdk')));

  // TipTap (vanilla)
  setupTiptap(container.querySelector('[data-tiptap]'), container.querySelector('[data-tiptap-tools]'));

  // React islands
  createRoot(container.querySelector('[data-dnd]')).render(<SortableDemo />);
  createRoot(container.querySelector('[data-sonner]')).render(<SonnerDemo />);
  createRoot(container.querySelector('[data-flow]')).render(<FlowDemo />);

  // Phaser needs a sized container.
  setTimeout(() => setupPhaser(container.querySelector('[data-phaser]')), 60);
}

/* ─────────────────────── cmdk root (body-level) ─────────────────────── */
function ensureCmdkRoot() {
  if (document.getElementById('orbilabs-cmdk-root')) return;
  const cmdkRoot = document.createElement('div');
  cmdkRoot.id = 'orbilabs-cmdk-root';
  document.body.appendChild(cmdkRoot);
  createRoot(cmdkRoot).render(<CmdkPalette />);
}

/* ─────────────── Hidden entry: spin the logo, then open the arcade ─────────────── */
function setupEntry() {
  ensureCmdkRoot();
  const brand = document.querySelector('.sidebar-brand');
  if (!brand || brand.dataset.orbilabsBound) return;
  brand.dataset.orbilabsBound = '1';
  brand.style.cursor = 'pointer';
  const icon = brand.querySelector('.brand-icon-svg') || brand;

  let clicks = 0, timer = null, wasted = 0;
  brand.addEventListener('click', () => {
    clicks++; wasted++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1500);
    // Confetti erupts on EVERY click — the 5th click is just the bonus.
    try { window.OrbiFun?.celebrate?.(); } catch (_) {}
    // Spin the logo on every click.
    if (!reduceMotion()) {
      animate(icon, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
    }
    if (clicks >= 5) {
      const count = wasted;
      clicks = 0; wasted = 0;
      clearTimeout(timer);
      if (!reduceMotion()) animate(icon, { transform: ['rotate(0deg)', 'rotate(720deg)'] }, { duration: 0.9, easing: 'ease-out' });
      // Bigger celebratory burst on the threshold (arcade launch disabled for now).
      try { window.OrbiFun?.celebrate?.({ big: true }); } catch (_) {}
      void count;
    }
  });
}

// Public API: showcase mount for the Admin tab (+ arcade proxy for back-compat).
window.OrbiLabs = {
  mountShowcase,
  open: () => window.OrbiGames?.open(),
  close: () => window.OrbiGames?.close(),
  toggle: () => window.OrbiGames?.toggle(),
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEntry);
} else {
  setupEntry();
}
