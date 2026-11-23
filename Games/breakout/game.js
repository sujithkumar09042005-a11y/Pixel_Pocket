// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = cv.lw, H = cv.lh;
  var COLS = 10, ROWS = 8, BW = W / COLS, BH = 22, TOP = 56;
  var PW = 96, PH = 14, px, ball, bricks, score, lives, state, left, right, level, trail = [], T = 0;
  var RC = ['#ff4f5a', '#ff9442', '#ffd23f', '#8cff5a', '#35e0ff', '#4a7bff', '#d44fff', '#ff4f8b'];
  // Level layouts: '.' empty, 0-7 colour row, '#' tough (2 hits), 'X' gold (3 hits). 8 rows x 10 cols; cycles after the last.
  var LEVELS = [
    ['..........', '0000000000', '1111111111', '2222222222', '3333333333', '4444444444', '..........', '..........'],
    ['....00....', '...1111...', '..222222..', '.33333333.', '4444444444', '.55555555.', '..666666..', '...7777...'],
    ['0.1.2.3.4.', '.1.2.3.4.5', '1.2.3.4.5.', '.2.3.4.5.6', '2.3.4.5.6.', '.3.4.5.6.7', '3.4.5.6.7.', '..........'],
    ['0........0', '10......01', '210....012', '3210..0123', '43210.0123', '..........', '..#.##.#..', '..........'],
    ['0000000000', '0........0', '0.222222.0', '0.2....2.0', '0.2.##.2.0', '0.2....2.0', '0.222222.0', '0000000000'],
    ['1111111111', '..........', '2222.22222', '..........', '3333333.33', '..........', '4.44444444', '..........'],
    ['....XX....', '...####...', '..##22##..', '.##1111##.', '##000000##', '.##1111##.', '..##22##..', '...####...'],
    ['0123401234', '1234012340', '2340123401', '3401234012', '4012340123', '0123401234', '1234012340', '..........']
  ];
  $('bs').textContent = PP.best('breakout');

  function show(t, p, b) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').textContent = b; $('ov').hidden = false; }
  function build() {
    bricks = []; var L = LEVELS[level % LEVELS.length], tough = Math.floor(level / LEVELS.length);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var ch = L[r][c]; if (ch === '.') continue;
      var hp = ch === '#' ? 2 : ch === 'X' ? 3 : 1 + (tough > 0 && (r + c) % 4 === 0 ? 1 : 0);
      bricks.push({ x: c * BW, y: TOP + r * BH, hp: hp, max: hp, col: ch === '#' ? '#b8b8d8' : ch === 'X' ? '#ffd23f' : RC[+ch % RC.length], on: true, pts: 10 * (hp + 1), flash: 0 });
    }
  }
  function serve() { px = W / 2 - PW / 2; ball = { x: W / 2, y: H - 50, vx: 0, vy: 0, s: Math.min(8.5, 5 + level * .45) }; trail = []; state = 'serve'; }
  function reset() { score = 0; lives = 3; level = 0; build(); serve(); upd(); show('Breakout', 'Move the paddle, tap to launch', 'Start'); }
  function upd() { $('sc').textContent = score; $('lv').textContent = lives; }
  function launch() {
    if (state === 'serve') { var a = Math.random() * .8 - .4; ball.vx = ball.s * Math.sin(a); ball.vy = -ball.s * Math.cos(a); state = 'run'; $('ov').hidden = true; }
  }
  function pause() { if (state === 'run') { state = 'pause'; show('Paused', 'Press P to continue', 'Resume'); } else if (state === 'pause') { state = 'run'; $('ov').hidden = true; } }
  function step() {
    if (left) px -= 8; if (right) px += 8; px = Math.max(0, Math.min(W - PW, px));
    if (state === 'serve') { ball.x = px + PW / 2; ball.y = H - 50; return; }
    if (state !== 'run') return;
    var n = 2;
    for (var i = 0; i < n; i++) {
      ball.x += ball.vx / n; ball.y += ball.vy / n;
      if (ball.x < 7) { ball.x = 7; ball.vx = Math.abs(ball.vx); PP.sfx('bounce'); }
      if (ball.x > W - 7) { ball.x = W - 7; ball.vx = -Math.abs(ball.vx); PP.sfx('bounce'); }
      if (ball.y < 7) { ball.y = 7; ball.vy = Math.abs(ball.vy); PP.sfx('bounce'); }
      if (ball.vy > 0 && ball.y > H - 37 && ball.y < H - 30 + PH && ball.x > px - 4 && ball.x < px + PW + 4) {
        var t = (ball.x - (px + PW / 2)) / (PW / 2), a = t * 1.05;
        ball.vx = ball.s * Math.sin(a); ball.vy = -ball.s * Math.cos(a); ball.y = H - 37; PP.sfx('bounce');
      }
      for (var k = 0; k < bricks.length; k++) {
        var b = bricks[k]; if (!b.on) continue;
        if (ball.x > b.x - 5 && ball.x < b.x + BW + 5 && ball.y > b.y - 5 && ball.y < b.y + BH + 5) {
          var ox = Math.min(ball.x - b.x, b.x + BW - ball.x), oy = Math.min(ball.y - b.y, b.y + BH - ball.y);
          if (ox < oy) ball.vx = -ball.vx; else ball.vy = -ball.vy;
          b.hp--; b.flash = 8;
          if (b.hp <= 0) {
            b.on = false; score += b.pts; PP.sfx('hit'); PP.burst(b.x + BW / 2, b.y + BH / 2, b.col, 10, 4); PP.shake(1.5);
            upd(); if (PP.setBest('breakout', score)) $('bs').textContent = score;
          } else PP.sfx('bounce');
          break;
        }
      }
    }
    if (bricks.every(function (b) { return !b.on; })) {
      level++; PP.sfx('win'); PP.pop('Level ' + (level + 1), W / 2, H / 2); build(); serve();
      show('Level ' + (level + 1), 'Tap to launch', 'Go'); return;
    }
    if (ball.y > H + 10) {
      lives--; upd(); PP.sfx('lose'); PP.shake(7);
      if (lives <= 0) { state = 'over'; show('Game over', 'Score ' + score, 'Again'); } else serve();
    }
  }
  function render(dt) {
    T += dt;
    var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, PP.night() ? '#150b33' : '#fff8e6'); gr.addColorStop(1, PP.night() ? '#0c0620' : '#ffe9b8'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.font = '800 14px ' + PP.font; g.textAlign = 'left'; g.fillStyle = PP.night() ? '#a99bd1' : '#6b5a8e'; g.fillText('LEVEL ' + (level + 1), 10, 24);
    bricks.forEach(function (b) {
      if (!b.on) return; var col = b.col; if (b.flash > 0) { b.flash -= dt; col = '#ffffff'; }
      PP.block(g, b.x + 1.5, b.y + 1.5, BW - 3, BH - 3, col, 6);
      if (b.max > 1) { g.fillStyle = 'rgba(10,6,24,.55)'; for (var d = 0; d < b.hp; d++) g.fillRect(b.x + BW / 2 - b.hp * 5 + d * 10 + 2, b.y + BH / 2 - 2, 6, 4); }
    });
    trail.push({ x: ball.x, y: ball.y }); if (trail.length > 9) trail.shift();
    trail.forEach(function (t, i) { PP.circ(g, t.x, t.y, 2 + i * .5, 'rgba(255,210,63,' + (i / 20) + ')'); });
    PP.ell(g, px + PW / 2, H - 12, PW / 2 - 6, 4, 'rgba(0,0,0,.25)');
    PP.props.paddle(g, px, H - 30, PW);
    PP.orb(g, ball.x, ball.y, 7, '#ffd23f');
  }
  function pointer(cx) { var r = cv.getBoundingClientRect(); px = (cx - r.left) / r.width * W - PW / 2; }
  cv.addEventListener('mousemove', function (e) { pointer(e.clientX); });
  cv.addEventListener('touchmove', function (e) { pointer(e.touches[0].clientX); }, { passive: true });
  cv.addEventListener('touchstart', function (e) { pointer(e.touches[0].clientX); launch(); }, { passive: true });
  cv.addEventListener('click', launch);
  addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') { left = true; e.preventDefault(); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { right = true; e.preventDefault(); }
    else if (e.key === ' ') { e.preventDefault(); if (state === 'serve' && $('ov').hidden) launch(); }
    else if (e.key === 'p' || e.key === 'P') pause();
  });
  addEventListener('keyup', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') left = false; else if (e.key === 'ArrowRight' || e.key === 'd') right = false;
  });
  $('start').addEventListener('click', function () {
    if (state === 'pause') { state = 'run'; $('ov').hidden = true; }
    else if (state === 'over') { reset(); $('ov').hidden = true; }
    else $('ov').hidden = true;
  });
  $('pause').addEventListener('click', pause);
  $('again').addEventListener('click', reset);
  reset();
  var acc = 0;
  PP.run(cv, g, function (dt) { acc += dt; while (acc >= 1) { step(); acc -= 1; } render(dt); });
})();
