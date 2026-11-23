(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), N = 9, M = 10, C = cv.lw / N;
  var cells, state, flags, start, tick, flagMode = false, first, cur = 40, kb = false;
  var NC = ['', '#2f7bff', '#1f9d4d', '#ff3f7a', '#7a4bff', '#ff7a1f', '#12a8a8', '#333', '#777'];
  var b = PP.best('mines'); $('bs').textContent = b ? b + 's' : '-';

  function show(t, p) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('ov').hidden = false; }
  function reset() {
    cells = []; for (var i = 0; i < N * N; i++) cells.push({ m: false, o: false, f: false, n: 0 });
    cur = 40; state = 'play'; flags = 0; first = true; clearInterval(tick); $('tm').textContent = 0; $('mn').textContent = M; $('ov').hidden = true; draw();
  }
  function nb(i) {
    var x = i % N, y = i / N | 0, r = [];
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; var nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < N && ny < N) r.push(ny * N + nx);
    } return r;
  }
  function plant(safe) {
    var ban = nb(safe).concat(safe), placed = 0;
    while (placed < M) { var i = Math.random() * N * N | 0; if (!cells[i].m && ban.indexOf(i) < 0) { cells[i].m = true; placed++; } }
    cells.forEach(function (c, i) { c.n = nb(i).filter(function (j) { return cells[j].m; }).length; });
    start = Date.now(); tick = setInterval(function () { $('tm').textContent = (Date.now() - start) / 1000 | 0; }, 250);
  }
  function open(i) {
    var c = cells[i]; if (c.o || c.f) return; c.o = true;
    if (c.m) return;
    if (!c.n) nb(i).forEach(open);
  }
  function click(i, flag) {
    if (state !== 'play') return; var c = cells[i];
    if (flag) {
      if (c.o) return; c.f = !c.f; flags += c.f ? 1 : -1; $('mn').textContent = M - flags; PP.sfx('flag'); draw(); return;
    }
    if (c.f) return;
    if (c.o) { // chord: open neighbours if flags match
      var fl = nb(i).filter(function (j) { return cells[j].f; }).length;
      if (c.n && fl === c.n) nb(i).forEach(function (j) { if (!cells[j].f) { open(j); if (cells[j].m) lose(); } });
    } else {
      if (first) { plant(i); first = false; }
      open(i); PP.sfx('blip'); if (c.m) lose();
    }
    if (state === 'play') winCheck(); draw();
  }
  function lose() {
    state = 'lost'; clearInterval(tick); cells.forEach(function (c) { if (c.m) c.o = true; }); PP.sfx('boom'); PP.say('Boom. You hit a mine. Press Enter to play again.'); PP.shake(10); cells.forEach(function (c, i) { if (c.m) PP.burst(i % N * C + C / 2, (i / N | 0) * C + C / 2, '#ff9442', 10, 5); }); show('Boom!', 'Press Enter or R to try again');
  }
  function winCheck() {
    if (cells.every(function (c) { return c.m || c.o; })) {
      state = 'won'; clearInterval(tick); var t = (Date.now() - start) / 1000 | 0; PP.sfx('win'); for (var q = 0; q < 6; q++) PP.burst(Math.random() * cv.lw, Math.random() * cv.lh, ['#ffd23f', '#ff4f8b', '#35e0ff', '#8cff5a'][q % 4], 16, 5);
      cells.forEach(function (c) { if (c.m) c.f = true; }); $('mn').textContent = 0;
      if (PP.setBest('mines', t, true)) $('bs').textContent = t + 's';
      PP.say('Cleared in ' + t + ' seconds.'); show('Cleared!', 'Time ' + t + 's. Press Enter to play again');
    }
  }
  var T = 0, reveal = {};
  function draw() { }
  function render(dt) {
    T += dt;
    g.clearRect(0, 0, cv.lw, cv.lh); g.textAlign = 'center'; g.textBaseline = 'middle';
    var night = PP.night();
    cells.forEach(function (c, i) {
      var x = i % N * C, y = (i / N | 0) * C;
      if (c.o) {
        if (reveal[i] === undefined) reveal[i] = 0; reveal[i] = Math.min(1, reveal[i] + dt / 7);
        PP.rr(g, x + 1.5, y + 1.5, C - 3, C - 3, 8, c.m ? '#ff4f8b' : (night ? '#1b1040' : '#fff3d4'));
        if (c.m) PP.props.mine(g, x + C / 2, y + C / 2);
        else if (c.n) { var sc = .4 + .6 * (1 - Math.pow(1 - reveal[i], 3)); g.font = '800 ' + (30 * sc).toFixed(0) + 'px ' + PP.font; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = night ? '#0a0618' : '#fff'; g.strokeText(c.n, x + C / 2, y + C / 2 + 2); g.fillStyle = NC[c.n]; g.fillText(c.n, x + C / 2, y + C / 2 + 2); }
        if (!c.m && reveal[i] < 1) { g.globalAlpha = 1 - reveal[i]; PP.rr(g, x + 1.5, y + 1.5, C - 3, C - 3, 8, '#ffd23f'); g.globalAlpha = 1; }
      } else {
        reveal[i] = undefined;
        PP.block(g, x + 1.5, y + 1.5, C - 3, C - 3, '#ffd23f', 8);
        if (c.f) PP.props.flag(g, x + C / 2, y + C / 2 + 2, ((T / 8 | 0) + i) % 3);
      }
    });
    if (kb) {
      var cx = cur % N * C, cy = (cur / N | 0) * C, pu = .6 + .4 * Math.sin(T / 6);
      PP.rr(g, cx + 1, cy + 1, C - 2, C - 2, 10, null, '#0a0618', 7); PP.rr(g, cx + 1, cy + 1, C - 2, C - 2, 10, null, '#ffffff', 4);
      g.globalAlpha = pu; PP.rr(g, cx + 5, cy + 5, C - 10, C - 10, 7, null, '#35e0ff', 3); g.globalAlpha = 1;
    }
  }
  function cellAt(e) {
    var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * N | 0, y = (e.clientY - r.top) / r.height * N | 0;
    return Math.max(0, Math.min(N - 1, y)) * N + Math.max(0, Math.min(N - 1, x));
  }
  var lp = null;
  cv.addEventListener('click', function (e) { if (lp) { lp = null; return; } click(cellAt(e), flagMode); });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); click(cellAt(e), true); });
  cv.addEventListener('touchstart', function (e) {
    var t = e.touches[0], i = cellAt(t); lp = null;
    var h = setTimeout(function () { lp = true; click(i, true); }, 450);
    cv.addEventListener('touchend', function () { clearTimeout(h); }, { once: true });
    cv.addEventListener('touchmove', function () { clearTimeout(h); }, { once: true, passive: true });
  }, { passive: true });
  function describe(i) {
    var c = cells[i], t = c.f ? 'flagged' : !c.o ? 'hidden' : c.m ? 'mine' : c.n ? c.n + ' nearby' : 'empty';
    return 'Row ' + ((i / N | 0) + 1) + ', column ' + (i % N + 1) + ', ' + t;
  }
  var MV = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, d = MV[k];
    if (d) {
      e.preventDefault(); kb = true; var x = Math.max(0, Math.min(N - 1, cur % N + d[0])), y = Math.max(0, Math.min(N - 1, (cur / N | 0) + d[1]));
      cur = y * N + x; PP.say(describe(cur)); return;
    }
    if (k === ' ' || k === 'Enter') {
      e.preventDefault(); if (e.repeat) return; kb = true;
      if (state !== 'play') reset(); else { click(cur, false); PP.say(describe(cur)); }
    } else if (k === 'f' || k === 'F') { kb = true; click(cur, true); PP.say(describe(cur)); }
  });
  cv.addEventListener('pointermove', function () { kb = false; });
  function setFlag(v) { flagMode = v; $('flag').textContent = 'Flag: ' + (v ? 'on' : 'off'); $('flag').setAttribute('aria-pressed', v); $('flag').classList.toggle('on', v); }
  $('flag').addEventListener('click', function () { setFlag(!flagMode); });
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
