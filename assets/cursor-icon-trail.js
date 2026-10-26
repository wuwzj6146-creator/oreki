(() => {
  const allowed = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-icon-trail';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9000;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  const marks = [];
  let frame = 0, previous = null, distance = 0, count = 0;
  let width = innerWidth, height = innerHeight;
  const paths = [
    'M-4-6 L5 1 L1 2 L3 6 L1 7 L-1 3 L-4 6 Z',
    'M-4 5 L-3 1 L3-5 L6-2 L0 4 Z M-3 1 L0 4 M2-4 L5-1',
    'M-5 0 H5 M0-5 V5',
    'M-5-3 H5 V3 H-5 Z',
    'M-6 1 Q-4-3-2 1 T2 1 T6 1',
    'M-4 4 L-6 0 Q-6-2-4-1 L-2 1 V-5 Q-1-7 0-5 V-1 L1-3 Q2-4 3-2 L5-1 V3 Q4 6 1 6 H-1 Z'
  ].map(d => new Path2D(d));
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0;
    marks.length = 0; previous = null; distance = 0;
    ctx.clearRect(0, 0, width, height);
  }
  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    while (marks.length && now - marks[0].time > 650) marks.shift();
    for (const mark of marks) {
      const age = Math.min(1, (now - mark.time) / 650);
      ctx.save();
      const spread = 1 - Math.pow(1 - age, 2);
      const size = 1.65 * (1 - Math.pow(age, 1.5));
      ctx.translate(mark.x + mark.dx * spread, mark.y + mark.dy * spread);
      ctx.rotate(mark.rotation + age * mark.spin);
      ctx.scale(size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ctx.fillStyle = mark.color;
      ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (mark.kind === 6) { ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.stroke(paths[mark.kind]);
      ctx.restore();
    }
    frame = marks.length ? requestAnimationFrame(draw) : 0;
  }
  function add(x, y) {
    const kind = [0, 6, 2, 1, 3, 0, 5, 4][count % 8];
    const angle = Math.random() * Math.PI * 2;
    const radius = 28 + Math.random() * 38;
    marks.push({x, y, time: performance.now(), kind,
      dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius,
      spin: (Math.random() - .5) * 2.4,
      rotation: (Math.random() - .5) * .55,
      color: count++ % 7 === 0 ? '#e1ccff' : count % 5 === 0 ? '#ffd0c5' : '#ffffff'});
    if (marks.length > 70) marks.shift();
  }
  window.addEventListener('pointermove', event => {
    if (!allowed.matches || reduced.matches || event.pointerType !== 'mouse') return;
    const point = {x: event.clientX, y: event.clientY};
    if (!previous) { previous = point; return; }
    const dx = point.x - previous.x, dy = point.y - previous.y;
    const length = Math.hypot(dx, dy);
    if (length > 240) { previous = point; distance = 0; return; }
    if (length > 0) {
      let step = 50 - distance;
      for (; step <= length; step += 50) add(previous.x + dx * step / length, previous.y + dy * step / length);
      distance = (distance + length) % 50;
    }
    previous = point;
    if (!frame && marks.length) frame = requestAnimationFrame(draw);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { previous = null; distance = 0; });
  window.addEventListener('blur', clear);
  window.addEventListener('resize', () => { clear(); resize(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  window.addEventListener('pagehide', clear);
  allowed.addEventListener('change', clear);
  reduced.addEventListener('change', clear);
  resize();
})();
