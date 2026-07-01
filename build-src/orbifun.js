/* orbifun.js — Orbitrack "fun pack": celebration confetti, Motion micro-
 * animations, and a procedural orbit-sphere project-health orb.
 * Bundled by esbuild into vendor/orbifun/orbifun.js as one offline IIFE that
 * exposes window.OrbiFun. All animation deps live here; the vanilla app just
 * calls OrbiFun.celebrate(), OrbiFun.pop(el), OrbiFun.enterModal(el), and
 * OrbiFun.healthOrb(canvas, percent).
 *
 * Rebuild after editing:  npm run build:orbifun
 *
 * Note on the health orb: Rive/Lottie need authored .riv/.json assets we don't
 * ship, so the orb is drawn procedurally on a canvas — same "orbit sphere that
 * brightens as tasks complete" effect, zero assets, fully offline + themeable.
 */
import confetti from 'canvas-confetti';
import { animate } from 'motion';

const reduceMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (_) { return false; }
};

/* ── Celebration confetti (orbit particles, not party blobs) ────── */
const CONFETTI_ZONES = [
  { x: 0.08, y: 0.08, angle: 135 }, { x: 0.92, y: 0.08, angle: 225 },
  { x: 0.08, y: 0.92, angle: 45 }, { x: 0.92, y: 0.92, angle: 315 },
  { x: 0.5, y: 0.06, angle: 270 }, { x: 0.5, y: 0.94, angle: 90 },
  { x: 0.06, y: 0.5, angle: 0 }, { x: 0.94, y: 0.5, angle: 180 },
  { x: 0.5, y: 0.5, angle: 270 }, { x: 0.28, y: 0.32, angle: 300 },
  { x: 0.72, y: 0.32, angle: 240 }, { x: 0.35, y: 0.68, angle: 60 },
  { x: 0.65, y: 0.68, angle: 120 },
];
function randomOrigin(exclude) {
  const pool = exclude ? CONFETTI_ZONES.filter((z) => z !== exclude) : CONFETTI_ZONES;
  return pool[(Math.random() * pool.length) | 0];
}
function burstFrom(zone, base, count, extra = {}) {
  confetti({ ...base, particleCount: count, origin: { x: zone.x, y: zone.y }, angle: zone.angle, ...extra });
}
function celebrate(opts = {}) {
  if (reduceMotion()) return;
  const colors = opts.colors || ['#ffffff', '#38bdf8', '#818cf8', '#94a3b8'];
  const base = { spread: 70, startVelocity: 42, ticks: 220, gravity: 0.9, scalar: 0.85, colors, shapes: ['circle', 'square'] };
  const z1 = randomOrigin();
  burstFrom(z1, base, opts.big ? 70 : 55);
  if (opts.big) {
    const z2 = randomOrigin(z1);
    setTimeout(() => burstFrom(z2, base, 65, { spread: 90 }), 90);
    const z3 = randomOrigin(z2);
    setTimeout(() => burstFrom(z3, base, 80, { spread: 100, startVelocity: 50 }), 200);
  }
}

/* ── Motion micro-animations ────────────────────────────────────── */
function enterModal(el) {
  if (!el || reduceMotion()) return;
  animate(el, { opacity: [0, 1], transform: ['translateY(10px) scale(0.985)', 'translateY(0) scale(1)'] },
    { duration: 0.24, easing: [0.22, 1, 0.36, 1] });
}

function pop(el) {
  if (!el || reduceMotion()) return;
  animate(el, { transform: ['scale(1)', 'scale(1.16)', 'scale(1)'] }, { duration: 0.42, easing: 'ease-out' });
}

function enterList(selector, root) {
  if (reduceMotion()) return;
  const scope = root || document;
  const els = Array.from(scope.querySelectorAll(selector)).slice(0, 24);
  els.forEach((el, i) => {
    animate(el, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
      { duration: 0.28, delay: Math.min(0.25, i * 0.03), easing: [0.22, 1, 0.36, 1] });
  });
}

/* ── Procedural project-health orb ──────────────────────────────── */
const orbHandles = new WeakMap();

function healthOrb(canvas, percent) {
  if (!canvas || !canvas.getContext) return;
  const prev = orbHandles.get(canvas);
  if (prev) cancelAnimationFrame(prev.raf);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cssSize = canvas.clientWidth || 96;
  canvas.width = cssSize * dpr;
  canvas.height = cssSize * dpr;
  ctx.scale(dpr, dpr);
  const c = cssSize / 2;
  const health = Math.max(0, Math.min(100, Number(percent) || 0)) / 100;

  // More health → brighter core, more lit orbiting motes, warmer ring.
  const motes = 7 + Math.round(health * 11);
  const seeds = Array.from({ length: motes }, (_, i) => ({
    r: c * (0.42 + (i % 3) * 0.16),
    speed: 0.0006 + (i % 4) * 0.00035,
    phase: (i / motes) * Math.PI * 2,
    tilt: (i % 2 ? 1 : -1) * (0.3 + (i % 3) * 0.12),
  }));

  const still = reduceMotion();
  function frame(t) {
    ctx.clearRect(0, 0, cssSize, cssSize);
    const time = still ? 0 : t;

    // Core glow — brightness scales with completion.
    const coreAlpha = 0.18 + health * 0.72;
    const grad = ctx.createRadialGradient(c, c, 1, c, c, c * 0.7);
    grad.addColorStop(0, `rgba(186,230,253,${coreAlpha})`);
    grad.addColorStop(0.5, `rgba(56,189,248,${coreAlpha * 0.5})`);
    grad.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(c, c, c * 0.7, 0, Math.PI * 2); ctx.fill();

    // Solid core dot.
    ctx.fillStyle = `rgba(255,255,255,${0.4 + health * 0.6})`;
    ctx.beginPath(); ctx.arc(c, c, c * 0.13, 0, Math.PI * 2); ctx.fill();

    // Orbiting motes.
    seeds.forEach((s, i) => {
      const a = s.phase + time * s.speed;
      const x = c + Math.cos(a) * s.r;
      const y = c + Math.sin(a) * s.r * s.tilt;
      const lit = (i / motes) <= health;
      ctx.fillStyle = lit ? `rgba(129,140,248,${0.55 + health * 0.4})` : 'rgba(148,163,184,0.22)';
      ctx.beginPath(); ctx.arc(x, y, lit ? 2.2 : 1.5, 0, Math.PI * 2); ctx.fill();
    });

    if (!still) {
      const h = orbHandles.get(canvas) || {};
      h.raf = requestAnimationFrame(frame);
      orbHandles.set(canvas, h);
    }
  }
  const h = {};
  orbHandles.set(canvas, h);
  h.raf = requestAnimationFrame(frame);
}

window.OrbiFun = { celebrate, pop, enterModal, enterList, healthOrb };
