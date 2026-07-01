/* trophies.js — Orbitrack achievement engine (app-wide, team-visible).
 *
 * Loaded BEFORE app.js so window.OrbiTrophies exists everywhere (unlike the
 * arcade's window.OrbiArcade, which only lives inside the games bundle). Earns
 * trophies for TASK activity, PROJECT completion, RANDOM surprises, and bridges
 * ARCADE game clears in from hub.js. Earned trophies persist on the user's
 * profile record (DB.updateUser → wt_users.trophies) so teammates see them on
 * your player card, with a localStorage cache for instant/offline load.
 *
 * API:
 *   OrbiTrophies.award(event, meta)   — event ∈ task-created | task-done |
 *                                        project-done | game-clear | arcade-enter
 *   OrbiTrophies.hydrate(userRecord)  — merge a freshly-loaded profile's trophies
 *   OrbiTrophies.forUser(userRecord)  — resolve any user's earned → display objects
 *   OrbiTrophies.earned()             — current user's earned [{id, at}]
 *   OrbiTrophies.CATALOGUE / metaFor(id) / subscribe(fn)
 */
(function () {
  'use strict';

  // category: 'task' | 'project' | 'arcade' | 'surprise'
  const CATALOGUE = [
    { id: 'first-task',   icon: '🎯', title: 'Getting Started', desc: 'Completed your first task.',        category: 'task',     test: (c) => c.tasksDone >= 1 },
    { id: 'ten-tasks',    icon: '✅', title: 'Taskmaster',      desc: 'Completed 10 tasks.',                category: 'task',     test: (c) => c.tasksDone >= 10 },
    { id: 'fifty-tasks',  icon: '🏅', title: 'Centurion',       desc: 'Completed 50 tasks.',                category: 'task',     test: (c) => c.tasksDone >= 50 },
    { id: 'hundred-tasks',icon: '👑', title: 'Unstoppable',     desc: 'Completed 100 tasks.',               category: 'task',     test: (c) => c.tasksDone >= 100 },
    { id: 'creator',      icon: '✍️', title: 'Architect',       desc: 'Created your first task.',           category: 'task',     test: (c) => c.tasksCreated >= 1 },
    { id: 'busy-bee',     icon: '🐝', title: 'Busy Bee',        desc: 'Created 25 tasks.',                  category: 'task',     test: (c) => c.tasksCreated >= 25 },
    { id: 'finisher',     icon: '🏗️', title: 'Finisher',        desc: 'Saw a whole project through to done.',category: 'project',  test: (c) => c.projectsDone >= 1 },
    { id: 'closer',       icon: '📦', title: 'The Closer',      desc: 'Completed 5 projects.',              category: 'project',  test: (c) => c.projectsDone >= 5 },
    { id: 'lucky-star',   icon: '🍀', title: 'Lucky Star',      desc: 'A rare drop for finishing a task at just the right moment.', category: 'surprise', test: (c, m, ev) => ev === 'task-done' && m && m.__lucky },
    { id: 'arcade-found', icon: '🕹️', title: 'Secret Keeper',   desc: 'Discovered the hidden arcade.',      category: 'arcade',   test: (c) => c.arcadeVisited >= 1 },
    { id: 'cosmic-mech',  icon: '🚀', title: 'Cosmic Mechanic', desc: 'Cleared an arcade game.',            category: 'arcade',   test: (c) => c.gamesCleared >= 1 },
  ];
  const CAT_INDEX = Object.fromEntries(CATALOGUE.map((t) => [t.id, t]));
  const LUCKY_CHANCE = 0.06;

  const listeners = new Set();
  let userId = null;
  let state = null; // { earned: [{id, at}], counters: {...} }

  function defaultState() {
    return { earned: [], counters: { tasksDone: 0, tasksCreated: 0, projectsDone: 0, gamesCleared: 0, arcadeVisited: 0 } };
  }

  function sessionUserId() {
    try {
      if (typeof window.WT_getActiveSession === 'function') {
        const s = window.WT_getActiveSession();
        if (s && s.userId != null) return String(s.userId);
      }
      const raw = sessionStorage.getItem('wt-session');
      const s = raw ? JSON.parse(raw) : null;
      return s && s.userId != null ? String(s.userId) : null;
    } catch (_) { return null; }
  }

  function keyFor(uid) { return 'orbi-trophies-' + uid; }

  function load(uid) {
    try {
      const raw = localStorage.getItem(keyFor(uid));
      const s = raw ? JSON.parse(raw) : null;
      if (s && typeof s === 'object') {
        s.earned = Array.isArray(s.earned) ? s.earned : [];
        s.counters = Object.assign(defaultState().counters, s.counters || {});
        return s;
      }
    } catch (_) {}
    return defaultState();
  }

  function save() {
    if (!userId) return;
    try { localStorage.setItem(keyFor(userId), JSON.stringify(state)); } catch (_) {}
  }

  function ensureUser() {
    const uid = sessionUserId();
    if (uid && uid !== userId) { userId = uid; state = load(uid); }
    if (!state) state = defaultState();
    return !!userId;
  }

  function hasEarned(id) { return state.earned.some((e) => e.id === id); }

  function notify() {
    listeners.forEach((fn) => { try { fn(state); } catch (_) {} });
    try { window.dispatchEvent(new CustomEvent('orbi-trophies-changed', { detail: { userId, earned: state.earned } })); } catch (_) {}
  }

  function toast(trophy) {
    // Reuse the arcade toast if it's mounted; else a small self-contained one.
    if (typeof window.OrbiGamesToast === 'function') {
      window.OrbiGamesToast('🏆 Trophy unlocked — ' + trophy.title, 'success');
      return;
    }
    try {
      let wrap = document.querySelector('.orbi-trophy-toasts');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'orbi-trophy-toasts';
        wrap.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:12000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none';
        document.body.appendChild(wrap);
      }
      const t = document.createElement('div');
      t.style.cssText = 'display:flex;align-items:center;gap:10px;background:linear-gradient(180deg,#2d2115,#241a11);color:#f6ecd8;border:1px solid rgba(231,182,75,.5);'
        + 'border-radius:12px;padding:11px 16px;font:600 13px/1.3 Inter,system-ui,sans-serif;box-shadow:0 18px 44px rgba(0,0,0,.5);opacity:0;transform:translateY(12px);transition:.25s';
      t.innerHTML = '<span style="font-size:1.3rem">' + trophy.icon + '</span><span><b style="color:#f5d68a">Trophy unlocked</b><br>' + trophy.title + '</span>';
      wrap.appendChild(t);
      requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'none'; });
      setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; setTimeout(() => t.remove(), 320); }, 4200);
    } catch (_) {}
  }

  function persistToProfile() {
    if (!userId) return;
    try {
      const DB = window.DB || window.LocalDB;
      if (DB && typeof DB.updateUser === 'function') {
        // Store the raw earned list on the profile; sync pushes it to wt_users.trophies.
        Promise.resolve(DB.updateUser(Number(userId), { trophies: state.earned }, Number(userId))).catch(() => {});
      }
    } catch (_) {}
  }

  function evaluate(event, meta) {
    let unlocked = [];
    CATALOGUE.forEach((t) => {
      if (hasEarned(t.id)) return;
      let ok = false;
      try { ok = !!t.test(state.counters, meta, event); } catch (_) { ok = false; }
      if (ok) {
        state.earned.push({ id: t.id, at: new Date().toISOString() });
        unlocked.push(t);
      }
    });
    if (unlocked.length) {
      save();
      persistToProfile();
      unlocked.forEach((t) => {
        toast(t);
        if (t.category === 'surprise' || t.id === 'hundred-tasks' || t.id === 'closer') {
          try { window.OrbiFun && window.OrbiFun.celebrate && window.OrbiFun.celebrate({ big: true }); } catch (_) {}
        }
      });
      notify();
    }
    return unlocked;
  }

  function award(event, meta) {
    if (!ensureUser()) return [];
    meta = meta || {};
    const c = state.counters;
    if (event === 'task-created') c.tasksCreated += 1;
    else if (event === 'task-done') { c.tasksDone += 1; if (!hasEarned('lucky-star') && Math.random() < LUCKY_CHANCE) meta.__lucky = true; }
    else if (event === 'project-done') c.projectsDone += 1;
    else if (event === 'game-clear') c.gamesCleared += 1;
    else if (event === 'arcade-enter') c.arcadeVisited = 1;
    save();
    return evaluate(event, meta);
  }

  // Merge trophies loaded from a profile record (e.g. earned on another device).
  function hydrate(userRecord) {
    if (!userRecord) return;
    ensureUser();
    if (String(userRecord.id) !== String(userId)) return; // only merge our own
    const incoming = Array.isArray(userRecord.trophies) ? userRecord.trophies : [];
    let changed = false;
    incoming.forEach((e) => {
      const id = typeof e === 'string' ? e : e && e.id;
      if (id && !hasEarned(id)) { state.earned.push({ id, at: (e && e.at) || new Date().toISOString() }); changed = true; }
    });
    if (changed) { save(); notify(); }
  }

  // Resolve any user's earned list into display objects (for teammates' cards).
  function forUser(userRecord) {
    let list;
    if (userRecord && String(userRecord.id) === String(userId) && state) list = state.earned;
    else list = (userRecord && Array.isArray(userRecord.trophies)) ? userRecord.trophies : [];
    return list
      .map((e) => {
        const id = typeof e === 'string' ? e : e && e.id;
        const meta = CAT_INDEX[id];
        return meta ? Object.assign({ at: (e && e.at) || null }, meta) : null;
      })
      .filter(Boolean);
  }

  function earned() { ensureUser(); return state ? state.earned.slice() : []; }
  function metaFor(id) { return CAT_INDEX[id] || null; }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  window.OrbiTrophies = { award, hydrate, forUser, earned, metaFor, subscribe, CATALOGUE };
})();
