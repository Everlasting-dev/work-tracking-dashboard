/* hub.js — Orbitrack Arcade: Leaflet+Pixi map, Phaser games */
import { getGameIdentity } from './net.js';
import * as Arcade from './achievements.js';
import { SCENE_BY_GAME, GAME_META } from './hotspots.js';
import { createTreasureMap, destroyTreasureMap, refreshMapTrophies, invalidateTreasureMap } from './map-leaflet-pixi.js';
import { startArcadePhaser, resizeArcadePhaser, startScene, destroyArcadePhaser, getArcadeGame } from './phaser-boot.js';

const CSS_TEXT = `
.arcade-backdrop{position:fixed;inset:0;z-index:8810;background:color-mix(in srgb,var(--bg) 40%,transparent);backdrop-filter:blur(6px);opacity:0;transition:opacity .2s ease}
.arcade-backdrop.is-open{opacity:1}
.arcade{position:fixed;inset:3vh 3vw;z-index:8820;background:var(--card);color:var(--text);border:1px solid var(--border);
  border-radius:var(--radius,12px);box-shadow:var(--shadow-lg,0 40px 120px rgba(0,0,0,.25));display:flex;flex-direction:column;overflow:hidden;
  transform:translateY(14px) scale(.99);opacity:0;transition:opacity .22s ease,transform .22s ease;font-size:13px;font-family:inherit}
.arcade.is-open{opacity:1;transform:none}
.arcade-top{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border);background:var(--bg);flex-shrink:0}
.arcade-mark{width:28px;height:28px;border-radius:8px;background:var(--accent);color:var(--card);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.arcade-title{min-width:0;flex:1}
.arcade-title b{font-size:.95rem;font-weight:750;letter-spacing:.01em;display:block}
.arcade-title span{display:block;font-size:.72rem;color:var(--text-muted);margin-top:2px;line-height:1.35}
.arcade-top .arcade-close{margin-left:auto;width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text-secondary);font-size:1.15rem;cursor:pointer;flex-shrink:0}
.arcade-top .arcade-close:hover{border-color:var(--accent);color:var(--text)}
.arcade-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 18px;border-bottom:1px solid var(--border-light);flex-shrink:0}
.arcade-stat{border:1px solid var(--border-light);border-radius:10px;padding:10px 12px;background:var(--bg);display:flex;flex-direction:column;justify-content:center;min-height:58px}
.arcade-stat .k{font-size:.62rem;letter-spacing:.07em;text-transform:uppercase;color:var(--text-muted);line-height:1.2}
.arcade-stat .v{font-size:1.12rem;font-weight:750;margin-top:4px;font-variant-numeric:tabular-nums;color:var(--text)}
.arcade-body{flex:1;min-height:280px;position:relative;background:var(--bg)}
.arcade-map-root{position:absolute;inset:0;z-index:1}
.arcade-map-root .leaflet-container{width:100%;height:100%;background:#0b0e14}
.arcade-phaser-root{position:absolute;inset:0;z-index:2;display:none}
.arcade-phaser-root.is-active{display:block}
.arcade-phaser-root canvas{border-radius:0}
.arcade-map-ui{position:absolute;inset:0;z-index:3;pointer-events:none;display:flex;flex-direction:column;min-height:0}
.arcade-map-head{padding:10px 18px 8px;font-size:.76rem;color:var(--text-secondary);line-height:1.4;flex-shrink:0;background:linear-gradient(var(--bg),transparent)}
.arcade-map-head b{color:var(--text);font-weight:650}
.arcade-map-ui .arcade-trophies{margin-top:auto}
.arcade-trophies{border-top:1px solid var(--border-light);padding:10px 18px;display:flex;align-items:center;gap:10px;overflow-x:auto;min-height:56px;scrollbar-width:thin;background:color-mix(in srgb,var(--bg) 92%,transparent);flex-shrink:0}
.arcade-trophies .tlabel{font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);flex-shrink:0;font-weight:700}
.arcade-trophy{display:flex;align-items:center;gap:7px;padding:6px 10px;border-radius:9px;border:1px solid var(--border-light);background:var(--card);flex-shrink:0}
.arcade-trophy.locked{opacity:.38;filter:grayscale(1)}
.arcade-trophy .ico{font-size:1rem;line-height:1}
.arcade-trophy .tt b{font-size:.72rem;display:block;color:var(--text)}
.arcade-trophy .tt span{font-size:.62rem;color:var(--text-muted);display:block;margin-top:1px}
.arcade-gameview{position:absolute;inset:0;z-index:4;pointer-events:none;display:grid;grid-template-columns:220px 1fr 200px;min-height:0}
.arcade-gv-left{border-right:1px solid var(--border-light);padding:14px 12px;display:flex;flex-direction:column;gap:8px;overflow:auto;pointer-events:auto;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(4px)}
.arcade-gv-btn{border:1px solid var(--border);background:var(--card);color:var(--text);padding:9px 12px;border-radius:9px;font-size:.8rem;font-weight:650;cursor:pointer;text-align:left;width:100%}
.arcade-gv-btn:hover{border-color:var(--accent);background:var(--accent-light,var(--bg))}
.arcade-howto{margin-top:4px;border:1px solid var(--border-light);border-radius:10px;background:var(--card);padding:11px 12px}
.arcade-howto h4{margin:0 0 6px;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-secondary);font-weight:700}
.arcade-howto p{margin:0 0 8px;font-size:.76rem;line-height:1.55;color:var(--text-secondary)}
.arcade-howto .ctrl{font-size:.72rem;color:var(--text-muted);border-top:1px dashed var(--border-light);padding-top:7px;margin-top:4px}
.arcade-main{pointer-events:none;min-width:0}
.arcade-main-h{display:flex;align-items:baseline;gap:10px;padding:10px 14px;font-size:.72rem;color:var(--text-muted);flex-wrap:wrap;background:linear-gradient(var(--bg),transparent);pointer-events:none}
.arcade-main-h b{color:var(--text);font-size:.84rem;font-weight:700}
.arcade-side{border-left:1px solid var(--border-light);padding:12px 14px;overflow:auto;pointer-events:auto;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(4px)}
.arcade-side-h{font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;font-weight:700}
.arcade-peer{display:flex;align-items:center;gap:8px;padding:6px 2px}
.arcade-peer .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.arcade-peer .nm{font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
.arcade-peer .hostbadge{margin-left:auto;font-size:.58rem;color:var(--accent);border:1px solid var(--border);border-radius:999px;padding:0 6px}
.arcade-toast-wrap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:8900;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.arcade-toast{background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:11px;padding:11px 18px;font-size:.84rem;font-weight:600;
  box-shadow:var(--shadow-lg);opacity:0;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease;max-width:80vw;pointer-events:auto}
.arcade-toast.show{opacity:1;transform:none}
.arcade-toast.success{border-color:color-mix(in srgb,var(--green,#22c55e) 50%,var(--border))}
.arcade-toast.error{border-color:color-mix(in srgb,var(--danger,#ef4444) 50%,var(--border))}
@media (max-width:820px){.arcade-gameview{grid-template-columns:1fr}.arcade-gv-left,.arcade-side{display:none}.arcade-stats{grid-template-columns:repeat(2,1fr)}}
`;

let backdropEl = null, rootEl = null, mounted = false, isOpen = false, openedAt = 0;
let sessionTimer = null, sessionStart = 0, unsubArcade = null;
let currentGameId = null;
let mapReady = false;

function injectStyles() {
  if (document.getElementById('orbi-arcade-style')) return;
  const s = document.createElement('style');
  s.id = 'orbi-arcade-style';
  s.textContent = CSS_TEXT;
  document.head.appendChild(s);
}

function toast(msg, kind) {
  let wrap = document.querySelector('.arcade-toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'arcade-toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'arcade-toast' + (kind ? ' ' + kind : '');
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3800);
}
window.OrbiGamesToast = toast;

function esc(s) { return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function renderTrophies() {
  const box = rootEl?.querySelector('[data-trophies]');
  if (!box) return;
  const st = Arcade.getState();
  const owned = new Set(st.trophies);
  const chips = Arcade.TROPHIES.map((t) => {
    const has = owned.has(t.id);
    return `<div class="arcade-trophy ${has ? '' : 'locked'}" title="${esc(t.desc)}">
      <span class="ico">${t.icon}</span><span class="tt"><b>${esc(t.title)}</b><span>${esc(t.desc)}</span></span>
    </div>`;
  }).join('');
  box.innerHTML = `<span class="tlabel">Trophies</span>${chips}`;
  refreshMapTrophies();
}

function refreshStats() {
  const st = Arcade.getState();
  setStat('xp', st.xp);
  setStat('trophies', st.trophies.length + '/' + (Arcade.TROPHIES.length));
}
function setStat(name, value) {
  const el = rootEl?.querySelector(`[data-stat="${name}"]`);
  if (el) el.textContent = value;
}

function renderPeers(players) {
  const box = rootEl?.querySelector('[data-peers]');
  if (!box) return;
  const list = (players && players.length) ? players : [{ ...getGameIdentity(), key: 'me' }];
  setStat('players', list.length);
  box.innerHTML = list.map((p, i) => `
    <div class="arcade-peer">
      <span class="dot" style="background:${esc(p.color || '#818cf8')}"></span>
      <span class="nm">${esc(p.name || 'Player')}</span>
      ${i === 0 ? '<span class="hostbadge">host</span>' : ''}
    </div>`).join('');
}

function showView(view) {
  const isMap = view === 'map';
  rootEl.querySelector('.arcade-map-ui').hidden = !isMap;
  rootEl.querySelector('[data-view="game"]').hidden = isMap;
  rootEl.querySelector('#arcade-map-root').hidden = !isMap;
  const phaserHost = rootEl.querySelector('#arcade-phaser-root');
  if (isMap) phaserHost.classList.remove('is-active');
  else phaserHost.classList.add('is-active');
}

function measurePhaserHost() {
  const body = rootEl?.querySelector('.arcade-body');
  if (!body) return { w: 640, h: 400 };
  return { w: Math.max(320, body.clientWidth), h: Math.max(240, body.clientHeight) };
}

async function ensureTreasureMap() {
  const host = rootEl?.querySelector('#arcade-map-root');
  if (!host || host.hidden) return;
  if (!mapReady) {
    await createTreasureMap(host);
    mapReady = true;
  } else {
    invalidateTreasureMap();
  }
}

function ensurePhaserGame() {
  const host = rootEl?.querySelector('#arcade-phaser-root');
  if (!host) return;
  const { w, h } = measurePhaserHost();
  if (!getArcadeGame()) startArcadePhaser(host, w, h);
  else resizeArcadePhaser(w, h);
}

function openGame(id) {
  const sceneKey = SCENE_BY_GAME[id];
  const meta = GAME_META[id];
  if (!sceneKey || !meta) return;
  currentGameId = id;
  showView('game');
  rootEl.querySelector('[data-gtitle]').textContent = meta.title;
  rootEl.querySelector('[data-gdesc]').textContent = meta.desc;
  const howto = rootEl.querySelector('[data-howto]');
  howto.innerHTML = `<h4>How to play</h4><p>${esc(meta.tutorial?.how || '')}</p>${meta.tutorial?.controls ? `<div class="ctrl">${esc(meta.tutorial.controls)}</div>` : ''}`;
  destroyArcadePhaser();
  requestAnimationFrame(() => {
    ensurePhaserGame();
    startScene(sceneKey);
    renderPeers(null);
  });
}

async function backToMap() {
  currentGameId = null;
  destroyArcadePhaser();
  showView('map');
  renderPeers(null);
  await ensureTreasureMap();
}

function resetCurrentGame() {
  const g = getArcadeGame();
  if (!g) return;
  const active = g.scene.getScenes(true).find((s) => s.sys.isActive());
  try { active?.resetGame?.(); } catch (_) {}
}

function build() {
  if (mounted) return;
  injectStyles();

  backdropEl = document.createElement('div');
  backdropEl.className = 'arcade-backdrop';
  backdropEl.style.display = 'none';
  backdropEl.addEventListener('click', () => { if (Date.now() - openedAt < 700) return; close(); });

  rootEl = document.createElement('div');
  rootEl.className = 'arcade';
  rootEl.style.display = 'none';
  rootEl.innerHTML = `
    <div class="arcade-top">
      <div class="arcade-mark"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h4M8 10v4"/><circle cx="16" cy="11" r="1"/><circle cx="18" cy="14" r="1"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg></div>
      <div class="arcade-title"><b>Orbitrack Arcade</b><span>Hidden co-op space · pick a station on the map</span></div>
      <button class="arcade-close" aria-label="Close">×</button>
    </div>
    <div class="arcade-stats">
      <div class="arcade-stat"><div class="k">Players online</div><div class="v" data-stat="players">1</div></div>
      <div class="arcade-stat"><div class="k">Arcade XP</div><div class="v" data-stat="xp">0</div></div>
      <div class="arcade-stat"><div class="k">Trophies</div><div class="v" data-stat="trophies">0/0</div></div>
      <div class="arcade-stat"><div class="k">Session</div><div class="v" data-stat="session">0:00</div></div>
    </div>
    <div class="arcade-body">
      <div id="arcade-map-root" class="arcade-map-root"></div>
      <div id="arcade-phaser-root" class="arcade-phaser-root"></div>
      <div class="arcade-map-ui" data-view="map">
        <div class="arcade-map-head"><b>Team treasure map</b> · click a numbered station to play (or explore what's coming)</div>
        <div class="arcade-trophies" data-trophies></div>
      </div>
      <div class="arcade-gameview" data-view="game" hidden>
        <div class="arcade-gv-left">
          <button class="arcade-gv-btn" data-back>← Back to map</button>
          <button class="arcade-gv-btn" data-reset>↻ Reset game</button>
          <div class="arcade-howto" data-howto></div>
        </div>
        <div class="arcade-main">
          <div class="arcade-main-h"><b data-gtitle>Game</b><span data-gdesc></span></div>
        </div>
        <div class="arcade-side">
          <div class="arcade-side-h">In this room</div>
          <div data-peers></div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(backdropEl);
  document.body.appendChild(rootEl);

  rootEl.querySelector('.arcade-close').addEventListener('click', close);
  rootEl.querySelector('[data-back]').addEventListener('click', () => { backToMap(); });
  rootEl.querySelector('[data-reset]').addEventListener('click', resetCurrentGame);

  window.__arcadeHub = { openGame, toast, renderPeers, backToMap };

  unsubArcade = Arcade.subscribe(() => { refreshStats(); renderTrophies(); });
  mounted = true;
}

function open(clickCount) {
  build();
  isOpen = true;
  openedAt = Date.now();
  mapReady = false;
  try { Arcade.award('enter-space', { clicks: clickCount }); } catch (_) {}
  if (typeof clickCount === 'number') {
    setTimeout(() => toast(`Congratulations — you wasted ${clickCount} clicks trying to spin the logo. Here are some games.`, 'success'), 400);
  }
  showView('map');
  refreshStats();
  renderTrophies();
  renderPeers(null);
  backdropEl.style.display = 'block';
  rootEl.style.display = 'flex';
  requestAnimationFrame(() => {
    backdropEl.classList.add('is-open');
    rootEl.classList.add('is-open');
    setTimeout(() => { ensureTreasureMap(); }, 80);
  });
  sessionStart = Date.now();
  clearInterval(sessionTimer);
  sessionTimer = setInterval(() => {
    const s = Math.floor((Date.now() - sessionStart) / 1000);
    setStat('session', Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'));
  }, 1000);
  window.addEventListener('resize', onArcadeResize);
}

function onArcadeResize() {
  if (!isOpen) return;
  if (currentGameId) ensurePhaserGame();
  else invalidateTreasureMap();
}

function close() {
  if (!mounted || !isOpen) return;
  isOpen = false;
  currentGameId = null;
  mapReady = false;
  clearInterval(sessionTimer);
  window.removeEventListener('resize', onArcadeResize);
  destroyArcadePhaser();
  destroyTreasureMap();
  backdropEl.classList.remove('is-open');
  rootEl.classList.remove('is-open');
  setTimeout(() => { if (backdropEl) backdropEl.style.display = 'none'; if (rootEl) rootEl.style.display = 'none'; }, 220);
}

function toggle() { isOpen ? close() : open(); }

window.OrbiGames = { open, close, toggle };
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) close(); });

export { open, close, toggle };
