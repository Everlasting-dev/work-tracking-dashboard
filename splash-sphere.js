/* Orbitask splash — rotating number sphere */
(function () {
  const canvas = document.getElementById('splash-sphere');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  let W = 0;
  let H = 0;
  let CX = 0;
  let CY = 0;
  let R = 210;
  let camera = 650;
  let angle = 0;
  const tilt = -0.18;
  let particles = [];
  let sprites = {};
  let rafId = 0;
  let running = false;
  let lastFrame = 0;

  const qualityMap = {
    low: { surface: 360, inner: 50, fps: 45 },
    medium: { surface: 620, inner: 90, fps: 50 },
    high: { surface: 900, inner: 140, fps: 55 }
  };

  function pickQuality() {
    const small = Math.min(window.innerWidth, window.innerHeight);
    if (small < 480) return qualityMap.low;
    if (small < 900) return qualityMap.medium;
    return qualityMap.high;
  }

  let quality = pickQuality();

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    CX = W / 2;
    CY = H * 0.42;
    const small = Math.min(W, H);
    R = small * 0.28;
    camera = small * 1.08;
    createSprites();
  }

  function createSprites() {
    sprites = {};
    const sizes = [6, 8, 10, 12, 15, 18, 22, 26, 30];
    for (const size of sizes) {
      sprites[size] = {};
      for (let d = 0; d <= 9; d++) {
        const s = document.createElement('canvas');
        const pad = Math.ceil(size * 0.45);
        s.width = size + pad * 2;
        s.height = size + pad * 2;
        const c = s.getContext('2d');
        c.clearRect(0, 0, s.width, s.height);
        c.fillStyle = '#fff';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.font = `${size}px Arial, Helvetica, sans-serif`;
        c.fillText(String(d), s.width / 2, s.height / 2);
        sprites[size][d] = s;
      }
    }
  }

  function nearestSize(size) {
    if (size < 7) return 6;
    if (size < 9) return 8;
    if (size < 11) return 10;
    if (size < 14) return 12;
    if (size < 17) return 15;
    if (size < 20) return 18;
    if (size < 24) return 22;
    if (size < 28) return 26;
    return 30;
  }

  function createParticles() {
    particles = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < quality.surface; i++) {
      const y = 1 - (i / (quality.surface - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      particles.push({
        x: Math.cos(theta) * r,
        y,
        z: Math.sin(theta) * r,
        digit: Math.floor(Math.random() * 10),
        bias: Math.random(),
        alphaBias: 0.75 + Math.random() * 0.25,
        rotate: Math.random() * Math.PI * 2,
        inner: false
      });
    }
    for (let i = 0; i < quality.inner; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const rr = Math.cbrt(Math.random()) * 0.62;
      particles.push({
        x: rr * Math.sin(phi) * Math.cos(theta),
        y: rr * Math.cos(phi),
        z: rr * Math.sin(phi) * Math.sin(theta),
        digit: Math.floor(Math.random() * 10),
        bias: Math.random() * 0.5,
        alphaBias: 0.25,
        rotate: Math.random() * Math.PI * 2,
        inner: true
      });
    }
  }

  function drawSprite(digit, x, y, size, alpha, rot) {
    const s = nearestSize(size);
    const img = sprites[s][digit];
    if (!img) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }

  function render(now) {
    if (!running) return;
    rafId = requestAnimationFrame(render);
    const frameInterval = 1000 / quality.fps;
    if (now - lastFrame < frameInterval) return;
    lastFrame = now;
    angle += 0.012;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const sinY = Math.sin(angle);
    const cosY = Math.cos(angle);
    const sinX = Math.sin(tilt);
    const cosX = Math.cos(tilt);
    const list = [];
    for (const p of particles) {
      let x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;
      let y = p.y;
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;
      y = y2;
      z = z2;
      const zz = z * R;
      const perspective = camera / (camera - zz);
      const sx = CX + x * R * perspective;
      const sy = CY + y * R * perspective;
      const front = (z + 1) * 0.5;
      const rim = Math.pow(Math.sqrt(x * x + y * y), 2.3);
      let alpha = 0.06 + front * 0.42 + rim * 0.48;
      alpha *= p.alphaBias;
      if (p.inner) alpha *= 0.65;
      if (alpha < 0.045) continue;
      const size = 6 + (front * 18 + p.bias * 8) * perspective;
      list.push({ z, x: sx, y: sy, digit: p.digit, size, alpha: Math.min(alpha, 1), rot: p.rotate + angle * 0.12 });
    }
    list.sort((a, b) => a.z - b.z);
    for (const p of list) drawSprite(p.digit, p.x, p.y, p.size, p.alpha, p.rot);
  }

  function start() {
    if (running) return;
    quality = pickQuality();
    resize();
    createParticles();
    running = true;
    lastFrame = 0;
    rafId = requestAnimationFrame(render);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onResize() {
    if (!running) return;
    resize();
  }

  window.SplashSphere = { start, stop };
  window.addEventListener('resize', onResize);
  start();
})();
