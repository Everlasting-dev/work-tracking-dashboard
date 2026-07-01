/* map-pixi.js — Cozy, fully GPU-rendered treasure map (no Leaflet).
 *
 * One parchment sprite lives inside a pannable / zoomable Pixi "world" container.
 * Hotspots are soft golden halos placed directly ON the hand-drawn badges of
 * arcade-map.png (the art already carries the numbers + labels, so we never draw
 * our own numbers over it — we just make the existing medallions feel alive and
 * clickable). Drag to pan, wheel / pinch to zoom-to-cursor, gentle idle drift,
 * ambient dust motes, and a DOM tooltip that tracks the station under the cursor.
 *
 * Exposes the same surface the hub already consumed from the old Leaflet module:
 *   createTreasureMap / destroyTreasureMap / refreshMapTrophies / invalidateTreasureMap
 * plus pauseTreasureMap / resumeTreasureMap so the hub can idle it while a game runs.
 */
import { Application, Container, Graphics, Sprite, Texture, Text } from 'pixi.js';
import mapUrl from '../../vendor/orbilabs/arcade-map.png';
import { HOTSPOTS, GAME_META } from './hotspots.js';
import * as Arcade from './achievements.js';

const GOLD = 0xfbbf24;
const GOLD_SOFT = 0xf5d68a;
const MUTED = 0x9aa7b8;
const CLEAR_GREEN = 0x34d399;

let mapInstance = null;

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const prefersReducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clearedGames() {
  const st = Arcade.getState();
  return new Set(st.trophies.filter((t) => t.startsWith('finish-')).map((t) => t.slice(7)));
}

function stationTooltip(h, cleared) {
  if (h.hub) {
    const st = Arcade.getState();
    return { title: h.label, sub: `Command Center · ${st.xp} XP · ${st.trophies.length}/${Arcade.TROPHIES.length} trophies` };
  }
  if (h.soon) return { title: h.label, sub: 'Still being charted — coming soon' };
  const meta = h.game && GAME_META[h.game];
  return {
    title: meta ? meta.title : h.label,
    sub: (meta ? `${meta.players} · ${meta.desc}` : 'Play') + (h.game && cleared.has(h.game) ? '  ·  ✓ cleared' : ''),
  };
}

export async function createTreasureMap(containerEl) {
  if (!containerEl) return null;
  destroyTreasureMap();
  containerEl.innerHTML = '';

  const img = await loadImage(mapUrl);
  const MW = img.naturalWidth || 1024;
  const MH = img.naturalHeight || 768;

  const app = new Application();
  await app.init({
    resizeTo: containerEl,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoDensity: true,
    preference: 'webgl',
    powerPreference: 'high-performance',
  });
  app.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;';
  containerEl.appendChild(app.canvas);

  // Cozy dark backdrop + soft vignette that fills the letterbox around the map.
  const backdrop = new Graphics();
  app.stage.addChildAt(backdrop, 0);
  function paintBackdrop() {
    const w = app.screen.width, h = app.screen.height;
    backdrop.clear();
    backdrop.rect(0, 0, w, h).fill({ color: 0x1a140c });
    // radial-ish warm center using stacked translucent ellipses
    for (let i = 6; i >= 1; i--) {
      backdrop.ellipse(w / 2, h / 2, (w / 2) * (i / 6) * 1.1, (h / 2) * (i / 6) * 1.1)
        .fill({ color: 0x2a2013, alpha: 0.12 });
    }
  }
  paintBackdrop();

  // Pan/zoom target.
  const world = new Container();
  app.stage.addChild(world);

  // Map sprite with a subtle drawn frame so it reads as a physical chart.
  const texture = Texture.from(img);
  const frame = new Graphics();
  frame.roundRect(-10, -10, MW + 20, MH + 20, 14).fill({ color: 0x120d07, alpha: 0.55 });
  world.addChild(frame);
  const sprite = new Sprite(texture);
  sprite.width = MW; sprite.height = MH;
  world.addChild(sprite);

  // Ambient dust motes drifting over the parchment (cheap cozy life).
  const motes = new Container();
  world.addChild(motes);
  const moteData = [];
  if (!prefersReducedMotion()) {
    for (let i = 0; i < 26; i++) {
      const g = new Graphics();
      const r = 1 + Math.random() * 2.2;
      g.circle(0, 0, r).fill({ color: 0xfff4d6, alpha: 0.5 });
      g.position.set(Math.random() * MW, Math.random() * MH);
      motes.addChild(g);
      moteData.push({ g, vx: (Math.random() - 0.5) * 6, vy: -4 - Math.random() * 6, base: 0.15 + Math.random() * 0.35, ph: Math.random() * 6.28 });
    }
  }

  // Hotspot layer (pans/zooms with the map so halos stay glued to the badges).
  const hotLayer = new Container();
  world.addChild(hotLayer);

  let cleared = clearedGames();
  const markers = HOTSPOTS.map((h) => makeMarker(h, cleared));
  markers.forEach((m) => hotLayer.addChild(m.c));

  function makeMarker(h, clearedSet) {
    const c = new Container();
    c.position.set((h.left / 100) * MW, (h.top / 100) * MH);
    c.eventMode = 'static';
    c.cursor = h.soon ? 'help' : 'pointer';
    const R = 30;
    const accent = h.soon ? MUTED : GOLD;

    const glow = new Graphics();
    glow.circle(0, 0, R + 14).fill({ color: accent, alpha: h.soon ? 0.06 : 0.14 });
    const ring = new Graphics();
    ring.circle(0, 0, R).stroke({ width: 3.2, color: accent, alpha: h.soon ? 0.5 : 0.92 });
    ring.circle(0, 0, R - 6).stroke({ width: 1.2, color: GOLD_SOFT, alpha: h.soon ? 0.2 : 0.4 });
    const hit = new Graphics();
    hit.circle(0, 0, R + 16).fill({ color: 0xffffff, alpha: 0.001 });
    c.addChild(glow, ring, hit);

    const badges = new Container();
    c.addChild(badges);

    if (h.soon) {
      const lock = new Text({ text: '🔒', style: { fontSize: 15 } });
      lock.anchor.set(0.5); lock.position.set(R - 4, -R + 6);
      badges.addChild(lock);
    } else if (h.game && clearedSet.has(h.game)) {
      addTrophyBadge(badges, R);
    }

    c._parts = { glow, ring, badges, R, accent, soon: !!h.soon, hasTrophy: !!(h.game && clearedSet.has(h.game)) };
    c._hovered = false;
    c._phase = Math.random() * 6.28;

    c.on('pointerover', () => { c._hovered = true; showTip(h); onHoverSound(); });
    c.on('pointerout', () => { c._hovered = false; if (tip.forId === h.id) hideTip(); });
    c.on('pointertap', () => { if (!dragMoved) onHotspotClick(h); });
    return { h, c };
  }

  function addTrophyBadge(badges, R) {
    const disc = new Graphics();
    disc.circle(R - 4, -R + 6, 9).fill({ color: 0x0f2a1e, alpha: 0.9 }).stroke({ width: 1.5, color: CLEAR_GREEN, alpha: 0.9 });
    const tick = new Text({ text: '✓', style: { fontSize: 12, fontWeight: '900', fill: CLEAR_GREEN } });
    tick.anchor.set(0.5); tick.position.set(R - 4, -R + 6);
    badges.addChild(disc, tick);
  }

  function onHotspotClick(h) {
    onSelectSound();
    if (h.game) window.__arcadeHub?.openGame?.(h.game);
    else if (h.soon) window.__arcadeHub?.toast?.('Coming soon — this station is still being charted.', '');
    else if (h.hub) {
      const st = Arcade.getState();
      window.__arcadeHub?.toast?.(`Command Center · ${st.xp} XP · ${st.trophies.length} trophies unlocked`, 'success');
    }
  }

  /* ── Tooltip (DOM, tracks the station in screen space) ───────────────── */
  const tip = document.createElement('div');
  tip.className = 'arcade-map-tip';
  tip.style.cssText = 'position:absolute;pointer-events:none;z-index:20;opacity:0;transform:translate(-50%,-135%);'
    + 'transition:opacity .14s ease;padding:7px 11px;border-radius:10px;font-family:inherit;white-space:nowrap;'
    + 'background:rgba(38,26,14,.94);border:1px solid rgba(251,191,36,.4);box-shadow:0 10px 30px rgba(0,0,0,.4);'
    + 'color:#fff6e6;font-size:12px;line-height:1.35';
  tip.forId = null;
  containerEl.appendChild(tip);
  function showTip(h) {
    const t = stationTooltip(h, cleared);
    tip.innerHTML = `<b style="font-weight:750;letter-spacing:.01em">${escapeHtml(t.title)}</b>`
      + `<span style="display:block;margin-top:2px;font-size:10.5px;color:#e7c98a">${escapeHtml(t.sub)}</span>`;
    tip.forId = h.id;
    tip.style.opacity = '1';
  }
  function hideTip() { tip.style.opacity = '0'; tip.forId = null; }
  function escapeHtml(s) { return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ── Soft WebAudio blips (respect the hub mute flag) ─────────────────── */
  let audioCtx = null;
  function blip(freq, dur, gain) {
    if (window.__arcadeMuted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur + 0.02);
    } catch (_) {}
  }
  let lastHover = 0;
  function onHoverSound() { const n = performance.now(); if (n - lastHover < 90) return; lastHover = n; blip(660, 0.08, 0.03); }
  function onSelectSound() { blip(523.25, 0.09, 0.05); setTimeout(() => blip(783.99, 0.1, 0.045), 70); }

  /* ── Pan / zoom ──────────────────────────────────────────────────────── */
  let minScale = 0.2, maxScale = 1;
  function fit() {
    const vw = app.screen.width, vh = app.screen.height;
    if (!vw || !vh) return;
    minScale = Math.min(vw / MW, vh / MH) * 0.98;
    maxScale = minScale * 3.4;
    world.scale.set(minScale);
    world.position.set((vw - MW * minScale) / 2, (vh - MH * minScale) / 2);
  }
  function clampPan() {
    const s = world.scale.x;
    const sw = MW * s, sh = MH * s;
    const vw = app.screen.width, vh = app.screen.height;
    world.x = sw <= vw ? (vw - sw) / 2 : clamp(world.x, vw - sw, 0);
    world.y = sh <= vh ? (vh - sh) / 2 : clamp(world.y, vh - sh, 0);
  }
  function zoomAt(clientX, clientY, factor) {
    const rect = app.canvas.getBoundingClientRect();
    const px = clientX - rect.left, py = clientY - rect.top;
    const wx = (px - world.x) / world.scale.x;
    const wy = (py - world.y) / world.scale.y;
    const s = clamp(world.scale.x * factor, minScale, maxScale);
    world.scale.set(s);
    world.x = px - wx * s;
    world.y = py - wy * s;
    clampPan();
  }

  fit();

  // Drag to pan (stage-level so it works over the whole map).
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  let dragging = false, last = null, dragMoved = false, downAt = 0;
  app.stage.on('pointerdown', (e) => {
    dragging = true; dragMoved = false; downAt = performance.now();
    last = { x: e.global.x, y: e.global.y };
    app.canvas.style.cursor = 'grabbing';
  });
  app.stage.on('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.global.x - last.x, dy = e.global.y - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    world.x += dx; world.y += dy;
    last = { x: e.global.x, y: e.global.y };
    clampPan();
  });
  function endDrag() { dragging = false; app.canvas.style.cursor = 'grab'; setTimeout(() => { dragMoved = false; }, 0); }
  app.stage.on('pointerup', endDrag);
  app.stage.on('pointerupoutside', endDrag);

  const onWheel = (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  };
  app.canvas.addEventListener('wheel', onWheel, { passive: false });

  // Two-finger pinch zoom for touch/trackpad.
  const pointers = new Map();
  let pinchStartDist = 0, pinchStartScale = 1;
  const onPointerDownRaw = (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y);
      pinchStartScale = world.scale.x;
      dragging = false;
    }
  };
  const onPointerMoveRaw = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinchStartDist) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const factor = (dist / pinchStartDist) * (pinchStartScale / world.scale.x);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, factor);
    }
  };
  const onPointerUpRaw = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStartDist = 0; };
  app.canvas.addEventListener('pointerdown', onPointerDownRaw);
  app.canvas.addEventListener('pointermove', onPointerMoveRaw);
  window.addEventListener('pointerup', onPointerUpRaw);
  window.addEventListener('pointercancel', onPointerUpRaw);

  // Double-click / tap to zoom toward that point.
  app.canvas.addEventListener('dblclick', (e) => zoomAt(e.clientX, e.clientY, 1.8));

  /* ── Optional calibration helper: window.__arcadeCalibrate = true then
        click to log image-space percentages for fine-tuning hotspots. ──── */
  app.canvas.addEventListener('click', (e) => {
    if (!window.__arcadeCalibrate) return;
    const rect = app.canvas.getBoundingClientRect();
    const wx = (e.clientX - rect.left - world.x) / world.scale.x;
    const wy = (e.clientY - rect.top - world.y) / world.scale.y;
    // eslint-disable-next-line no-console
    console.log(`hotspot → left: ${(wx / MW * 100).toFixed(1)}, top: ${(wy / MH * 100).toFixed(1)}`);
  });

  /* ── Animation ───────────────────────────────────────────────────────── */
  const reduced = prefersReducedMotion();
  app.ticker.add((ticker) => {
    const t = ticker.lastTime / 1000;
    markers.forEach(({ c }) => {
      const p = c._parts;
      const pulse = reduced ? 0 : Math.sin(t * 1.8 + c._phase) * 0.5 + 0.5;
      const targetScale = c._hovered ? 1.22 : 1 + (reduced ? 0 : pulse * 0.05);
      c.scale.x += (targetScale - c.scale.x) * 0.18;
      c.scale.y = c.scale.x;
      p.glow.alpha = (p.soon ? 0.06 : 0.12) + (c._hovered ? 0.16 : pulse * (p.soon ? 0.04 : 0.12));
      p.ring.alpha = (p.soon ? 0.5 : 0.85) + (c._hovered ? 0.15 : pulse * 0.12);
    });
    if (!reduced) {
      moteData.forEach((m) => {
        m.g.x += m.vx * ticker.deltaMS / 1000;
        m.g.y += m.vy * ticker.deltaMS / 1000;
        if (m.g.y < -6) { m.g.y = MH + 6; m.g.x = Math.random() * MW; }
        if (m.g.x < -6) m.g.x = MW + 6; else if (m.g.x > MW + 6) m.g.x = -6;
        m.g.alpha = m.base + Math.sin(t * 1.5 + m.ph) * 0.12;
      });
    }
    // keep tooltip glued to the hovered station
    if (tip.forId != null) {
      const hit = markers.find((m) => m.h.id === tip.forId);
      if (hit) { const gp = hit.c.getGlobalPosition(); tip.style.left = gp.x + 'px'; tip.style.top = (gp.y - hit.c._parts.R * hit.c.scale.y) + 'px'; }
    }
  });

  const ro = new ResizeObserver(() => { paintBackdrop(); app.stage.hitArea = app.screen; clampPan(); });
  ro.observe(containerEl);

  mapInstance = {
    app, world, ro, tip,
    detach() {
      try { app.canvas.removeEventListener('wheel', onWheel); } catch (_) {}
      try { app.canvas.removeEventListener('pointerdown', onPointerDownRaw); } catch (_) {}
      try { app.canvas.removeEventListener('pointermove', onPointerMoveRaw); } catch (_) {}
      try { window.removeEventListener('pointerup', onPointerUpRaw); } catch (_) {}
      try { window.removeEventListener('pointercancel', onPointerUpRaw); } catch (_) {}
    },
    refreshTrophies() {
      cleared = clearedGames();
      markers.forEach(({ h, c }) => {
        if (h.game && cleared.has(h.game) && !c._parts.hasTrophy) {
          addTrophyBadge(c._parts.badges, c._parts.R);
          c._parts.hasTrophy = true;
        }
      });
    },
    invalidate() { paintBackdrop(); app.stage.hitArea = app.screen; clampPan(); },
    resetView() { fit(); },
    pause() { try { app.ticker.stop(); } catch (_) {} },
    resume() { try { app.ticker.start(); } catch (_) {} },
  };
  return mapInstance;
}

export function destroyTreasureMap() {
  if (!mapInstance) return;
  try { mapInstance.ro?.disconnect(); } catch (_) {}
  try { mapInstance.detach?.(); } catch (_) {}
  try { mapInstance.tip?.remove(); } catch (_) {}
  try { mapInstance.app?.destroy(true, { children: true, texture: false }); } catch (_) {}
  mapInstance = null;
}

export function refreshMapTrophies() { mapInstance?.refreshTrophies?.(); }
export function invalidateTreasureMap() { mapInstance?.invalidate?.(); }
export function pauseTreasureMap() { mapInstance?.pause?.(); }
export function resumeTreasureMap() { mapInstance?.resume?.(); }
