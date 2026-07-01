/* map-leaflet-pixi.js — Leaflet parchment map + PixiJS hotspot overlay */
import L from 'leaflet';
import { Application, Container, Graphics, Text } from 'pixi.js';
import mapUrl from '../../vendor/orbilabs/arcade-map.png';
import { HOTSPOTS } from './hotspots.js';
import * as Arcade from './achievements.js';

const LEAFLET_CSS = `
.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
.leaflet-container{overflow:hidden;font:12px/1.5 Inter,system-ui,sans-serif}
.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;user-select:none}
.leaflet-container{background:#0b0e14;outline:0}
.leaflet-zoom-box{border:2px dotted #38bdf8;background:rgba(56,189,248,.08)}
.leaflet-control-zoom{border:1px solid var(--border,#334155);border-radius:8px;overflow:hidden;box-shadow:none}
.leaflet-control-zoom a{width:30px;height:30px;line-height:30px;background:var(--card,#1e293b);color:var(--text,#e2e8f0);border-bottom:1px solid var(--border,#334155)}
.leaflet-control-zoom a:hover{background:var(--bg,#0f172a)}
.leaflet-control-zoom a:last-child{border-bottom:none}
`;

let mapInstance = null;

function injectLeafletCss() {
  if (document.getElementById('arcade-leaflet-css')) return;
  const s = document.createElement('style');
  s.id = 'arcade-leaflet-css';
  s.textContent = LEAFLET_CSS;
  document.head.appendChild(s);
}

function loadImageSize(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1000, h: img.naturalHeight || 700 });
    img.onerror = () => resolve({ w: 1000, h: 700 });
    img.src = src;
  });
}

function hotspotLatLng(h, mapH, mapW) {
  return L.latLng(mapH * (1 - h.top / 100), mapW * (h.left / 100));
}

function buildHotspotGraphic(h, cleared) {
  const wrap = new Container();
  wrap.eventMode = 'static';
  wrap.cursor = 'pointer';
  const ring = new Graphics();
  const fill = h.soon ? 0x64748b : 0x4f46e5;
  const alpha = h.soon ? 0.2 : 0.45;
  ring.circle(0, 0, 22).fill({ color: fill, alpha }).stroke({ width: 3, color: h.soon ? 0x94a3b8 : 0x818cf8, alpha: h.soon ? 0.7 : 1 });
  const num = new Text({
    text: String(h.id),
    style: { fontSize: 14, fontWeight: '800', fill: 0xffffff, stroke: { color: 0x000000, width: 3 } },
  });
  num.anchor.set(0.5);
  wrap.addChild(ring);
  wrap.addChild(num);
  if (h.game && cleared.has(h.game)) {
    const trophy = new Text({ text: '🏆', style: { fontSize: 16 } });
    trophy.anchor.set(0.5);
    trophy.position.set(16, -16);
    wrap.addChild(trophy);
  }
  wrap._ring = ring;
  wrap._pulse = 0;
  wrap.on('pointerover', () => { ring.scale.set(1.12); });
  wrap.on('pointerout', () => { ring.scale.set(1); });
  return wrap;
}

export async function createTreasureMap(containerEl) {
  if (!containerEl) return null;
  destroyTreasureMap();
  containerEl.innerHTML = '';
  injectLeafletCss();

  const { w: mapW, h: mapH } = await loadImageSize(mapUrl);
  const bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(mapH, mapW));

  const map = L.map(containerEl, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomControl: true,
    attributionControl: false,
    maxBounds: bounds.pad(0.05),
    maxBoundsViscosity: 0.85,
  });

  L.imageOverlay(mapUrl, bounds).addTo(map);
  map.fitBounds(bounds, { padding: [12, 12] });

  const pixiWrap = document.createElement('div');
  pixiWrap.className = 'arcade-pixi-layer';
  pixiWrap.style.cssText = 'position:absolute;inset:0;z-index:450;pointer-events:none;overflow:hidden;';
  containerEl.appendChild(pixiWrap);

  const app = new Application();
  await app.init({
    resizeTo: pixiWrap,
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoDensity: true,
  });
  app.canvas.style.pointerEvents = 'auto';
  pixiWrap.appendChild(app.canvas);

  const st = Arcade.getState();
  const cleared = new Set(st.trophies.filter((t) => t.startsWith('finish-')).map((t) => t.slice(7)));
  const sprites = HOTSPOTS.map((h) => {
    const g = buildHotspotGraphic(h, cleared);
    g.on('pointertap', () => onHotspotClick(h));
    app.stage.addChild(g);
    return { h, g };
  });

  function onHotspotClick(h) {
    if (h.game) window.__arcadeHub?.openGame?.(h.game);
    else if (h.soon) window.__arcadeHub?.toast?.('Coming soon — this station is still being charted.', '');
    else if (h.hub) {
      const state = Arcade.getState();
      window.__arcadeHub?.toast?.(`Command Center · ${state.xp} XP · ${state.trophies.length} trophies unlocked`, 'success');
    }
  }

  function syncPixi() {
    sprites.forEach(({ h, g }) => {
      const pt = map.latLngToContainerPoint(hotspotLatLng(h, mapH, mapW));
      g.position.set(pt.x, pt.y);
    });
  }

  map.on('move zoom zoomend resize viewreset', syncPixi);
  syncPixi();

  app.ticker.add((ticker) => {
    const alpha = 0.82 + Math.sin(ticker.lastTime / 400) * 0.18;
    sprites.forEach(({ g }) => { if (g._ring) g._ring.alpha = alpha; });
  });

  const ro = new ResizeObserver(() => {
    map.invalidateSize({ animate: false });
    syncPixi();
  });
  ro.observe(containerEl);

  mapInstance = {
    map,
    app,
    pixiWrap,
    ro,
    refreshTrophies() {
      const state = Arcade.getState();
      const done = new Set(state.trophies.filter((t) => t.startsWith('finish-')).map((t) => t.slice(7)));
      sprites.forEach(({ h, g }) => {
        const has = g.children.some((c) => c instanceof Text && c.text === '🏆');
        if (h.game && done.has(h.game) && !has) {
          const trophy = new Text({ text: '🏆', style: { fontSize: 16 } });
          trophy.anchor.set(0.5);
          trophy.position.set(16, -16);
          g.addChild(trophy);
        }
      });
    },
  };
  return mapInstance;
}

export function destroyTreasureMap() {
  if (!mapInstance) return;
  try { mapInstance.ro?.disconnect(); } catch (_) {}
  try { mapInstance.map?.remove(); } catch (_) {}
  try { mapInstance.app?.destroy(true, { children: true }); } catch (_) {}
  try { mapInstance.pixiWrap?.remove(); } catch (_) {}
  mapInstance = null;
}

export function refreshMapTrophies() {
  mapInstance?.refreshTrophies?.();
}

export function invalidateTreasureMap() {
  if (!mapInstance?.map) return;
  mapInstance.map.invalidateSize({ animate: false });
}
