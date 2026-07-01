/* sprites.js — Orbitrack sprite-sheet animations + pop-up characters.
 *
 * window.OrbiSprites:
 *   playSprite(el, {sheet, frameW, frameH, frames, cols, fps, loop, onEnd})
 *       — animate a sprite sheet inside `el` via a rAF frame stepper (grid sheets ok).
 *   spawnCharacter({sheet?, emoji?, frameW, frameH, frames, cols, fps, side, life, scale})
 *       — a little character pops in from a screen edge, animates, then leaves.
 *         With a `sheet` it plays the sheet; without one it falls back to an emoji.
 *   startAmbient(opts) / stopAmbient()  — occasional random pop-ups (gentle cadence).
 *   celebrate(opts)                     — a small burst of characters (used on trophy unlocks).
 *
 * DROP-IN REAL ART: put PNG sheets in assets/sprites/ and pass their path + frame
 * metadata (see assets/sprites/README.md). Until then everything runs on emoji
 * placeholders, so the system is fully live now. Honors prefers-reduced-motion and
 * window.__orbiSpritesOff.
 */
(function () {
  'use strict';

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
  function disabled() { return reduce || window.__orbiSpritesOff === true; }

  var CSS = '.orbi-sprite-layer{position:fixed;inset:0;z-index:11500;pointer-events:none;overflow:hidden}'
    + '.orbi-sprite-char{position:absolute;will-change:transform,opacity;opacity:0;transition:transform .5s cubic-bezier(.2,.9,.3,1.3),opacity .4s ease;filter:drop-shadow(0 6px 14px rgba(0,0,0,.28))}'
    + '.orbi-sprite-char.is-in{opacity:1}'
    + '.orbi-sprite-char.is-out{opacity:0}'
    + '.orbi-sprite-frame{background-repeat:no-repeat;image-rendering:pixelated}'
    + '.orbi-sprite-emoji{font-size:38px;line-height:1;animation:orbiSpriteBob 1.6s ease-in-out infinite}'
    + '@keyframes orbiSpriteBob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-8px) rotate(4deg)}}'
    + '@media (prefers-reduced-motion: reduce){.orbi-sprite-emoji{animation:none}}';

  function injectCss() {
    if (document.getElementById('orbi-sprites-css')) return;
    var s = document.createElement('style');
    s.id = 'orbi-sprites-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var layerEl = null;
  function layer() {
    if (layerEl && document.body.contains(layerEl)) return layerEl;
    injectCss();
    layerEl = document.createElement('div');
    layerEl.className = 'orbi-sprite-layer';
    document.body.appendChild(layerEl);
    return layerEl;
  }

  // ── Frame stepper for a sprite sheet (single or multi-row grid) ──
  function playSprite(el, opts) {
    opts = opts || {};
    var frameW = opts.frameW || 64, frameH = opts.frameH || 64;
    var frames = opts.frames || 1, cols = opts.cols || frames;
    var fps = opts.fps || 12, loop = opts.loop !== false;
    el.style.width = frameW + 'px';
    el.style.height = frameH + 'px';
    el.style.backgroundImage = 'url("' + opts.sheet + '")';
    el.classList.add('orbi-sprite-frame');
    var f = 0, last = 0, raf = 0, stopped = false;
    function step(t) {
      if (stopped) return;
      if (!last) last = t;
      if (t - last >= 1000 / fps) {
        last = t;
        var cx = f % cols, cy = Math.floor(f / cols);
        el.style.backgroundPosition = '-' + (cx * frameW) + 'px -' + (cy * frameH) + 'px';
        f++;
        if (f >= frames) {
          if (loop) f = 0;
          else { stopped = true; if (opts.onEnd) try { opts.onEnd(); } catch (_) {} return; }
        }
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }

  var EMOJI_ROSTER = ['👋', '🐱', '🚀', '⭐', '🎈', '🐙', '🦊', '🌟', '🎉', '🐧'];
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function spawnCharacter(opts) {
    opts = opts || {};
    if (disabled()) return null;
    var host = layer();
    var wrap = document.createElement('div');
    wrap.className = 'orbi-sprite-char';
    var scale = opts.scale || 1;
    var vw = window.innerWidth, vh = window.innerHeight;
    var side = opts.side || pick(['left', 'right', 'bottom']);
    var restX, restY, fromT;
    var y = 60 + Math.random() * Math.max(1, vh - 200);
    var x = 60 + Math.random() * Math.max(1, vw - 200);
    if (side === 'left') { wrap.style.left = '10px'; wrap.style.top = y + 'px'; fromT = 'translateX(-120%)'; restX = 'translateX(0)'; }
    else if (side === 'right') { wrap.style.right = '10px'; wrap.style.top = y + 'px'; fromT = 'translateX(120%)'; restX = 'translateX(0)'; }
    else { wrap.style.left = x + 'px'; wrap.style.bottom = '10px'; fromT = 'translateY(120%)'; restX = 'translateY(0)'; }
    wrap.style.transform = 'scale(' + scale + ') ' + fromT;

    var inner = document.createElement('div');
    wrap.appendChild(inner);
    var stop = null;
    if (opts.sheet) {
      var img = new Image();
      img.onload = function () { stop = playSprite(inner, opts); };
      img.onerror = function () { inner.className = 'orbi-sprite-emoji'; inner.textContent = opts.emoji || pick(EMOJI_ROSTER); };
      img.src = opts.sheet;
    } else {
      inner.className = 'orbi-sprite-emoji';
      inner.textContent = opts.emoji || pick(EMOJI_ROSTER);
    }

    host.appendChild(wrap);
    requestAnimationFrame(function () {
      wrap.classList.add('is-in');
      wrap.style.transform = 'scale(' + scale + ') ' + restX;
    });

    var life = opts.life || (3600 + Math.random() * 2400);
    setTimeout(function () {
      wrap.style.transform = 'scale(' + scale + ') ' + fromT;
      wrap.classList.remove('is-in');
      wrap.classList.add('is-out');
      setTimeout(function () { if (stop) stop(); wrap.remove(); }, 520);
    }, life);
    return wrap;
  }

  function celebrate(opts) {
    opts = opts || {};
    if (disabled()) return;
    var n = opts.count || 3;
    for (var i = 0; i < n; i++) {
      (function (k) { setTimeout(function () { spawnCharacter({ emoji: opts.emoji, sheet: opts.sheet, frameW: opts.frameW, frameH: opts.frameH, frames: opts.frames, cols: opts.cols, fps: opts.fps, life: 2600 }); }, k * 220); })(i);
    }
  }

  // ── Ambient: occasional friendly pop-up (gentle, tab-visible only) ──
  var ambientTimer = null;
  function startAmbient(opts) {
    opts = opts || {};
    stopAmbient();
    if (disabled()) return;
    var min = opts.minMs || 90000, max = opts.maxMs || 240000;
    function schedule() {
      var delay = min + Math.random() * (max - min);
      ambientTimer = setTimeout(function () {
        if (!document.hidden && !disabled()) spawnCharacter({ roster: opts.roster });
        schedule();
      }, delay);
    }
    schedule();
  }
  function stopAmbient() { if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; } }

  window.OrbiSprites = {
    playSprite: playSprite,
    spawnCharacter: spawnCharacter,
    celebrate: celebrate,
    startAmbient: startAmbient,
    stopAmbient: stopAmbient,
  };

  // A trophy unlock earns a little character cameo.
  try {
    window.addEventListener('orbi-trophies-changed', function () { celebrate({ count: 2 }); });
  } catch (_) {}
})();
