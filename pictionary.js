/* pictionary.js — "Doodle Dash": a co-op draw-and-guess game on our OWN stack.
 *
 * No external service — it rides the app's existing Supabase Realtime client
 * (the same transport the team map / arcade used). Anyone who types the secret
 * phrase into the app search joins the SAME room automatically: presence gives us
 * the player list, broadcast carries drawing / guesses / game state. The earliest
 * joiner is the authoritative host (picks the drawer + word, runs the timer,
 * scores guesses). window.OrbiPictionary.open() / close().
 *
 * UI is intentionally simple and ALWAYS light-themed (hardcoded colors) regardless
 * of the app's dark/light theme, so the drawing surface reads clearly.
 */
(function () {
  'use strict';

  var CHANNEL = 'orbi-doodle';
  var ROUND_MS = 60000;
  var INTERMISSION_MS = 3000;
  var PALETTE = ['#1f2937', '#ef4444', '#f59e0b', '#22c55e', '#2563eb', '#a855f7', '#ec4899', '#ffffff'];
  var WORDS = [
    'rocket', 'anchor', 'penguin', 'volcano', 'umbrella', 'lighthouse', 'cactus', 'ladder',
    'octopus', 'guitar', 'castle', 'compass', 'balloon', 'dragon', 'igloo', 'pyramid',
    'sandwich', 'telescope', 'windmill', 'jellyfish', 'snowman', 'tractor', 'mermaid', 'robot',
    'campfire', 'hammock', 'lantern', 'parachute', 'scarecrow', 'submarine', 'treehouse', 'waterfall',
    'bicycle', 'butterfly', 'cupcake', 'dinosaur', 'elephant', 'fountain', 'giraffe', 'hedgehog',
    'kangaroo', 'lightning', 'mountain', 'notebook', 'pancake', 'rainbow', 'scissors', 'tornado',
    'unicorn', 'violin', 'whale', 'astronaut', 'bridge', 'cauldron', 'diamond', 'envelope',
    'firefly', 'glacier', 'harbor', 'island', 'jetpack', 'koala', 'lemonade', 'meteor',
    'orbit', 'pirate', 'quilt', 'satellite', 'trophy', 'wizard', 'beehive', 'donut',
  ];

  function pickWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
  function normalize(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function maskWord(w) { return String(w || '').split('').map(function (c) { return (c === ' ' || c === '-') ? c : '•'; }).join(' '); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  var PALETTE_ID = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];
  function identity() {
    var s = null;
    try {
      if (typeof window.WT_getActiveSession === 'function') s = window.WT_getActiveSession();
      if (!s) s = JSON.parse(sessionStorage.getItem('wt-session') || 'null');
    } catch (_) { s = null; }
    var id = (s && s.userId != null) ? String(s.userId) : ('guest-' + Math.random().toString(36).slice(2, 8));
    var name = (s && (s.displayName || s.username)) || 'Player';
    var n = 0; for (var i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % PALETTE_ID.length;
    return { id: id, name: name, color: PALETTE_ID[n] };
  }
  function getClient() {
    try { return (window.SupabaseDB && window.SupabaseDB._client) || (window.SyncEngine && window.SyncEngine.getClient && window.SyncEngine.getClient()) || null; } catch (_) { return null; }
  }

  /* ── Light-themed, self-contained styles ───────────────────────────────── */
  var CSS = ''
    + '.dd-backdrop{position:fixed;inset:0;z-index:9400;background:rgba(15,20,35,.55);backdrop-filter:blur(6px);opacity:0;transition:opacity .2s ease}'
    + '.dd-backdrop.is-open{opacity:1}'
    + '.dd{position:fixed;inset:3vh 3vw;z-index:9410;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;'
    + 'background:#f6f7fb;color:#1f2430;border:1px solid #e3e6ef;box-shadow:0 40px 120px rgba(15,20,35,.45);'
    + 'font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;opacity:0;transform:translateY(14px) scale(.99);transition:opacity .22s ease,transform .22s ease}'
    + '.dd.is-open{opacity:1;transform:none}'
    + '.dd-top{display:flex;align-items:center;gap:12px;padding:12px 18px;background:#fff;border-bottom:1px solid #e3e6ef;flex-shrink:0}'
    + '.dd-brand{font-weight:800;font-size:1rem;color:#4f46e5}'
    + '.dd-brand span{color:#8a90a2;font-weight:600;font-size:.72rem;margin-left:8px}'
    + '.dd-room{margin-left:8px;font-size:.68rem;color:#8a90a2;background:#eef0f7;border:1px solid #e3e6ef;border-radius:999px;padding:3px 9px}'
    + '.dd-timer{margin-left:auto;font-variant-numeric:tabular-nums;font-weight:800;font-size:1.15rem;min-width:54px;text-align:center;color:#1f2430}'
    + '.dd-timer.low{color:#e11d48}'
    + '.dd-close{width:32px;height:32px;border-radius:9px;border:1px solid #e3e6ef;background:#fff;color:#5b6172;font-size:1.15rem;cursor:pointer}'
    + '.dd-close:hover{border-color:#6366f1;color:#1f2430}'
    + '.dd-body{flex:1;display:grid;grid-template-columns:190px 1fr 240px;min-height:0}'
    + '.dd-col{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}'
    + '.dd-players{border-right:1px solid #e3e6ef;padding:12px;overflow:auto;background:#fbfcfe}'
    + '.dd-h{font-size:.6rem;letter-spacing:.09em;text-transform:uppercase;color:#9aa0b2;font-weight:800;margin:2px 0 8px}'
    + '.dd-player{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:9px;margin-bottom:4px;background:#fff;border:1px solid #eef0f7}'
    + '.dd-player.me{outline:1px solid #c7cbff}'
    + '.dd-player.drawer{background:#eef0ff;border-color:#c7cbff}'
    + '.dd-player .dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}'
    + '.dd-player .nm{font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;color:#2a2f3d}'
    + '.dd-player .sc{font-weight:800;font-variant-numeric:tabular-nums;font-size:.82rem;color:#4f46e5}'
    + '.dd-stage{position:relative;display:flex;flex-direction:column;min-width:0;background:#eef0f5}'
    + '.dd-word{padding:10px 14px;text-align:center;font-weight:800;letter-spacing:.16em;font-size:1.12rem;color:#1f2430;background:#fff;border-bottom:1px solid #e3e6ef}'
    + '.dd-word small{display:block;letter-spacing:normal;font-weight:600;font-size:.68rem;color:#9aa0b2;margin-top:3px}'
    + '.dd-canvas-wrap{position:relative;flex:1;min-height:0;background:#fff;margin:10px;border-radius:12px;border:1px solid #e3e6ef;overflow:hidden}'
    + '.dd-canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:crosshair;display:block}'
    + '.dd-canvas.locked{cursor:not-allowed}'
    + '.dd-tools{display:flex;align-items:center;gap:8px;padding:0 12px 10px;flex-wrap:wrap}'
    + '.dd-tools[hidden]{display:none}'
    + '.dd-swatch{width:22px;height:22px;border-radius:50%;border:2px solid #d3d7e3;cursor:pointer}'
    + '.dd-swatch.on{border-color:#1f2430;transform:scale(1.12)}'
    + '.dd-size{display:flex;align-items:center;gap:6px;margin-left:6px;color:#5b6172;font-size:.74rem}'
    + '.dd-size input{accent-color:#6366f1}'
    + '.dd-clear{margin-left:auto;border:1px solid #e3e6ef;background:#fff;color:#5b6172;border-radius:8px;padding:6px 11px;font-size:.78rem;font-weight:700;cursor:pointer}'
    + '.dd-clear:hover{border-color:#6366f1;color:#1f2430}'
    + '.dd-side{border-left:1px solid #e3e6ef;background:#fbfcfe;padding:12px;display:flex;flex-direction:column;min-height:0}'
    + '.dd-feed{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:8px}'
    + '.dd-msg{font-size:.8rem;line-height:1.4;padding:6px 9px;border-radius:9px;background:#fff;border:1px solid #eef0f7;color:#2a2f3d;word-break:break-word}'
    + '.dd-msg.good{background:#e9fbef;border-color:#bbf7d0;color:#15803d;font-weight:700}'
    + '.dd-msg.sys{background:transparent;border:none;color:#9aa0b2;font-size:.74rem;text-align:center}'
    + '.dd-guess{display:flex;gap:6px}'
    + '.dd-guess input{flex:1;min-width:0;border:1px solid #d3d7e3;background:#fff;color:#1f2430;border-radius:9px;padding:9px 11px;font-size:.85rem;outline:none}'
    + '.dd-guess input:focus{border-color:#6366f1}'
    + '.dd-guess input:disabled{background:#f0f1f5;color:#9aa0b2;cursor:not-allowed}'
    + '.dd-guess button{border:none;background:#6366f1;color:#fff;border-radius:9px;padding:0 14px;font-weight:700;cursor:pointer}'
    + '.dd-guess button:disabled{opacity:.5;cursor:not-allowed}'
    + '.dd-status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:rgba(255,255,255,.9);color:#1f2430;text-align:center;padding:24px;z-index:5}'
    + '.dd-status[hidden]{display:none}.dd-status h3{margin:0;font-size:1.05rem}.dd-status p{margin:0;color:#8a90a2;font-size:.85rem;max-width:340px}'
    + '@media (max-width:820px){.dd-body{grid-template-columns:1fr}.dd-players{display:none}.dd-side{border-left:none;border-top:1px solid #e3e6ef}}';

  function injectCss() {
    if (document.getElementById('orbi-dd-style')) return;
    var s = document.createElement('style'); s.id = 'orbi-dd-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Module state ──────────────────────────────────────────────────────── */
  var mounted = false, isOpen = false, backdrop = null, root = null;
  var canvas = null, ctx = null, feedEl = null;
  var me = null, channel = null, players = [];
  var drawColor = PALETTE[0], drawSize = 4, strokes = [], cur = null;
  var myWord = '';            // full word, only known if I'm the drawer
  var hostWord = '';          // full word, known by host for validation
  var transitioning = false;
  var loopTimer = null, uiTimer = null;
  // Authoritative game state (set by host, mirrored on clients from 'state').
  var G = { round: 0, drawerId: null, wordMasked: '', wordLen: 0, endsAt: 0, phase: 'waiting', scores: {}, guessed: {} };

  function myId() { return me && me.id; }
  function amHost() { return players.length > 0 && String(players[0].id) === String(myId()); }
  function amDrawer() { return String(G.drawerId) === String(myId()); }

  /* ── DOM ───────────────────────────────────────────────────────────────── */
  function build() {
    if (mounted) return;
    injectCss();
    backdrop = document.createElement('div'); backdrop.className = 'dd-backdrop'; backdrop.style.display = 'none';
    root = document.createElement('div'); root.className = 'dd'; root.style.display = 'none';
    root.innerHTML = ''
      + '<div class="dd-top">'
      + '  <div class="dd-brand">Doodle Dash <span>draw · guess · win</span></div>'
      + '  <div class="dd-room" data-room></div>'
      + '  <div class="dd-timer" data-timer>—</div>'
      + '  <button class="dd-close" aria-label="Close">×</button>'
      + '</div>'
      + '<div class="dd-body">'
      + '  <div class="dd-col dd-players"><div class="dd-h">Players</div><div data-players></div></div>'
      + '  <div class="dd-col dd-stage">'
      + '    <div class="dd-word" data-word>Connecting…</div>'
      + '    <div class="dd-canvas-wrap"><canvas class="dd-canvas" data-canvas></canvas><div class="dd-status" data-status hidden></div></div>'
      + '    <div class="dd-tools" data-tools hidden>'
      +        PALETTE.map(function (c, i) { return '<span class="dd-swatch ' + (i === 0 ? 'on' : '') + '" data-color="' + c + '" style="background:' + c + '"></span>'; }).join('')
      + '      <label class="dd-size">Brush <input type="range" min="2" max="26" value="4" data-size></label>'
      + '      <button class="dd-clear" data-clear>Clear</button>'
      + '    </div>'
      + '  </div>'
      + '  <div class="dd-col dd-side">'
      + '    <div class="dd-h">Guesses</div>'
      + '    <div class="dd-feed" data-feed></div>'
      + '    <form class="dd-guess" data-guess-form><input type="text" data-guess placeholder="Type your guess…" autocomplete="off" maxlength="40"><button type="submit" data-guess-btn>Send</button></form>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(root);

    canvas = root.querySelector('[data-canvas]');
    ctx = canvas.getContext('2d');
    feedEl = root.querySelector('[data-feed]');

    root.querySelector('.dd-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    root.querySelectorAll('.dd-swatch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        drawColor = sw.dataset.color;
        root.querySelectorAll('.dd-swatch').forEach(function (x) { x.classList.toggle('on', x === sw); });
      });
    });
    root.querySelector('[data-size]').addEventListener('input', function (e) { drawSize = Number(e.target.value); });
    root.querySelector('[data-clear]').addEventListener('click', function () { if (amDrawer()) { clearCanvas(); send('clear', {}); } });
    root.querySelector('[data-guess-form]').addEventListener('submit', function (e) { e.preventDefault(); submitGuess(); });
    setupDrawing();
    window.addEventListener('resize', fitCanvas);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
    mounted = true;
  }

  /* ── Canvas ────────────────────────────────────────────────────────────── */
  function fitCanvas() {
    if (!canvas) return;
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  function clearCanvas() { strokes = []; cur = null; redraw(); }
  function redraw() {
    if (!ctx) return;
    var r = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, r.width, r.height);
    strokes.forEach(drawStroke);
    if (cur) drawStroke(cur);
  }
  function drawStroke(s) {
    if (!s || !s.pts || !s.pts.length) return;
    var r = canvas.getBoundingClientRect();
    ctx.strokeStyle = s.color; ctx.lineWidth = s.size; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s.pts[0].x * r.width, s.pts[0].y * r.height);
    for (var i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x * r.width, s.pts[i].y * r.height);
    ctx.stroke();
  }
  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: +((e.clientX - r.left) / r.width).toFixed(4), y: +((e.clientY - r.top) / r.height).toFixed(4) }; }
  // Draw a single segment incrementally (no full-canvas redraw) so the drawer stays smooth.
  function drawSegment(a, b, color, size) {
    var r = canvas.getBoundingClientRect();
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a.x * r.width, a.y * r.height); ctx.lineTo(b.x * r.width, b.y * r.height); ctx.stroke();
  }
  function setupDrawing() {
    var drawing = false, sendBuf = [], lastSend = 0;
    function flush(force) {
      if (!cur || sendBuf.length < 2) return;
      var now = performance.now();
      if (!force && now - lastSend < 60) return;   // cap broadcasts at ~16/sec
      lastSend = now;
      send('draw', { color: cur.color, size: cur.size, p: sendBuf });
      sendBuf = [sendBuf[sendBuf.length - 1]];       // keep last point to connect the next batch
    }
    canvas.addEventListener('pointerdown', function (e) {
      if (!amDrawer() || G.phase !== 'drawing') return;
      drawing = true; try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      var p = pos(e);
      cur = { color: drawColor, size: drawSize, pts: [p] };
      sendBuf = [p];
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || !cur) return;
      var p = pos(e);
      var prev = cur.pts[cur.pts.length - 1];
      cur.pts.push(p);
      drawSegment(prev, p, cur.color, cur.size);     // local: incremental only
      sendBuf.push(p);
      flush(false);
    });
    function end() {
      if (!drawing) return;
      drawing = false;
      flush(true);
      if (cur) { strokes.push(cur); send('stroke', cur); cur = null; }
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);
  }

  /* ── Realtime ──────────────────────────────────────────────────────────── */
  function send(event, payload) {
    if (!channel) return;
    try { channel.send({ type: 'broadcast', event: event, payload: payload || {} }); } catch (_) {}
  }
  function flattenPresence() {
    var out = [];
    try {
      var st = channel.presenceState();
      Object.keys(st || {}).forEach(function (k) { var m = st[k]; if (m && m.length) out.push(Object.assign({ key: k }, m[0])); });
    } catch (_) {}
    out.sort(function (a, b) { return (a.joinedAt || 0) - (b.joinedAt || 0) || String(a.id).localeCompare(String(b.id)); });
    return out;
  }

  function connect() {
    var sb = getClient();
    me = identity();
    if (!sb || !navigator.onLine) { showStatus('Offline', 'Connect to cloud sync to play Doodle Dash with your team.'); return; }
    showStatus('Joining the room…', '');
    try {
      channel = sb.channel(CHANNEL, { config: { broadcast: { self: false }, presence: { key: me.id } } });
    } catch (_) { showStatus('Could not connect', 'Realtime channel unavailable.'); return; }

    channel.on('broadcast', { event: 'draw' }, function (m) { var d = m.payload; if (d) drawStroke({ color: d.color, size: d.size, pts: d.p }); });
    channel.on('broadcast', { event: 'stroke' }, function (m) { if (m.payload) { strokes.push(m.payload); redraw(); } });
    channel.on('broadcast', { event: 'clear' }, function () { clearCanvas(); });
    channel.on('broadcast', { event: 'strokesFull' }, function (m) { if (Array.isArray(m.payload && m.payload.strokes)) { strokes = m.payload.strokes; redraw(); } });
    channel.on('broadcast', { event: 'feed' }, function (m) { if (m.payload) addFeed(m.payload.text, m.payload.kind); });
    channel.on('broadcast', { event: 'state' }, function (m) { if (m.payload) { G = m.payload; renderAll(); } });
    channel.on('broadcast', { event: 'secret' }, function (m) { var p = m.payload; if (p && String(p.to) === String(myId())) { myWord = p.word || ''; } });
    channel.on('broadcast', { event: 'guess' }, function (m) { if (amHost() && m.payload) hostHandleGuess(m.payload); });
    channel.on('broadcast', { event: 'needSync' }, function () {
      // Host replays the authoritative state so late joiners aren't stuck in "waiting"
      // (that was leaving their guess box disabled). Drawer replays the canvas so far.
      if (amHost()) { send('state', G); if (G.phase === 'drawing' && hostWord) send('secret', { to: G.drawerId, word: hostWord }); }
      if (amDrawer() && strokes.length) send('strokesFull', { strokes: strokes });
    });

    var onPresence = function () { players = flattenPresence(); onPlayersChanged(); renderPlayers(); };
    channel.on('presence', { event: 'sync' }, onPresence);
    channel.on('presence', { event: 'join' }, onPresence);
    channel.on('presence', { event: 'leave' }, onPresence);

    channel.subscribe(function (status) {
      if (status !== 'SUBSCRIBED') return;
      channel.track({ id: me.id, name: me.name, color: me.color, joinedAt: Date.now() }).then(function () {
        hideStatus();
        send('needSync', {});           // ask the current drawer for the canvas so far
        startUiLoop();
        startHostLoop();
      });
    });
  }

  function onPlayersChanged() {
    // Prune scores/guessed for players who left; ensure host loop reflects role.
    if (amHost()) {
      var ids = {}; players.forEach(function (p) { ids[p.id] = true; });
      Object.keys(G.scores).forEach(function (id) { if (!ids[id]) delete G.scores[id]; });
      // If no active round and we have players, kick one off.
      if (G.phase === 'waiting' && players.length >= 1 && !transitioning) startRound();
      // If the drawer left mid-round, end the round.
      else if (G.phase === 'drawing' && !ids[G.drawerId]) endRound(false);
      // Push current state to whoever just joined/changed so they sync right away.
      send('state', G);
      if (G.phase === 'drawing' && hostWord) send('secret', { to: G.drawerId, word: hostWord });
    }
  }

  /* ── Host: rounds, timer (authoritative + ordered) ─────────────────────── */
  function broadcastState() { send('state', G); renderAll(); }
  function startRound() {
    if (!amHost() || transitioning || !players.length) return;
    G.round += 1;
    var order = players.slice();
    var drawer = order[G.round % order.length];
    hostWord = pickWord();
    G.drawerId = drawer.id;
    G.wordMasked = maskWord(hostWord);
    G.wordLen = hostWord.length;
    G.endsAt = Date.now() + ROUND_MS;
    G.phase = 'drawing';
    G.guessed = {};
    if (!G.scores) G.scores = {};
    players.forEach(function (p) { if (G.scores[p.id] == null) G.scores[p.id] = 0; });
    strokes = []; cur = null; redraw();
    myWord = String(drawer.id) === String(myId()) ? hostWord : '';
    send('clear', {});
    send('secret', { to: drawer.id, word: hostWord });
    send('feed', { text: 'Round ' + G.round + ' — ' + (drawer.name || 'someone') + ' is drawing', kind: 'sys' });
    broadcastState();
  }
  function everyoneGuessed() {
    var others = players.filter(function (p) { return String(p.id) !== String(G.drawerId); });
    return others.length > 0 && others.every(function (p) { return G.guessed[p.id]; });
  }
  function endRound(solved) {
    if (!amHost() || transitioning) return;
    transitioning = true;
    send('feed', { text: (solved ? 'Round over — ' : 'Time! ') + 'the word was “' + hostWord + '”.', kind: 'sys' });
    G.phase = 'intermission';
    G.endsAt = 0;
    broadcastState();
    setTimeout(function () { transitioning = false; if (amHost()) startRound(); }, INTERMISSION_MS);
  }
  function hostHandleGuess(g) {
    if (G.phase !== 'drawing') return;
    if (String(g.id) === String(G.drawerId)) return;
    if (G.guessed[g.id]) return;
    if (normalize(g.text) === normalize(hostWord)) {
      var secsLeft = Math.max(0, Math.round((G.endsAt - Date.now()) / 1000));
      G.guessed[g.id] = true;
      G.scores[g.id] = (G.scores[g.id] || 0) + 50 + secsLeft;
      G.scores[G.drawerId] = (G.scores[G.drawerId] || 0) + 25;
      send('feed', { text: '✅ ' + (g.name || 'Someone') + ' guessed it!', kind: 'good' });
      broadcastState();
      if (everyoneGuessed()) endRound(true);
    } else {
      send('feed', { text: (g.name || 'Someone') + ': ' + String(g.text).slice(0, 40), kind: '' });
    }
  }
  var lastStateBeat = 0;
  function startHostLoop() {
    clearInterval(loopTimer);
    loopTimer = setInterval(function () {
      if (!amHost()) return;
      if (G.phase === 'waiting' && players.length >= 1 && !transitioning) { startRound(); return; }
      if (G.phase === 'drawing' && !transitioning) {
        if (G.endsAt && Date.now() > G.endsAt) endRound(false);
        else if (everyoneGuessed()) endRound(true);
      }
      // Heartbeat: re-broadcast state every ~2s so any client that missed a state
      // event converges (keeps guess boxes / timers correct for everyone).
      var now = Date.now();
      if (now - lastStateBeat > 2000) { lastStateBeat = now; send('state', G); }
    }, 500);
  }

  /* ── Guessing ──────────────────────────────────────────────────────────── */
  function submitGuess() {
    var input = root.querySelector('[data-guess]');
    var text = (input.value || '').trim();
    if (!text) return;
    if (amDrawer() || G.phase !== 'drawing' || (G.guessed && G.guessed[myId()])) return;
    input.value = '';
    if (amHost()) hostHandleGuess({ id: myId(), name: me.name, text: text });
    else send('guess', { id: myId(), name: me.name, text: text });
    input.focus();
  }

  /* ── Rendering ─────────────────────────────────────────────────────────── */
  function startUiLoop() { clearInterval(uiTimer); uiTimer = setInterval(tickUi, 250); tickUi(); }
  function tickUi() {
    if (!isOpen || !root) return;
    var timerEl = root.querySelector('[data-timer]');
    if (G.phase === 'drawing' && G.endsAt) {
      var secs = Math.max(0, Math.round((G.endsAt - Date.now()) / 1000));
      timerEl.textContent = secs + 's';
      timerEl.classList.toggle('low', secs <= 10);
    } else { timerEl.textContent = '—'; timerEl.classList.remove('low'); }
    renderControls();
  }
  function renderControls() {
    var drawer = amDrawer(), active = G.phase === 'drawing';
    root.querySelector('[data-tools]').hidden = !(drawer && active);
    canvas.classList.toggle('locked', !(drawer && active));
    var gi = root.querySelector('[data-guess]');
    var gb = root.querySelector('[data-guess-btn]');
    var canGuess = active && !drawer && !(G.guessed && G.guessed[myId()]);
    gi.disabled = !canGuess; gb.disabled = !canGuess;
    gi.placeholder = drawer ? 'You are drawing…' : (G.guessed && G.guessed[myId()]) ? 'You guessed it! 🎉' : 'Type your guess…';

    var wordEl = root.querySelector('[data-word]');
    if (G.phase !== 'drawing') {
      wordEl.innerHTML = players.length < 2
        ? 'Waiting for teammates…<small>Anyone who types <b>monkeybanana</b> joins this room</small>'
        : (G.phase === 'intermission' ? 'Next round starting…<small>Get ready</small>' : 'Starting…<small>&nbsp;</small>');
    } else if (drawer) {
      wordEl.innerHTML = esc((myWord || '').toUpperCase()) + '<small>You\'re drawing — don\'t type the word!</small>';
    } else {
      wordEl.innerHTML = esc(G.wordMasked) + '<small>' + (G.wordLen || 0) + ' letters — guess it!</small>';
    }
    var roomEl = root.querySelector('[data-room]');
    if (roomEl) roomEl.textContent = players.length + (players.length === 1 ? ' player' : ' players');
  }
  function renderPlayers() {
    var box = root && root.querySelector('[data-players]');
    if (!box) return;
    var ranked = players.slice().sort(function (a, b) { return (G.scores[b.id] || 0) - (G.scores[a.id] || 0); });
    box.innerHTML = ranked.map(function (p) {
      var isDrawer = String(p.id) === String(G.drawerId);
      var mark = isDrawer ? '✏️' : ((G.guessed && G.guessed[p.id]) ? '✅' : '');
      return '<div class="dd-player ' + (String(p.id) === String(myId()) ? 'me ' : '') + (isDrawer ? 'drawer' : '') + '">'
        + '<span class="dot" style="background:' + esc(p.color || '#6366f1') + '"></span>'
        + '<span class="nm">' + esc(p.name || 'Player') + '</span>'
        + (mark ? '<span>' + mark + '</span>' : '')
        + '<span class="sc">' + (G.scores[p.id] || 0) + '</span>'
        + '</div>';
    }).join('') || '<div class="dd-msg sys">No players yet…</div>';
  }
  function renderAll() { renderControls(); renderPlayers(); }
  function addFeed(text, kind) {
    if (!feedEl) return;
    var d = document.createElement('div'); d.className = 'dd-msg' + (kind ? ' ' + kind : ''); d.textContent = text;
    feedEl.appendChild(d); feedEl.scrollTop = feedEl.scrollHeight;
    while (feedEl.children.length > 60) feedEl.removeChild(feedEl.firstChild);
  }
  function showStatus(title, body) { var el = root && root.querySelector('[data-status]'); if (!el) return; el.hidden = false; el.innerHTML = '<h3>' + esc(title) + '</h3>' + (body ? '<p>' + esc(body) + '</p>' : ''); }
  function hideStatus() { var el = root && root.querySelector('[data-status]'); if (el) el.hidden = true; }

  /* ── Open / close ──────────────────────────────────────────────────────── */
  function open() {
    build();
    if (isOpen) return;
    isOpen = true;
    backdrop.style.display = 'block'; root.style.display = 'flex';
    requestAnimationFrame(function () {
      backdrop.classList.add('is-open'); root.classList.add('is-open');
      fitCanvas(); connect();
    });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    clearInterval(loopTimer); clearInterval(uiTimer);
    try { channel && channel.untrack(); } catch (_) {}
    try { channel && channel.unsubscribe(); } catch (_) {}
    channel = null; players = []; strokes = []; cur = null; myWord = ''; hostWord = ''; transitioning = false;
    G = { round: 0, drawerId: null, wordMasked: '', wordLen: 0, endsAt: 0, phase: 'waiting', scores: {}, guessed: {} };
    backdrop.classList.remove('is-open'); root.classList.remove('is-open');
    setTimeout(function () { if (backdrop) backdrop.style.display = 'none'; if (root) root.style.display = 'none'; }, 220);
  }

  window.OrbiPictionary = { open: open, close: close, isOpen: function () { return isOpen; } };
})();
