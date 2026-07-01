/* hub.js — Orbitrack Arcade: cozy Pixi treasure map + Phaser mini-games.
 *
 * The arcade is a self-contained warm "cabin" overlay (its own parchment/wood
 * palette, independent of the app theme). Two views share the body:
 *   • map   — the Pixi treasure map (pan/zoom, glowing stations)
 *   • game  — a dedicated Phaser stage flanked by how-to / room-roster panels.
 * The game canvas gets its OWN rectangle (never covered by chrome), which is
 * what makes the games actually playable.
 */
import { getGameIdentity } from './net.js';
import * as Arcade from './achievements.js';
import { SCENE_BY_GAME, GAME_META } from './hotspots.js';
import {
  createTreasureMap, destroyTreasureMap, refreshMapTrophies,
  invalidateTreasureMap, pauseTreasureMap, resumeTreasureMap,
} from './map-pixi.js';
import {
  startArcadePhaser, resizeArcadePhaser, startScene, stopArcadeScenes,
  destroyArcadePhaser, getArcadeGame,
} from './phaser-boot.js';

const CSS_TEXT = `
.arcade,.arcade-backdrop,.arcade-toast-wrap{
  --ac-bg:#1c140d; --ac-panel:#241a11; --ac-panel-2:#2d2115; --ac-card:#f4e7cf;
  --ac-ink:#f6ecd8; --ac-ink-2:#d8c39b; --ac-ink-3:#a58a63; --ac-gold:#e7b64b;
  --ac-gold-soft:#f5d68a; --ac-line:rgba(231,182,75,.24); --ac-line-2:rgba(231,182,75,.14);
  --ac-green:#34d399; --ac-red:#f87171;
}
.arcade-backdrop{position:fixed;inset:0;z-index:8810;background:radial-gradient(120% 120% at 50% 30%,rgba(30,20,10,.55),rgba(8,5,2,.82));backdrop-filter:blur(7px);opacity:0;transition:opacity .22s ease}
.arcade-backdrop.is-open{opacity:1}
.arcade{position:fixed;inset:3vh 3vw;z-index:8820;color:var(--ac-ink);border-radius:18px;overflow:hidden;
  background:linear-gradient(180deg,#241a11,#1a120b);border:1px solid var(--ac-line);
  box-shadow:0 40px 120px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,240,210,.03),inset 0 1px 0 rgba(255,240,210,.06);
  display:flex;flex-direction:column;font-size:13px;font-family:inherit;
  transform:translateY(16px) scale(.99);opacity:0;transition:opacity .24s ease,transform .24s ease}
.arcade.is-open{opacity:1;transform:none}
.arcade-top{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid var(--ac-line-2);
  background:linear-gradient(180deg,rgba(231,182,75,.08),transparent);flex-shrink:0}
.arcade-mark{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  color:#2a1c0b;background:linear-gradient(160deg,var(--ac-gold-soft),var(--ac-gold));box-shadow:0 2px 8px rgba(231,182,75,.35)}
.arcade-title{min-width:0;flex:1}
.arcade-title b{font-size:.98rem;font-weight:800;letter-spacing:.01em;display:block;color:var(--ac-gold-soft)}
.arcade-title span{display:block;font-size:.72rem;color:var(--ac-ink-3);margin-top:2px;line-height:1.35}
.arcade-top .ac-iconbtn{width:32px;height:32px;border-radius:9px;border:1px solid var(--ac-line);background:rgba(255,240,210,.04);
  color:var(--ac-ink-2);font-size:1rem;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:.15s}
.arcade-top .ac-iconbtn:hover{border-color:var(--ac-gold);color:var(--ac-gold-soft);background:rgba(231,182,75,.1)}
.arcade-top .arcade-close{margin-left:4px}
.arcade-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 18px;border-bottom:1px solid var(--ac-line-2);flex-shrink:0}
.arcade-stat{border:1px solid var(--ac-line-2);border-radius:12px;padding:9px 13px;background:rgba(255,240,210,.03);min-height:56px;display:flex;flex-direction:column;justify-content:center}
.arcade-stat .k{font-size:.6rem;letter-spacing:.09em;text-transform:uppercase;color:var(--ac-ink-3);line-height:1.2}
.arcade-stat .v{font-size:1.14rem;font-weight:800;margin-top:3px;font-variant-numeric:tabular-nums;color:var(--ac-gold-soft)}
.arcade-body{flex:1;min-height:280px;position:relative;overflow:hidden;background:#140e08}
.arcade-view{position:absolute;inset:0}
.arcade-view[hidden]{display:none}

/* ── Map view ── */
.arcade-map-root{position:absolute;inset:0;z-index:1;overflow:hidden}
.arcade-map-root .arcade-map-tip{z-index:20}
.arcade-map-head{position:absolute;left:50%;top:14px;transform:translateX(-50%);z-index:6;pointer-events:none;text-align:center;
  padding:7px 16px;border-radius:999px;font-size:.74rem;color:var(--ac-ink-2);line-height:1.4;white-space:nowrap;
  background:rgba(28,18,10,.72);border:1px solid var(--ac-line);box-shadow:0 8px 24px rgba(0,0,0,.35);backdrop-filter:blur(3px)}
.arcade-map-head b{color:var(--ac-gold-soft);font-weight:750}
.arcade-map-hint{position:absolute;right:14px;top:14px;z-index:6;pointer-events:none;font-size:.66rem;color:var(--ac-ink-3);
  background:rgba(28,18,10,.6);border:1px solid var(--ac-line-2);border-radius:9px;padding:5px 9px;line-height:1.5}
.arcade-trophies{position:absolute;left:0;right:0;bottom:0;z-index:6;border-top:1px solid var(--ac-line-2);padding:9px 16px;display:flex;align-items:center;gap:9px;
  overflow-x:auto;min-height:54px;scrollbar-width:thin;background:linear-gradient(0deg,rgba(20,14,8,.94),rgba(20,14,8,.55) 70%,transparent)}
.arcade-trophies .tlabel{font-size:.6rem;letter-spacing:.09em;text-transform:uppercase;color:var(--ac-ink-3);flex-shrink:0;font-weight:800}
.arcade-trophy{display:flex;align-items:center;gap:7px;padding:6px 10px;border-radius:10px;border:1px solid var(--ac-line-2);background:rgba(255,240,210,.04);flex-shrink:0}
.arcade-trophy.locked{opacity:.4;filter:grayscale(.6)}
.arcade-trophy .ico{font-size:1rem;line-height:1}
.arcade-trophy .tt b{font-size:.72rem;display:block;color:var(--ac-ink)}
.arcade-trophy .tt span{font-size:.6rem;color:var(--ac-ink-3);display:block;margin-top:1px}

/* ── Game view ── */
.arcade-view-game{display:flex;flex-direction:column}
.arcade-gv-top{display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--ac-line-2);flex-shrink:0;
  background:linear-gradient(180deg,rgba(231,182,75,.06),transparent)}
.arcade-gv-titles{min-width:0;flex:1}
.arcade-gv-titles b{display:block;font-size:.92rem;font-weight:800;color:var(--ac-gold-soft)}
.arcade-gv-titles span{display:block;font-size:.72rem;color:var(--ac-ink-3);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.arcade-gv-btn{border:1px solid var(--ac-line);background:rgba(255,240,210,.04);color:var(--ac-ink);padding:8px 13px;border-radius:10px;
  font-size:.8rem;font-weight:700;cursor:pointer;flex-shrink:0;transition:.15s}
.arcade-gv-btn:hover{border-color:var(--ac-gold);color:var(--ac-gold-soft);background:rgba(231,182,75,.1)}
.arcade-gv-cols{flex:1;display:grid;grid-template-columns:210px 1fr 190px;min-height:0}
.arcade-gv-left,.arcade-gv-right{padding:13px 12px;overflow:auto;background:rgba(20,14,8,.55);min-width:0}
.arcade-gv-left{border-right:1px solid var(--ac-line-2)}
.arcade-gv-right{border-left:1px solid var(--ac-line-2)}
.arcade-stage{position:relative;min-width:0;min-height:0;background:radial-gradient(120% 120% at 50% 40%,#0f1524,#0a0d16)}
.arcade-stage canvas{display:block;width:100%;height:100%}
.arcade-howto h4{margin:0 0 6px;font-size:.64rem;letter-spacing:.07em;text-transform:uppercase;color:var(--ac-ink-2);font-weight:800}
.arcade-howto p{margin:0 0 9px;font-size:.76rem;line-height:1.55;color:var(--ac-ink-2)}
.arcade-howto .ctrl{font-size:.72rem;color:var(--ac-ink-3);border-top:1px dashed var(--ac-line-2);padding-top:8px;margin-top:4px}
.arcade-side-h{font-size:.6rem;letter-spacing:.09em;text-transform:uppercase;color:var(--ac-ink-3);margin-bottom:9px;font-weight:800}
.arcade-peer{display:flex;align-items:center;gap:8px;padding:5px 2px}
.arcade-peer .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px rgba(0,0,0,.25)}
.arcade-peer .nm{font-size:.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ac-ink)}
.arcade-peer .hostbadge{margin-left:auto;font-size:.56rem;color:var(--ac-gold);border:1px solid var(--ac-line);border-radius:999px;padding:0 6px}

/* ── Toasts ── */
.arcade-toast-wrap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:8900;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.arcade-toast{background:linear-gradient(180deg,#2d2115,#241a11);color:var(--ac-ink);border:1px solid var(--ac-line);border-radius:12px;padding:11px 18px;font-size:.84rem;font-weight:650;
  box-shadow:0 18px 44px rgba(0,0,0,.5);opacity:0;transform:translateY(12px);transition:opacity .25s ease,transform .25s ease;max-width:80vw;pointer-events:auto}
.arcade-toast.show{opacity:1;transform:none}
.arcade-toast.success{border-color:color-mix(in srgb,var(--ac-green) 55%,var(--ac-line))}
.arcade-toast.error{border-color:color-mix(in srgb,var(--ac-red) 55%,var(--ac-line))}
@media (max-width:820px){.arcade-gv-cols{grid-template-columns:1fr}.arcade-gv-left,.arcade-gv-right{display:none}.arcade-stats{grid-template-columns:repeat(2,1fr)}}
`;

// The games hub is disabled for now (being rebuilt around Rive + sprite sheets).
// All the map/scene/hub code below stays intact — flip this to true to bring it
// back. While false, open()/toggle() no-op so no entry point can surface it.
const ARCADE_ENABLED = false;

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
      <span class="dot" style="background:${esc(p.color || '#e7b64b')}"></span>
      <span class="nm">${esc(p.name || 'Player')}</span>
      ${i === 0 ? '<span class="hostbadge">host</span>' : ''}
    </div>`).join('');
}

function showView(view) {
  const isMap = view === 'map';
  rootEl.querySelector('[data-view-map]').hidden = !isMap;
  rootEl.querySelector('[data-view-game]').hidden = isMap;
  if (isMap) resumeTreasureMap(); else pauseTreasureMap();
}

function measureStage() {
  const stage = rootEl?.querySelector('.arcade-stage');
  if (!stage) return { w: 640, h: 400 };
  return { w: Math.max(320, stage.clientWidth), h: Math.max(240, stage.clientHeight) };
}

async function ensureTreasureMap() {
  const host = rootEl?.querySelector('#arcade-map-root');
  if (!host) return;
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
  const { w, h } = measureStage();
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
  // Two frames: let the stage lay out at its real size before Phaser measures it.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ensurePhaserGame();
    startScene(sceneKey);
    renderPeers(null);
  }));
}

async function backToMap() {
  currentGameId = null;
  stopArcadeScenes();
  showView('map');
  renderPeers(null);
  await ensureTreasureMap();
}

function resetCurrentGame() {
  const g = getArcadeGame();
  if (!g) return;
  const active = g.scene.getScenes(true).find((s) => s.sys.isActive() && s.scene.key !== 'BootScene');
  try { active?.resetGame?.(); } catch (_) {}
}

function toggleMute(btn) {
  window.__arcadeMuted = !window.__arcadeMuted;
  btn.textContent = window.__arcadeMuted ? '🔇' : '🔊';
  btn.title = window.__arcadeMuted ? 'Sound off' : 'Sound on';
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
      <div class="arcade-mark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h4M8 10v4"/><circle cx="16" cy="11" r="1"/><circle cx="18" cy="14" r="1"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg></div>
      <div class="arcade-title"><b>Orbitrack Arcade</b><span>A cozy hidden harbor · pan the map, pick a station, play together</span></div>
      <button class="ac-iconbtn arcade-mute" title="Sound on">🔊</button>
      <button class="ac-iconbtn arcade-close" aria-label="Close">×</button>
    </div>
    <div class="arcade-stats">
      <div class="arcade-stat"><div class="k">Players online</div><div class="v" data-stat="players">1</div></div>
      <div class="arcade-stat"><div class="k">Arcade XP</div><div class="v" data-stat="xp">0</div></div>
      <div class="arcade-stat"><div class="k">Trophies</div><div class="v" data-stat="trophies">0/0</div></div>
      <div class="arcade-stat"><div class="k">Session</div><div class="v" data-stat="session">0:00</div></div>
    </div>
    <div class="arcade-body">
      <div class="arcade-view arcade-view-map" data-view-map>
        <div id="arcade-map-root" class="arcade-map-root"></div>
        <div class="arcade-map-head"><b>Team treasure map</b> · click a glowing station to play</div>
        <div class="arcade-map-hint">drag to pan · scroll to zoom · double-click to zoom in</div>
        <div class="arcade-trophies" data-trophies></div>
      </div>
      <div class="arcade-view arcade-view-game" data-view-game hidden>
        <div class="arcade-gv-top">
          <button class="arcade-gv-btn" data-back>← Map</button>
          <div class="arcade-gv-titles"><b data-gtitle>Game</b><span data-gdesc></span></div>
          <button class="arcade-gv-btn" data-reset>↻ Reset</button>
        </div>
        <div class="arcade-gv-cols">
          <div class="arcade-gv-left"><div class="arcade-howto" data-howto></div></div>
          <div class="arcade-stage"><div id="arcade-phaser-root" style="position:absolute;inset:0"></div></div>
          <div class="arcade-gv-right">
            <div class="arcade-side-h">In this room</div>
            <div data-peers></div>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(backdropEl);
  document.body.appendChild(rootEl);

  rootEl.querySelector('.arcade-close').addEventListener('click', close);
  const muteBtn = rootEl.querySelector('.arcade-mute');
  muteBtn.addEventListener('click', () => toggleMute(muteBtn));
  rootEl.querySelector('[data-back]').addEventListener('click', () => { backToMap(); });
  rootEl.querySelector('[data-reset]').addEventListener('click', resetCurrentGame);

  window.__arcadeHub = { openGame, toast, renderPeers, backToMap };

  unsubArcade = Arcade.subscribe(() => { refreshStats(); renderTrophies(); });
  mounted = true;
}

function open(clickCount) {
  if (!ARCADE_ENABLED) return;
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
    setTimeout(() => { ensureTreasureMap(); }, 90);
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
