/* notification-sounds.js — synthesized Web Audio notification tones */

const NotificationSounds = (() => {
  let _ctx = null;
  const VOLUME = 0.35;
  const MUTE_KEY = 'wt-sounds-muted';

  function isMuted() {
    try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (_) { return false; }
  }

  function setMuted(muted) {
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (_) {}
  }

  function _audioCtx() {
    if (_ctx) return _ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    _ctx = new Ctx();
    return _ctx;
  }

  function _tone(freq, start, duration, type = 'sine', gain = VOLUME) {
    const ctx = _audioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  function _playPattern(type) {
    const ctx = _audioCtx();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    switch (type) {
      case 'assignment':
        _tone(523, t, 0.12);
        _tone(659, t + 0.14, 0.16);
        break;
      case 'access_request':
        _tone(440, t, 0.08, 'square', VOLUME * 0.7);
        _tone(440, t + 0.12, 0.08, 'square', VOLUME * 0.7);
        _tone(554, t + 0.24, 0.12, 'square', VOLUME * 0.75);
        break;
      case 'chat':
      case 'mention':
        _tone(880, t, 0.09, 'triangle', VOLUME * 0.65);
        _tone(1100, t + 0.13, 0.12, 'triangle', VOLUME * 0.55);
        break;
      case 'task_done':
        _tone(587, t, 0.1);
        _tone(784, t + 0.11, 0.14);
        _tone(988, t + 0.24, 0.18);
        break;
      case 'update':
        _tone(698, t, 0.14, 'triangle');
        break;
      case 'project_completed':
        _tone(523, t, 0.1);
        _tone(659, t + 0.1, 0.1);
        _tone(784, t + 0.2, 0.1);
        _tone(1047, t + 0.3, 0.22);
        break;
      case 'bug_report':
        _tone(220, t, 0.2, 'sawtooth', VOLUME * 0.55);
        break;
      case 'access_approved':
        _tone(659, t, 0.16);
        break;
      case 'access_declined':
        _tone(349, t, 0.2, 'triangle');
        break;
      default:
        _tone(600, t, 0.12);
        break;
    }
  }

  function play(type, { force = false } = {}) {
    if (!force && isMuted()) return;
    try { _playPattern(type || 'default'); } catch (_) {}
  }

  return { play, isMuted, setMuted };
})();

window.NotificationSounds = NotificationSounds;
