/* net.js — tiny multiplayer transport for the Orbitrack games hub.
 *
 * Rides the app's EXISTING shared Supabase Realtime client (no new server),
 * mirroring the collaborative-canvas pattern in build-src/orbicanvas.jsx:
 *   sb.channel('orbi-games:<id>', { config:{ broadcast:{ self:false, ack:false },
 *                                             presence:{ key:<uid> } } })
 * Broadcast events: 'state' (host → clients), 'input' (clients → host),
 * plus Realtime presence for the live lobby / who's-here list.
 *
 * Identity comes from the app session (window.WT_getActiveSession / wt-session),
 * the same source canvas.js:529 uses.
 */

export function getGameIdentity() {
  let s = null;
  try {
    if (typeof window.WT_getActiveSession === 'function') s = window.WT_getActiveSession();
    if (!s) s = JSON.parse(sessionStorage.getItem('wt-session') || 'null');
  } catch (_) { s = null; }
  const id = s?.userId != null ? String(s.userId) : ('guest-' + Math.random().toString(36).slice(2, 8));
  const name = s?.displayName || s?.username || 'Player';
  const color = s?.color || pickColor(id);
  return { id, name, color };
}

const PALETTE = ['#818cf8', '#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#f472b6', '#2dd4bf'];
export function pickColor(seed) {
  const s = String(seed || '0');
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n + s.charCodeAt(i)) % PALETTE.length;
  return PALETTE[n];
}

function flatten(presenceState) {
  const out = [];
  Object.keys(presenceState || {}).forEach((key) => {
    const metas = presenceState[key];
    if (metas && metas.length) out.push({ key, ...metas[0] });
  });
  // Stable order: earliest joiner first (also used to elect the host).
  out.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0) || String(a.id).localeCompare(String(b.id)));
  return out;
}

/**
 * Join a game's realtime room. Returns null if realtime isn't available
 * (offline / no cloud) — callers then run the game in solo mode.
 *
 * handlers: { onState, onInput, onPresence(players) }
 */
export function joinGameChannel(gameId, handlers = {}) {
  const sb = (window.SupabaseDB && window.SupabaseDB._client)
    || window.SyncEngine?.getClient?.()
    || null;
  const me = getGameIdentity();
  if (!sb || !navigator.onLine) return null;

  let channel;
  try {
    channel = sb.channel('orbi-games:' + gameId, {
      config: { broadcast: { self: false, ack: false }, presence: { key: me.id } },
    });
  } catch (_) {
    return null;
  }

  channel.on('broadcast', { event: 'state' }, ({ payload }) => { try { handlers.onState?.(payload); } catch (_) {} });
  channel.on('broadcast', { event: 'input' }, ({ payload }) => { try { handlers.onInput?.(payload); } catch (_) {} });
  const emitPresence = () => { try { handlers.onPresence?.(flatten(channel.presenceState())); } catch (_) {} };
  channel.on('presence', { event: 'sync' }, emitPresence);
  channel.on('presence', { event: 'join' }, emitPresence);
  channel.on('presence', { event: 'leave' }, emitPresence);

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      try { await channel.track({ id: me.id, name: me.name, color: me.color, joinedAt: Date.now() }); } catch (_) {}
    }
  });

  return {
    me,
    players: () => flatten(channel.presenceState()),
    sendState: (payload) => { try { channel.send({ type: 'broadcast', event: 'state', payload }); } catch (_) {} },
    sendInput: (payload) => { try { channel.send({ type: 'broadcast', event: 'input', payload }); } catch (_) {} },
    leave: () => {
      try { channel.untrack(); } catch (_) {}
      try { channel.unsubscribe(); } catch (_) {}
    },
  };
}

/** The authoritative host = earliest joiner (players() is pre-sorted). */
export function isHost(net) {
  if (!net) return true; // solo
  const players = net.players();
  return !players.length || String(players[0].id) === String(net.me.id);
}
