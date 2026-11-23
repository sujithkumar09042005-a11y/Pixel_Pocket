(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), N = 4, GAP = 10, S = (cv.lw - GAP * (N + 1)) / N;
  var grid, score, over, won, pulse = {};
  var COL = { 2: '#ffe9b8', 4: '#ffd23f', 8: '#ff9442', 16: '#ff6a5a', 32: '#ff4f8b', 64: '#d44fff', 128: '#8a6bff', 256: '#35a0ff', 512: '#35e0ff', 1024: '#5af0b0', 2048: '#8cff5a' };
  $('bs').textContent = PP.best('2048');
  $('start') && ($('start').style.display = 'none');

  function reset() {
    grid = []; for (var i = 0; i < N; i++) grid.push([0, 0, 0, 0]);
    score = 0; over = false; won = false; $('sc').textContent = 0; $('ov').hidden = true; add(); add(); draw();
  }
  function add() {
    var e = []; grid.forEach(function (r, y) { r.forEach(function (v, x) { if (!v) e.push([x, y]); }); });
    if (!e.length) return; var c = e[Math.random() * e.length | 0]; grid[c[1]][c[0]] = Math.random() < .9 ? 2 : 4; spawn = { key: c[0] + ',' + c[1], t: 0 };
  }
  function slideRow(r) {
    var a = r.filter(Boolean), out = [], gain = 0;
    for (var i = 0; i < a.length; i++) {
      if (a[i] === a[i + 1]) { out.push(a[i] * 2); gain += a[i] * 2; i++; } else out.push(a[i]);
    }
    while (out.length < N) out.push(0); return { row: out, gain: gain };
  }
  function move(d) { // 0 left 1 up 2 right 3 down
    if (over) return;
    var moved = false, gained = 0, ng = grid.map(function (r) { return r.slice(); });
    for (var i = 0; i < N; i++) {
      var line = [];
      for (var j = 0; j < N; j++) line.push(d === 0 ? ng[i][j] : d === 2 ? ng[i][N - 1 - j] : d === 1 ? ng[j][i] : ng[N - 1 - j][i]);
      var res = slideRow(line); gained += res.gain;
      for (j = 0; j < N; j++) {
        var v = res.row[j];
        if (d === 0) ng[i][j] = v; else if (d === 2) ng[i][N - 1 - j] = v; else if (d === 1) ng[j][i] = v; else ng[N - 1 - j][i] = v;
      }
    }
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) if (ng[i][j] !== grid[i][j]) moved = true;
    if (!moved) return;
    var old = grid; grid = ng; score += gained;
    for (i = 0; i < N; i++) for (j = 0; j < N; j++) if (grid[i][j] && grid[i][j] !== old[i][j] && grid[i][j] > 2 && (gained)) { var cx = GAP + j * (S + GAP) + S / 2, cy = GAP + i * (S + GAP) + S / 2; if (!pulse[j + ',' + i]) { pulse[j + ',' + i] = 1; PP.burst(cx, cy, COL[grid[i][j]] || '#fff', 6, 3); } }
    if (gained) { PP.pop('+' + gained, cv.lw / 2, 24); PP.shake(Math.min(5, gained / 64 + 1)); } PP.sfx(gained ? 'clear' : 'blip'); add();
    $('sc').textContent = score; if (PP.setBest('2048', score)) $('bs').textContent = score;
    draw(); check();
  }
  function can() {
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (!grid[y][x]) return true;
      if (x < N - 1 && grid[y][x] === grid[y][x + 1]) return true;
      if (y < N - 1 && grid[y][x] === grid[y + 1][x]) return true;
    } return false;
  }
  function check() {
    var has = grid.some(function (r) { return r.indexOf(2048) >= 0; });
    if (has && !won) { won = true; PP.sfx('win'); banner('You made 2048!', 'Keep going or start over'); }
    else if (!can()) { over = true; PP.sfx('lose'); PP.say('No moves left. Score ' + score); banner('No moves left', 'Score ' + score + '. Press Enter or R'); }
  }
  function banner(t, p) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('ov').hidden = false; if (!over) setTimeout(function () { $('ov').hidden = true; }, 1800); }
  function draw() { }
  var T = 0, spawn = null;
  function render(dt) {
    T += dt;
    g.fillStyle = PP.night() ? '#2f1d5c' : '#fff0c8'; g.fillRect(0, 0, cv.lw, cv.lh);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) { var qx = GAP + x * (S + GAP), qy = GAP + y * (S + GAP); PP.rr(g, qx, qy, S, S, 14, PP.night() ? '#120a2b' : '#ffe0a0'); }
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var v = grid[y][x]; if (!v) continue; var px = GAP + x * (S + GAP), py = GAP + y * (S + GAP);
      var k = 1, key = x + ',' + y;
      if (spawn && spawn.key === key) { spawn.t += dt; k = Math.min(1, spawn.t / 8); k = 1 - Math.pow(1 - k, 3); if (spawn.t >= 8) spawn = null; }
      if (pulse[key]) { pulse[key] += dt; var q = pulse[key] / 10; if (q >= 1) delete pulse[key]; else k = 1 + Math.sin(q * Math.PI) * .16; }
      var w = S * k, o = (S - w) / 2;
      PP.block(g, px + o, py + o, w, w, COL[v] || '#ffffff', 14);
      var fs = (v < 100 ? 44 : v < 1000 ? 36 : 28) * k;
      g.font = '800 ' + fs.toFixed(0) + 'px ' + PP.font; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.55)'; g.strokeText(v, px + S / 2, py + S / 2 + 2); g.fillStyle = '#2a1a4a'; g.fillText(v, px + S / 2, py + S / 2 + 2);
    }
  }
  var keys = { ArrowLeft: 0, a: 0, ArrowUp: 1, w: 1, ArrowRight: 2, d: 2, ArrowDown: 3, s: 3 };
  addEventListener('keydown', function (e) { if (e.ctrlKey || e.metaKey || e.altKey) return; if (e.key in keys) { e.preventDefault(); move(keys[e.key]); } else if (over && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); reset(); } });
  document.querySelectorAll('.pad .btn').forEach(function (b) { b.addEventListener('click', function () { move(keys[b.dataset.k]); }); });
  var tx, ty;
  cv.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 0) : (dy > 0 ? 3 : 1));
  }, { passive: true });
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
