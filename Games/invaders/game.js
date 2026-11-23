(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = cv.lw, H = cv.lh;
  var CELL = 44, AW = 32, AH = 26;
  var ship, aliens, dir, bullets, bombs, stars = [], score, lives, state, T = 0, fireCd, left, right, wave, stepAcc, anim = 0, invuln, tp = null, total, tick = 0;
  var RC = ['#ff4f8b', '#ff9442', '#ffd23f', '#8cff5a', '#35e0ff', '#d44fff'];
  // Wave formations. '.' empty; digit = alien type/colour (0 crab, 1 squid, 2 blob, 3 bug, 4 skull, 5 boss(2 hits)). 10 cols.
  var FORM = [
    ['.1111111.', '.2222222.', '.3333333.', '.4444444.'],
    ['....0....', '...111...', '..22222..', '.3333333.', '444444444'],
    ['0.0.0.0.0', '.1.1.1.1.', '2.2.2.2.2', '.3.3.3.3.', '4.4.4.4.4'],
    ['000...000', '.111.111.', '..22222..', '.33...33.', '4.......4'],
    ['444444444', '.3.3.3.3.', '2.2.2.2.2', '.1.1.1.1.', '0.0.0.0.0'],
    ['....5....', '...000...', '..11111..', '.2222222.', '333333333'],
    ['0.......0', '.1.....1.', '..2...2..', '...3.3...', '....4....', '...3.3...'],
    ['111111111', '.2222222.', '..33333..', '...444...', '....5....']
  ];
  $('bs').textContent = PP.best('invaders');
  for (var i = 0; i < 40; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, s: .2 + Math.random() * .8, p: Math.random() * 6 });

  function show(t, p, b) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').textContent = b; $('ov').hidden = false; }
  function spawn() {
    aliens = []; var F = FORM[(wave - 1) % FORM.length], cols = F[0].length, ox = (W - cols * CELL) / 2 + (CELL - AW) / 2;
    for (var r = 0; r < F.length; r++) for (var c = 0; c < cols; c++) {
      var ch = F[r][c]; if (ch === '.') continue; var t = +ch, boss = t === 5;
      aliens.push({ x: ox + c * CELL, y: 50 + r * 38, t: t, on: true, hp: boss || wave > 6 && r === 0 ? 2 : 1, hurt: 0 });
    }
    total = aliens.length; dir = 1; bullets = []; bombs = []; stepAcc = 0;
  }
  function reset() { ship = { x: W / 2 }; score = 0; lives = 3; wave = 1; fireCd = 0; invuln = 0; spawn(); upd(); state = 'ready'; show('Space Invaders', 'Defend the pocket', 'Start'); }
  function upd() { $('sc').textContent = score; $('lv').textContent = lives; }
  function fire() { if (fireCd <= 0 && bullets.length < 3) { bullets.push({ x: ship.x, y: H - 60 }); fireCd = 16; PP.sfx('shoot'); } }
  function alive() { return aliens.filter(function (a) { return a.on; }); }
  function update(dt) {
    if (left) ship.x -= 4.8 * dt; if (right) ship.x += 4.8 * dt; if (tp !== null) ship.x += (tp - ship.x) * Math.min(1, .25 * dt);
    ship.x = Math.max(22, Math.min(W - 22, ship.x)); fireCd -= dt; invuln -= dt;
    if (tp !== null) fire();
    var al = alive();
    if (!al.length) { wave++; PP.sfx('win'); PP.pop('Wave ' + wave, W / 2, H / 2); spawn(); bombs = []; return; }
    var interval = Math.max(4, 34 - wave * 2 - (total - al.length) * 28 / total);
    stepAcc += dt;
    if (stepAcc >= interval) {
      stepAcc = 0; anim ^= 1; var edge = false;
      al.forEach(function (a) { if ((dir > 0 && a.x + AW > W - 8) || (dir < 0 && a.x < 8)) edge = true; });
      if (edge) { dir = -dir; al.forEach(function (a) { a.y += 16; }); } else al.forEach(function (a) { a.x += dir * 10; });
      PP.sfx('bounce');
    }
    if (Math.random() < (.011 + wave * .0012) * dt) { var s = al[Math.random() * al.length | 0]; bombs.push({ x: s.x + AW / 2, y: s.y + AH }); }
    bullets.forEach(function (b) { b.y -= 8 * dt; });
    bombs.forEach(function (b) { b.y += (2.6 + wave * .15) * dt; });
    bullets = bullets.filter(function (b) {
      if (b.y < -10) return false;
      for (var i = 0; i < aliens.length; i++) { var a = aliens[i];
        if (a.on && b.x > a.x && b.x < a.x + AW && b.y > a.y && b.y < a.y + AH) {
          a.hp--; a.hurt = 8;
          if (a.hp <= 0) { a.on = false; score += 10 * (a.t === 5 ? 6 : 5 - a.t % 5); upd(); PP.sfx('hit'); PP.burst(a.x + AW / 2, a.y + AH / 2, RC[a.t], 12, 4); PP.shake(1.5); if (PP.setBest('invaders', score)) $('bs').textContent = score; }
          else PP.sfx('bounce');
          return false; } }
      return true;
    });
    bombs = bombs.filter(function (b) {
      if (b.y > H) return false;
      if (invuln <= 0 && b.y > H - 56 && b.y < H - 20 && Math.abs(b.x - ship.x) < 20) {
        lives--; upd(); invuln = 90; PP.sfx('boom'); PP.shake(10); PP.burst(ship.x, H - 38, '#35e0ff', 18, 5);
        if (lives <= 0) { state = 'over'; show('Game over', 'Score ' + score, 'Again'); } return false; }
      return true;
    });
    al.forEach(function (a) { if (a.y + AH > H - 62) { lives = 0; upd(); state = 'over'; PP.sfx('lose'); show('Invaded!', 'Score ' + score, 'Again'); } });
  }
  var HURT = ['#ffc2d9', '#ffd9b8', '#e6ffc9', '#fff0b0', '#c8f6ff', '#f0c8ff'];
  function alienSprite(t, f, hurt) { return PP.sprite('al' + t + f + hurt, 44, 38, function (c) { PP.chars.alien(c, t, f, hurt); }); }
  function alien(a) { if (a.hurt > 0) a.hurt -= .5; g.drawImage(alienSprite(a.t, anim, a.hurt > 0 ? 1 : 0), a.x - 6, a.y - 6, 44, 38); }
  function shipSprite() { return PP.sprite('ship', 56, 52, function (c) { PP.chars.ship(c); }); }
  function render(dt) {
    T += dt; if (state === 'run') update(dt);
    var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, PP.night() ? '#0a0626' : '#2a1a58'); gr.addColorStop(1, PP.night() ? '#1d0c40' : '#4a2c92'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    stars.forEach(function (s) { s.y += s.s * .4 * dt; if (s.y > H) s.y = 0; g.fillStyle = 'rgba(255,255,255,' + (.3 + .5 * Math.abs(Math.sin(T / 30 + s.p))) + ')'; g.beginPath(); g.arc(s.x, s.y, s.s > .7 ? 1.6 : 1, 0, 6.2832); g.fill(); });
    g.font = '800 14px ' + PP.font; g.textAlign = 'left'; g.fillStyle = '#a99bd1'; g.fillText('WAVE ' + wave, 10, 24);
    aliens.forEach(function (a) { if (a.on) alien(a); });
    bullets.forEach(function (b) { PP.props.laser(g, b.x, b.y); });
    bombs.forEach(function (b) { PP.props.plasma(g, b.x, b.y, T); });
    if (state !== 'over' && (invuln <= 0 || (T | 0) % 6 < 3)) {
      var sx = ship.x, sy = H - 56, fl = 10 + Math.sin(T / 1.5) * 4;
      var fg = g.createLinearGradient(0, sy + 46, 0, sy + 46 + fl + 6); fg.addColorStop(0, '#fff4d6'); fg.addColorStop(.4, '#ffd23f'); fg.addColorStop(1, 'rgba(255,79,90,0)');
      g.fillStyle = fg; g.beginPath(); g.moveTo(sx - 6, sy + 44); g.quadraticCurveTo(sx, sy + 52 + fl, sx + 6, sy + 44); g.fill();
      g.drawImage(shipSprite(), sx - 28, sy, 56, 52);
    }
    g.fillStyle = PP.css('--accent'); g.globalAlpha = .5; g.fillRect(0, H - 12, W, 2); g.globalAlpha = 1;
  }
  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') { left = true; e.preventDefault(); } else if (e.key === 'ArrowRight' || e.key === 'd') { right = true; e.preventDefault(); }
    else if (e.key === ' ') { e.preventDefault(); if (state === 'run') fire(); } else if (e.key === 'p' || e.key === 'P') pause();
  });
  addEventListener('keyup', function (e) { if (e.key === 'ArrowLeft' || e.key === 'a') left = false; else if (e.key === 'ArrowRight' || e.key === 'd') right = false; });
  function pt(e) { var r = cv.getBoundingClientRect(); tp = (e.clientX - r.left) / r.width * W; }
  cv.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') pt(e); else fire(); });
  cv.addEventListener('pointermove', function (e) { pt(e); });
  cv.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') tp = null; });
  cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') tp = null; });
  function pause() { if (state === 'run') { state = 'pause'; show('Paused', 'Press P to continue', 'Resume'); } else if (state === 'pause') { state = 'run'; $('ov').hidden = true; } }
  $('start').addEventListener('click', function () { if (state === 'over') reset(); if (state === 'pause' || state === 'ready') { state = 'run'; $('ov').hidden = true; } });
  $('pause').addEventListener('click', pause);
  $('again').addEventListener('click', function () { reset(); });
  reset(); PP.run(cv, g, render);
})();
