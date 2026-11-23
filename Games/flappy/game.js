(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = cv.lw, H = cv.lh, GROUND = 60, GAP = 140, PWID = 60;
  var bird, pipes, score, state, T = 0, acc, clouds = [], gx = 0;
  $('bs').textContent = PP.best('flappy');
  for (var i = 0; i < 5; i++) clouds.push({ x: Math.random() * W, y: 40 + Math.random() * 220, s: .2 + Math.random() * .3 });

  function show(t, p, b) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').textContent = b; $('ov').hidden = false; }
  function reset() {
    bird = { x: 90, y: H / 2 - 30, v: 0, r: 0 }; pipes = []; score = 0; acc = 0; $('sc').textContent = 0; state = 'ready';
    show('Flappy Hop', 'Tap, click or press Space', 'Start');
  }
  function flap() {
    if (state === 'over') return;
    if (state === 'ready') { state = 'run'; $('ov').hidden = true; }
    bird.v = -6.4; PP.sfx('flap'); PP.burst(bird.x - 8, bird.y + 6, '#fff4d6', 4, 1.5);
  }
  function die() {
    state = 'over'; PP.sfx('lose'); PP.shake(9); PP.burst(bird.x, bird.y, '#ffd23f', 24, 5);
    if (PP.setBest('flappy', score)) $('bs').textContent = score;
    show('Game over', 'Score ' + score, 'Again');
  }
  function update(dt) {
    if (state === 'ready') { bird.y = H / 2 - 30 + Math.sin(T / 10) * 8; return; }
    if (state !== 'run') { if (bird.y < H - GROUND - 12) { bird.v += .4 * dt; bird.y += bird.v * dt; } return; }
    bird.v += .36 * dt; bird.y += bird.v * dt; bird.r = Math.max(-.5, Math.min(1.2, bird.v / 9));
    acc += dt;
    if (!pipes.length || pipes[pipes.length - 1].x < W - 200) pipes.push({ x: W + 10, gy: 90 + Math.random() * (H - GROUND - GAP - 130), ok: false });
    pipes.forEach(function (p) {
      p.x -= 2.4 * dt;
      if (!p.ok && p.x + PWID < bird.x) { p.ok = true; score++; $('sc').textContent = score; PP.sfx('coin'); PP.pop('+1', bird.x + 40, bird.y - 20); }
      if (bird.x + 11 > p.x && bird.x - 11 < p.x + PWID && (bird.y - 10 < p.gy || bird.y + 10 > p.gy + GAP)) die();
    });
    pipes = pipes.filter(function (p) { return p.x > -PWID - 10; });
    if (bird.y + 11 > H - GROUND || bird.y < -20) die();
  }
  function render(dt) {
    T += dt; update(dt); gx = (gx + (state === 'run' ? 2.4 * dt : 0.4 * dt)) % 24;
    var n = PP.night(), sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, n ? '#1b0f45' : '#6fd0ff'); sky.addColorStop(1, n ? '#6a2a7a' : '#ffe9b8');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    clouds.forEach(function (c) { c.x -= c.s * dt; if (c.x < -80) c.x = W + 20; g.fillStyle = n ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.75)'; PP.circ(g, c.x + 14, c.y, 12, g.fillStyle); PP.circ(g, c.x + 30, c.y - 6, 16, g.fillStyle); PP.circ(g, c.x + 48, c.y, 12, g.fillStyle); });
    pipes.forEach(function (p) { PP.props.pipe(g, p.x, 0, p.gy, true, PWID); PP.props.pipe(g, p.x, p.gy + GAP, H, false, PWID); });
    g.fillStyle = '#c98a3c'; g.fillRect(0, H - GROUND, W, GROUND); g.fillStyle = '#6fe048'; g.fillRect(0, H - GROUND, W, 12);
    g.fillStyle = 'rgba(10,6,24,.4)'; g.fillRect(0, H - GROUND, W, 2);
    g.fillStyle = '#a56a28'; for (var x = -gx; x < W; x += 24) { PP.rr(g, x, H - GROUND + 22, 12, 6, 3, '#a56a28'); PP.ell(g, x + 6, H - GROUND + 40, 3, 2, '#b87a34'); } for (x = -gx * 1.6 % 90; x < W; x += 90) PP.props.tuft(g, x, H - GROUND + 3, 1);
    PP.ell(g, bird.x, H - GROUND + 2, Math.max(4, 14 - Math.abs(H - GROUND - bird.y) / 22), 3, 'rgba(0,0,0,.2)');
    g.save(); g.translate(bird.x, bird.y); g.rotate(bird.r);
    PP.chars.bird(g, Math.sin(T / (state === 'run' ? 1.6 : 4)));
    g.restore();
  }
  addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); flap(); } });
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); flap(); });
  $('start').addEventListener('click', function () { if (state === 'over') reset(); flap(); });
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
