/* achievements.js — persistent score + trophy engine for the Orbitrack Arcade.
 *
 * Stores per-user progress in localStorage (orbi-arcade-<userId>): total XP,
 * per-game high scores, unlocked trophies, and play stats. Games and the hub
 * call OrbiArcade.award(event, meta) which returns any newly-unlocked trophies
 * (and toasts them). Subscribers (the hub) re-render when progress changes.
 */
import { getGameIdentity } from './net.js';

// Trophy catalogue. `test(state, meta)` decides if it should unlock now.
const TROPHIES = [
  { id: 'time-waster', icon: '🏆', title: 'Time Waster', desc: 'Spam-clicked your way into the arcade.', test: (_s, m, ev) => ev === 'enter-space' },
  { id: 'first-contact', icon: '🎮', title: 'First Contact', desc: 'Played your first game.', test: (s) => s.stats.played >= 1 },
  { id: 'victory-lap', icon: '🥇', title: 'Victory Lap', desc: 'Won a game.', test: (s) => s.stats.won >= 1 },
  { id: 'good-sport', icon: '🎏', title: 'Good Sport', desc: 'Lost a game — it happens.', test: (s) => s.stats.lost >= 1 },
  { id: 'hat-trick', icon: '⭐', title: 'Hat Trick', desc: 'Won three games.', test: (s) => s.stats.won >= 3 },
  { id: 'orbiter', icon: '🌌', title: 'Orbiter', desc: 'Earned 500 arcade XP.', test: (s) => s.xp >= 500 },
];

// Per-game "finish" trophies are generated on demand: finish-<gameId>.
function finishTrophy(gameId, title) {
  return { id: 'finish-' + gameId, icon: '🚀', title: 'Cleared: ' + (title || gameId), desc: 'Completed ' + (title || gameId) + '.' };
}

const XP = { 'game-start': 5, win: 40, lose: 10, finish: 60, score: 0 };

let state = null;
let storeKey = null;
const listeners = new Set();

function load() {
  const me = getGameIdentity();
  storeKey = 'orbi-arcade-' + me.id;
  try {
    state = JSON.parse(localStorage.getItem(storeKey) || 'null');
  } catch (_) { state = null; }
  if (!state || typeof state !== 'object') {
    state = { xp: 0, highScores: {}, trophies: [], stats: { played: 0, won: 0, lost: 0, finished: 0 } };
  }
  state.stats = state.stats || { played: 0, won: 0, lost: 0, finished: 0 };
  state.highScores = state.highScores || {};
  state.trophies = state.trophies || [];
  return state;
}

function save() {
  try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch (_) {}
  listeners.forEach((fn) => { try { fn(state); } catch (_) {} });
}

function unlock(trophy) {
  if (!trophy || state.trophies.includes(trophy.id)) return false;
  state.trophies.push(trophy.id);
  state.xp += 25; // trophy bonus
  try { window.OrbiGamesToast?.(`🏆 Trophy unlocked — ${trophy.title}`, 'success'); } catch (_) {}
  return true;
}

function trophyMeta(id) {
  const known = TROPHIES.find((t) => t.id === id);
  if (known) return known;
  if (id.startsWith('finish-')) return finishTrophy(id.slice(7));
  return { id, icon: '🏆', title: id, desc: '' };
}

/**
 * award(event, meta) — event ∈ enter-space | game-start | win | lose | finish | score
 * meta: { gameId, title, score }
 * Returns the array of newly-unlocked trophy objects.
 */
function award(event, meta = {}) {
  if (!state) load();
  const unlocked = [];

  if (XP[event]) state.xp += XP[event];

  if (event === 'game-start') state.stats.played += 1;
  else if (event === 'win') state.stats.won += 1;
  else if (event === 'lose') state.stats.lost += 1;
  else if (event === 'finish') state.stats.finished += 1;
  else if (event === 'score' && meta.gameId != null) {
    const cur = state.highScores[meta.gameId] || 0;
    if ((meta.score || 0) > cur) { state.highScores[meta.gameId] = meta.score; state.xp += Math.max(0, meta.score | 0); }
  }

  // Standard trophies
  TROPHIES.forEach((t) => { if (t.test(state, meta, event) && unlock(t)) unlocked.push(t); });
  // Per-game finish trophy
  if (event === 'finish' && meta.gameId) {
    const ft = finishTrophy(meta.gameId, meta.title);
    if (unlock(ft)) unlocked.push(ft);
  }

  save();
  // Bridge arcade milestones into the app-wide, team-visible trophy shelf.
  try {
    if (event === 'enter-space') window.OrbiTrophies?.award('arcade-enter');
    else if (event === 'finish') window.OrbiTrophies?.award('game-clear', { gameId: meta.gameId });
  } catch (_) {}
  return unlocked;
}

function getState() { if (!state) load(); return JSON.parse(JSON.stringify(state)); }
function getTrophies() { if (!state) load(); return state.trophies.map(trophyMeta); }
function allTrophies() {
  if (!state) load();
  const dynamic = Object.keys(state.highScores).length ? [] : [];
  return TROPHIES.concat(dynamic);
}
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

load();
window.OrbiArcade = { award, getState, getTrophies, allTrophies, subscribe, TROPHIES };

export { award, getState, getTrophies, allTrophies, subscribe, TROPHIES };
