/* Orbitrack Lite v2 — particle core splash (from orbitrack-particle-core) */
(function () {
  const canvas = document.getElementById('splash-sphere');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let time = 0;
  let rafId = 0;
  let running = false;

  const COUNT_HIGH = 1500;
  const COUNT_MED = 900;
  const COUNT_LOW = 520;
  const SPHERE_RADIUS = 155;
  const CAMERA = 430;

  function particleCount() {
    const small = Math.min(window.innerWidth || 800, window.innerHeight || 600);
    if (small < 520) return COUNT_LOW;
    if (small < 900) return COUNT_MED;
    return COUNT_HIGH;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    mouseX = targetX = width / 2;
    mouseY = targetY = height / 2;
  }

  function randomSpherePoint() {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const shellBias = Math.pow(Math.random(), 0.45);
    const r = SPHERE_RADIUS * shellBias;

    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
      baseSize: 0.45 + Math.random() * 1.5,
      speed: 0.35 + Math.random() * 0.85,
      phase: Math.random() * Math.PI * 2,
      brightness: 0.15 + Math.random() * 0.85
    };
  }

  function buildParticles() {
    particles = Array.from({ length: particleCount() }, randomSpherePoint);
  }

  function rotateY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x * cos - p.z * sin,
      y: p.y,
      z: p.x * sin + p.z * cos
    };
  }

  function rotateX(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x,
      y: p.y * cos - p.z * sin,
      z: p.y * sin + p.z * cos
    };
  }

  function render() {
    if (!running) return;
    rafId = requestAnimationFrame(render);

    time += 0.008;
    mouseX += (targetX - mouseX) * 0.045;
    mouseY += (targetY - mouseY) * 0.045;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const mouseRotY = ((mouseX - cx) / width) * 0.9;
    const mouseRotX = ((mouseY - cy) / height) * -0.65;
    const rotationY = time * 0.7 + mouseRotY;
    const rotationX = Math.sin(time * 0.42) * 0.28 + mouseRotX;
    const projected = [];

    for (const p of particles) {
      const pulse = 1 + Math.sin(time * 2.2 + p.phase) * 0.035;
      let q = {
        x: p.x * pulse,
        y: p.y * pulse,
        z: p.z * pulse
      };
      const swirl = Math.sin(time * 1.5 + p.phase + p.y * 0.018) * 0.07;
      q = rotateY(q, rotationY * p.speed + swirl);
      q = rotateX(q, rotationX);

      const depth = CAMERA / (CAMERA - q.z);
      const x = cx + q.x * depth;
      const y = cy + q.y * depth;
      const edge = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z) / SPHERE_RADIUS;
      const alpha = Math.max(0.06, Math.min(1, p.brightness * (0.45 + depth * 0.55)));
      const size = p.baseSize * depth * (0.65 + edge * 0.55);
      projected.push({ x, y, z: q.z, size, alpha });
    }

    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#fff';
      ctx.fillRect(
        Math.round(p.x),
        Math.round(p.y),
        Math.max(1, Math.round(p.size)),
        Math.max(1, Math.round(p.size))
      );
    }

    ctx.globalAlpha = 1;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, SPHERE_RADIUS * 1.3);
    glow.addColorStop(0, 'rgba(255,255,255,.12)');
    glow.addColorStop(0.35, 'rgba(255,255,255,.035)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, SPHERE_RADIUS * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  }

  function onPointerLeave() {
    targetX = width / 2;
    targetY = height / 2;
  }

  function start() {
    if (running) return;
    resize();
    buildParticles();
    running = true;
    time = 0;
    rafId = requestAnimationFrame(render);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('resize', onResize);
  }

  function onResize() {
    if (!running) return;
    resize();
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('resize', onResize);
  window.SplashSphere = { start, stop };
  start();
})();
