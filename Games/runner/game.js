// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = cv.lw, H = cv.lh, GY = H - 56;
  var pl, obs, spd, dist, state, T = 0, nextOb, holdJump, duck, hills = [], clouds = [];
  $('bs').textContent = PP.best('runner');
  for (var i = 0; i < 6; i++) { hills.push({ x: i * 130, h: 40 + Math.random() * 50 }); clouds.push({ x: Math.random() * W, y: 20 + Math.random() * 90 }); }

  function show(t, p, b) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').textContent = b; $('ov').hidden = false; }
  function reset() { pl = { x: 70, y: GY, v: 0, air: false }; obs = []; spd = 4.5; dist = 0; nextOb = 80; state = 'ready'; $('sc').textContent = 0; show('Pixel Runner', 'Tap or press Space', 'Start'); }
  function jump() {
    if (state === 'ready') { state = 'run'; $('ov').hidden = true; }
    if (state === 'run' && !pl.air) { pl.v = -10.5; pl.air = true; PP.sfx('jump'); PP.burst(pl.x + 10, GY, '#fff4d6', 6, 2); }
  }
  function die() {
    state = 'over'; PP.sfx('lose'); PP.shake(9); PP.burst(pl.x + 12, pl.y - 16, '#ff4f8b', 24, 5);
    var d = dist | 0; if (PP.setBest('runner', d)) $('bs').textContent = d; show('Crashed!', 'Distance ' + d, 'Again');
  }
  function box() { var h = duck && !pl.air ? 20 : 38; return { x: pl.x + 4, y: pl.y - h, w: 22, h: h }; }
  function update(dt) {
    spd = Math.min(11, spd + .0016 * dt); dist += spd * dt * .1; $('sc').textContent = dist | 0;
    pl.v += (holdJump && pl.v < 0 ? .45 : .85) * dt; pl.y += pl.v * dt;
    if (pl.y >= GY) { pl.y = GY; pl.v = 0; pl.air = false; }
    nextOb -= spd * dt;
    if (nextOb <= 0) {
      var r = Math.random(), o;
      if (r < .6) { var n = 1 + (Math.random() * 2 | 0); o = { t: 'c', n: n, v: Math.random() * 2 | 0, x: W + 20, w: 26 * n, h: 30 + (Math.random() * 14 | 0) }; }
      else if (r < .85 || dist < 60) o = { t: 'c', n: 1, v: Math.random() * 2 | 0, x: W + 20, w: 26, h: 44 };
      else o = { t: 'b', x: W + 20, y: GY - 48 - (Math.random() < .5 ? 0 : 20), w: 32, h: 18 };
      obs.push(o); nextOb = 190 + Math.random() * 160 + spd * 14;
    }
    var b = box();
    obs.forEach(function (o) {
      o.x -= spd * dt; var oy = o.t === 'c' ? GY - o.h : o.y - o.h;
      if (b.x < o.x + o.w - 3 && b.x + b.w > o.x + 3 && b.y < oy + o.h && b.y + b.h > oy) die();
    });
    obs = obs.filter(function (o) { return o.x > -60; });
  }
  function render(dt) {
    T += dt; if (state === 'run') update(dt);
    var n = PP.night(), s = state === 'run' ? spd : 1;
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, n ? '#1b0f45' : '#6fd0ff'); sky.addColorStop(1, n ? '#7a2a7a' : '#ffe9b8'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    PP.circ(g, W - 80, 56, 26, n ? '#fff4d6' : '#ffd23f');
    clouds.forEach(function (c) { c.x -= .3 * s * dt; if (c.x < -60) c.x = W + 20; var f = n ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.75)'; PP.circ(g, c.x + 12, c.y, 10, f); PP.circ(g, c.x + 28, c.y - 5, 14, f); PP.circ(g, c.x + 44, c.y, 10, f); });
    hills.forEach(function (h) { h.x -= .8 * s * dt; if (h.x < -140) h.x = W + 10; PP.ell(g, h.x + 60, GY + 6, 70, h.h, n ? '#3a1a6a' : '#c9a0e0'); PP.props.tree(g, h.x + 60, GY + 4, 26 + h.h * .35, n); });
    g.fillStyle = '#6fe048'; g.fillRect(0, GY, W, 10); g.fillStyle = '#c98a3c'; g.fillRect(0, GY + 10, W, H); g.fillStyle = 'rgba(10,6,24,.4)'; g.fillRect(0, GY, W, 2);
    var off = (T * s) % 30; for (var x = -off; x < W; x += 30) PP.rr(g, x, GY + 24, 14, 6, 3, '#a56a28');
    obs.forEach(function (o) {
      if (o.t === 'c') { for (var k = 0; k < o.n; k++) PP.props.cactus(g, o.x + k * 30 - 12, GY, o.h, o.v); }
      else PP.props.flyer(g, o.x + 16, o.y - o.h + 6, (T / 4 | 0) % 4);
    });
    PP.chars.kid(g, pl.x + 14, pl.y, { air: pl.air, ph: pl.air ? 0 : T / 2.2, duck: duck && !pl.air, lift: GY - pl.y, T: T });
  }
  addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); if (!holdJump) jump(); holdJump = true; }
    else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); duck = true; if (pl.air) pl.v += 3; }
  });
  addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') holdJump = false; else if (e.key === 'ArrowDown' || e.key === 's') duck = false; });
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); holdJump = true; });
  addEventListener('pointerup', function () { holdJump = false; });
  $('jump').addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); holdJump = true; });
  $('duck').addEventListener('pointerdown', function (e) { e.preventDefault(); duck = true; }); addEventListener('pointerup', function () { duck = false; });
  $('start').addEventListener('click', function () { if (state === 'over') reset(); jump(); });
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
