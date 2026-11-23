(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), N = 20, C = cv.lw / N;
  var snake, prev, stepAt = 0, curInt = 100, dir, next, food, score, timer, state; // state: ready, run, pause, over
  $('bs').textContent = PP.best('snake');

  function show(t, p, btn) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').style.display = btn ? '' : 'none'; $('ov').hidden = false; }
  function reset() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; dir = next = { x: 1, y: 0 };
    score = 0; $('sc').textContent = 0; prev = snake.map(function (q) { return { x: q.x, y: q.y }; }); placeFood(); state = 'ready'; clearInterval(timer); draw();
    show('Snake', 'Arrows, WASD or swipe to go', true); $('start').textContent = 'Start';
  }
  function placeFood() {
    do { food = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; }
    while (snake.some(function (s) { return s.x === food.x && s.y === food.y; }));
  }
  function run() { state = 'run'; $('ov').hidden = true; clearInterval(timer); curInt = Math.max(55, 120 - score * 2); timer = setInterval(step, curInt); }
  function turn(x, y) {
    if (x === -dir.x && y === -dir.y) return;
    next = { x: x, y: y }; if (state === 'ready') run();
  }
  function step() {
    prev = snake.map(function (q) { return { x: q.x, y: q.y }; }); stepAt = performance.now();
    dir = next; var h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some(function (s) { return s.x === h.x && s.y === h.y; })) return over();
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      score++; $('sc').textContent = score; PP.sfx('eat'); PP.burst(food.x * C + C / 2, food.y * C + C / 2, '#ff4f8b', 14, 4); PP.pop('+1', food.x * C + C / 2, food.y * C); placeFood(); run();
    } else snake.pop();
    draw();
  }
  function over() {
    clearInterval(timer); state = 'over'; PP.sfx('lose'); PP.shake(8); PP.burst(snake[0].x * C + C / 2, snake[0].y * C + C / 2, '#35e0ff', 24, 5);
    if (PP.setBest('snake', score)) $('bs').textContent = score;
    show('Game over', 'Score ' + score, true); $('start').textContent = 'Again';
  }
  function pause() {
    if (state === 'run') { clearInterval(timer); state = 'pause'; show('Paused', 'Press P to continue', true); $('start').textContent = 'Resume'; }
    else if (state === 'pause') run();
  }
  function draw() { }
  var T = 0, SW = C * .92;
  function render(dt) {
    T += dt;
    var n = PP.night(), bg = n ? '#120a2b' : '#fff8e6', bg2 = n ? '#1b1040' : '#ffeec2';
    g.fillStyle = bg; g.fillRect(0, 0, cv.lw, cv.lh);
    g.fillStyle = bg2; for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) if ((i + j) % 2) g.fillRect(i * C, j * C, C, C);
    var bob = Math.sin(T / 8) * 2, fx = food.x * C + C / 2, fy = food.y * C + C / 2 + bob;
    PP.ell(g, fx, food.y * C + C - 4, 8, 3, 'rgba(0,0,0,.28)'); PP.chars.apple(g, fx, fy);
    var t = state === 'run' ? Math.min(1, (performance.now() - stepAt) / curInt) : 1, np = snake.length, pts = [];
    for (var k = 0; k < np; k++) { var f = prev[Math.min(k, prev.length - 1)], q = snake[k]; pts.push({ x: (f.x + (q.x - f.x) * t) * C + C / 2, y: (f.y + (q.y - f.y) * t) * C + C / 2, w: SW * (.62 + .38 * Math.min(1, (np - 1 - k) / 4)) }); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    PP.ell(g, pts[0].x, pts[0].y + 6, 14, 8, 'rgba(0,0,0,.2)');
    for (k = np - 1; k >= 1; k--) { g.strokeStyle = 'rgba(10,6,24,.7)'; g.lineWidth = pts[k].w + 4; g.beginPath(); g.moveTo(pts[k].x, pts[k].y); g.lineTo(pts[k - 1].x, pts[k - 1].y); g.stroke(); }
    for (k = np - 1; k >= 1; k--) { g.strokeStyle = k % 2 ? '#3fcf5a' : '#4ddc62'; g.lineWidth = pts[k].w; g.beginPath(); g.moveTo(pts[k].x, pts[k].y); g.lineTo(pts[k - 1].x, pts[k - 1].y); g.stroke(); }
    for (k = np - 1; k >= 1; k--) { g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = pts[k].w * .3; g.beginPath(); g.moveTo(pts[k].x - 2, pts[k].y - pts[k].w * .22); g.lineTo(pts[k - 1].x - 2, pts[k - 1].y - pts[k - 1].w * .22); g.stroke(); }
    for (k = 2; k < np; k += 2) PP.circ(g, pts[k].x, pts[k].y, pts[k].w * .2, 'rgba(10,60,30,.35)');
    var hd = pts[0], ang = Math.atan2(dir.y, dir.x);
    g.save(); g.translate(hd.x, hd.y); g.rotate(ang); PP.chars.snakeHead(g, (T | 0) % 70 < 18); g.restore();
  }
  var keys = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  addEventListener('keydown', function (e) {
    var k = keys[e.key]; if (k) { e.preventDefault(); turn(k[0], k[1]); }
    else if (e.key === 'p' || e.key === 'P') pause();
  });
  document.querySelectorAll('.pad .btn').forEach(function (b) {
    b.addEventListener('click', function () { var k = keys[b.dataset.k]; turn(k[0], k[1]); });
  });
  var tx, ty;
  cv.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0); else turn(0, dy > 0 ? 1 : -1);
  }, { passive: true });
  $('start').addEventListener('click', function () { if (state === 'pause') run(); else if (state === 'over') { reset(); run(); } else run(); });
  $('pause').addEventListener('click', pause);
  $('again').addEventListener('click', function () { reset(); });
  reset(); PP.run(cv, g, render);
})();
