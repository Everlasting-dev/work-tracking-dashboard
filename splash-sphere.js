/* Orbitrack Red Edition dark particle-core splash fallback */
(function () {
  const canvas = document.getElementById('splash-sphere');
  if (!canvas) return;

  // The Red Edition splash shows a GIF and hides this canvas in CSS. resize()
  // falls back to viewport dimensions when the element measures 0x0, so without
  // this guard a hidden canvas still allocates a full DPR-scaled backing store
  // and paints ~1300 particles per frame through the whole boot.
  if (!canvas.getClientRects().length) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const FOAM = 'rgba(255, 230, 230, ';
  const RED = 'rgba(255, 39, 39, ';
  const DEEP = 'rgba(132, 16, 22, ';

  let width = 0;
  let height = 0;
  let dpr = 1;
  let radius = 160;
  let camera = 430;
  let time = 0;
  let rafId = 0;
  let running = false;
  let reduced = false;
  let particles = [];
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;

  function prefersStill() {
    return document.body.classList.contains('perf-low-power')
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  function particleCount() {
    const small = Math.min(width || 900, height || 700);
    if (reduced) return 360;
    if (small < 560) return 560;
    if (small < 900) return 920;
    return 1320;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width || window.innerWidth || 960);
    height = Math.max(1, rect.height || window.innerHeight || 540);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    radius = Math.max(118, Math.min(220, Math.min(width, height) * 0.205));
    camera = radius * 2.85;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    targetX = pointerX = width / 2;
    targetY = pointerY = height * 0.42;
    buildParticles();
  }

  function randomParticle() {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const shell = Math.pow(Math.random(), 0.36);
    const r = radius * shell;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      baseSize: rand(0.55, 1.85),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.48, 1.05),
      alpha: rand(0.16, 0.88),
      tone: Math.random() > 0.72 ? RED : Math.random() > 0.56 ? DEEP : FOAM
    };
  }

  function buildParticles() {
    particles = Array.from({ length: particleCount() }, randomParticle);
  }

  function rotateY(p, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c };
  }

  function rotateX(p, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
  }

  function drawRedField(cx, cy) {
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.7);
    bg.addColorStop(0, '#120202');
    bg.addColorStop(0.36, '#050000');
    bg.addColorStop(1, '#000000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.85);
    core.addColorStop(0, 'rgba(255, 37, 37, 0.09)');
    core.addColorStop(0.48, 'rgba(134, 18, 23, 0.032)');
    core.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.85, 0, Math.PI * 2);
    ctx.fill();

    if (reduced) return;
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = 'rgba(255, 45, 45, 0.46)';
    ctx.lineWidth = 1;
    for (let i = -3; i < 6; i += 1) {
      const y = cy - radius * 0.9 + i * (radius * 0.32);
      ctx.beginPath();
      for (let x = cx - radius * 1.35; x <= cx + radius * 1.35; x += 18) {
        const wave = Math.sin(x * 0.026 + time * 1.45 + i * 0.8) * (4 + Math.abs(i) * 0.6);
        const bow = Math.cos((x - cx) / radius) * 8;
        if (x === cx - radius * 1.35) ctx.moveTo(x, y + wave + bow);
        else ctx.lineTo(x, y + wave + bow);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function render() {
    if (!running) return;
    if (!reduced) rafId = requestAnimationFrame(render);

    time += reduced ? 0 : 0.008;
    pointerX += (targetX - pointerX) * 0.045;
    pointerY += (targetY - pointerY) * 0.045;

    const cx = width / 2;
    const cy = height * 0.42;
    drawRedField(cx, cy);

    const mouseRotY = ((pointerX - cx) / Math.max(width, 1)) * 0.74;
    const mouseRotX = ((pointerY - cy) / Math.max(height, 1)) * -0.48;
    const rotationY = time * 0.55 + mouseRotY;
    const rotationX = Math.sin(time * 0.38) * 0.18 + mouseRotX;
    const projected = [];

    for (const p of particles) {
      const pulse = 1 + Math.sin(time * 1.65 + p.phase) * 0.03;
      const current = Math.sin(time * 1.25 + p.phase + p.y * 0.018) * 0.08;
      let q = {
        x: p.x * pulse + Math.sin(time * 1.6 + p.phase) * 2.1,
        y: p.y * pulse + Math.cos(time * 1.1 + p.phase) * 1.4,
        z: p.z * pulse
      };
      q = rotateY(q, rotationY * p.speed + current);
      q = rotateX(q, rotationX + Math.sin(time + p.phase) * 0.018);

      const depth = camera / (camera - q.z);
      const edge = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z) / radius;
      const flow = 0.78 + Math.sin(time * 2 + p.phase + q.y * 0.02) * 0.16;
      projected.push({
        x: cx + q.x * depth,
        y: cy + q.y * depth,
        z: q.z,
        size: Math.max(1, p.baseSize * depth * (0.52 + edge * 0.62)),
        alpha: Math.max(0.045, Math.min(0.86, p.alpha * flow * (0.32 + depth * 0.52))),
        tone: p.tone
      });
    }

    projected.sort((a, b) => a.z - b.z);
    for (const p of projected) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = `${p.tone}${p.alpha})`;
      ctx.fillRect(
        Math.round(p.x),
        Math.round(p.y),
        Math.max(1, Math.round(p.size)),
        Math.max(1, Math.round(p.size))
      );
    }
    ctx.globalAlpha = 1;
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  }

  function onPointerLeave() {
    targetX = width / 2;
    targetY = height * 0.42;
  }

  function onResize() {
    if (!running) return;
    reduced = prefersStill();
    resize();
    if (reduced) render();
  }

  function onPerfMode() {
    const nextReduced = prefersStill();
    if (nextReduced === reduced) return;
    reduced = nextReduced;
    buildParticles();
    if (reduced) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      render();
    } else if (running && !rafId) {
      rafId = requestAnimationFrame(render);
    }
  }

  function start() {
    if (running) return;
    reduced = prefersStill();
    resize();
    running = true;
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);
    window.addEventListener('wt-performance-mode-changed', onPerfMode);
    if (reduced) render();
    else rafId = requestAnimationFrame(render);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('wt-performance-mode-changed', onPerfMode);
  }

  window.SplashSphere = { start, stop };
  start();
})();
