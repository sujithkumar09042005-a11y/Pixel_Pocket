(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = 10, H = 20, C = 30;
  var SH = { I: [[1,1,1,1]], O: [[1,1],[1,1]], T: [[0,1,0],[1,1,1]], S: [[0,1,1],[1,1,0]], Z: [[1,1,0],[0,1,1]], J: [[1,0,0],[1,1,1]], L: [[0,0,1],[1,1,1]] };
  var COL = { I: '#35e0ff', O: '#ffd23f', T: '#d44fff', S: '#8cff5a', Z: '#ff4f5a', J: '#4a7bff', L: '#ff9442' };
  var board, p, score, lines, timer, state, bag = [];
  $('bs').textContent = PP.best('blocks');

  function show(t, q, b) { $('ov-t').textContent = t; $('ov-p').textContent = q; $('start').textContent = b; $('ov').hidden = false; }
  function color(k) { var c = COL[k]; return c[0] === '-' ? PP.css(c) : c; }
  function next() {
    if (!bag.length) { bag = Object.keys(SH); for (var i = bag.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = bag[i]; bag[i] = bag[j]; bag[j] = t; } }
    var k = bag.pop(), m = SH[k].map(function (r) { return r.slice(); });
    p = { k: k, m: m, x: (W - m[0].length) / 2 | 0, y: 0 };
    if (hit(p.m, p.x, p.y)) over();
  }
  function hit(m, x, y) {
    for (var r = 0; r < m.length; r++) for (var c = 0; c < m[r].length; c++)
      if (m[r][c]) { var bx = x + c, by = y + r; if (bx < 0 || bx >= W || by >= H || (by >= 0 && board[by][bx])) return true; }
    return false;
  }
  function reset() {
    board = []; for (var i = 0; i < H; i++) board.push(new Array(W).fill(null));
    score = 0; lines = 0; bag = []; upd(); state = 'ready'; clearInterval(timer); next(); draw(); show('Block Stack', 'Stack and clear lines', 'Start');
  }
  function upd() { $('sc').textContent = score; $('ln').textContent = lines; }
  function speed() { return Math.max(90, 700 - lines * 25); }
  function run() { state = 'run'; $('ov').hidden = true; clearInterval(timer); timer = setInterval(drop, speed()); }
  function pause() {
    if (state === 'run') { clearInterval(timer); state = 'pause'; show('Paused', 'Press P to continue', 'Resume'); }
    else if (state === 'pause') run();
  }
  function drop() { if (!hit(p.m, p.x, p.y + 1)) { p.y++; draw(); } else lock(); }
  function lock() {
    p.m.forEach(function (r, ry) { r.forEach(function (v, cx) { if (v && p.y + ry >= 0) board[p.y + ry][p.x + cx] = p.k; }); });
    var n = 0;
    for (var y = H - 1; y >= 0; y--) if (board[y].every(Boolean)) { flash.push({ y: y, t: 0 }); PP.burst(W * C / 2, y * C + C / 2, color('I'), 18, 6); board.splice(y, 1); board.unshift(new Array(W).fill(null)); n++; y++; }
    if (n) { PP.shake(n * 2); PP.pop(['', '', 'Double!', 'Triple!', 'BLOCKSTACK!'][n] || '+100', W * C / 2, H * C / 2); lines += n; score += [0, 100, 300, 500, 800][n]; PP.sfx('clear'); clearInterval(timer); timer = setInterval(drop, speed()); } else { PP.sfx('land'); PP.shake(1.5); }
    upd(); next(); if (state === 'run') draw();
  }
  function over() {
    clearInterval(timer); state = 'over'; PP.sfx('lose');
    if (PP.setBest('blocks', score)) $('bs').textContent = score;
    show('Game over', 'Score ' + score, 'Again');
  }
  function rotate() {
    var m = p.m, r = m[0].map(function (_, i) { return m.map(function (row) { return row[i]; }).reverse(); });
    var kicks = [0, -1, 1, -2, 2];
    for (var i = 0; i < kicks.length; i++) if (!hit(r, p.x + kicks[i], p.y)) { p.m = r; p.x += kicks[i]; PP.sfx('blip'); draw(); return; }
  }
  function mv(dx) { if (!hit(p.m, p.x + dx, p.y)) { p.x += dx; draw(); } }
  function hard() { while (!hit(p.m, p.x, p.y + 1)) { p.y++; score += 2; } lock(); }
  var T = 0, flash = [];
  function cell(x, y, col) { PP.block(g, x * C + 1, y * C + 1, C - 2, C - 2, col, 6); }
  function draw() { }
  function render(dt) {
    T += dt;
    var gr = g.createLinearGradient(0, 0, 0, cv.lh); gr.addColorStop(0, PP.night() ? '#150b33' : '#fff8e6'); gr.addColorStop(1, PP.night() ? '#0c0620' : '#ffe9b8');
    g.fillStyle = gr; g.fillRect(0, 0, cv.lw, cv.lh);
    g.fillStyle = PP.night() ? 'rgba(255,255,255,.05)' : 'rgba(42,26,74,.07)';
    for (var x = 1; x < W; x++) g.fillRect(x * C - .5, 0, 1, cv.lh); for (var y = 1; y < H; y++) g.fillRect(0, y * C - .5, cv.lw, 1);
    board.forEach(function (r, y) { r.forEach(function (k, x) { if (k) cell(x, y, color(k)); }); });
    var gy = p.y; while (!hit(p.m, p.x, gy + 1)) gy++;
    g.globalAlpha = .35; p.m.forEach(function (r, ry) { r.forEach(function (v, cx) { if (v) PP.rr(g, (p.x + cx) * C + 3, (gy + ry) * C + 3, C - 6, C - 6, 6, null, color(p.k), 2); }); }); g.globalAlpha = 1;
    p.m.forEach(function (r, ry) { r.forEach(function (v, cx) { if (v) cell(p.x + cx, p.y + ry, color(p.k)); }); });
    for (var i = flash.length - 1; i >= 0; i--) {
      var f = flash[i]; f.t += dt; if (f.t > 12) { flash.splice(i, 1); continue; }
      g.fillStyle = 'rgba(255,255,255,' + (1 - f.t / 12) + ')'; g.fillRect(0, f.y * C, cv.lw, C);
    }
  }
  function act(a) {
    if (state === 'ready' && a) run();
    if (state !== 'run') return;
    if (a === 'l') mv(-1); else if (a === 'r') mv(1); else if (a === 'u') rotate();
    else if (a === 'd') { drop(); score++; upd(); } else if (a === 'h') hard();
  }
  var K = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'u', w: 'u', ArrowDown: 'd', s: 'd', ' ': 'h' };
  addEventListener('keydown', function (e) {
    if (K[e.key]) { e.preventDefault(); act(K[e.key]); } else if (e.key === 'p' || e.key === 'P') pause();
  });
  [['bl', 'l'], ['br', 'r'], ['bd', 'd'], ['bu', 'u']].forEach(function (x) { $(x[0]).addEventListener('click', function () { act(x[1]); }); });
  $('start').addEventListener('click', function () { if (state === 'pause') run(); else if (state === 'over') { reset(); run(); } else run(); });
  $('pause').addEventListener('click', pause);
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
