// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), W = cv.lw, N = 3, CS = W / N;
  var holes, score, left, state, T = 0, spawnT, last, combo, hammer = { x: -50, y: -50, t: 99 }, tick;
  $('bs').textContent = PP.best('whack');

  function show(t, p, b) { $('ov-t').textContent = t; $('ov-p').textContent = p; $('start').textContent = b; $('ov').hidden = false; }
  function reset() {
    holes = []; for (var i = 0; i < 9; i++) holes.push({ h: 0, k: null, t: 0, stay: 0, hit: 0 });
    score = 0; left = 30; combo = 0; spawnT = 40; state = 'ready'; clearInterval(tick); $('sc').textContent = 0; $('tm').textContent = 30;
    show('Whack-a-Mole', '30 seconds. Go!', 'Start');
  }
  function begin() {
    state = 'run'; $('ov').hidden = true; clearInterval(tick);
    tick = setInterval(function () { if (state !== 'run') return; left--; $('tm').textContent = left; if (left <= 0) end(); }, 1000);
  }
  function end() {
    clearInterval(tick); state = 'over'; PP.sfx('win'); if (PP.setBest('whack', score)) $('bs').textContent = score;
    show("Time's up!", 'Score ' + score, 'Again');
  }
  function update(dt) {
    spawnT -= dt;
    if (spawnT <= 0) {
      var free = []; holes.forEach(function (h, i) { if (h.k === null) free.push(i); });
      if (free.length) {
        var h = holes[free[Math.random() * free.length | 0]], pace = 1 - (30 - left) / 60;
        h.k = Math.random() < .18 ? 'bomb' : (Math.random() < .12 ? 'gold' : 'mole'); h.t = 0; h.stay = (60 + Math.random() * 40) * pace; h.hit = 0;
      }
      spawnT = (28 + Math.random() * 26) * (1 - (30 - left) / 70);
    }
    holes.forEach(function (h) {
      if (h.k === null) return; h.t += dt;
      if (h.hit) { h.hit += dt; if (h.hit > 14) h.k = null; return; }
      if (h.t > h.stay + 14) { if (h.k === 'mole' || h.k === 'gold') combo = 0; h.k = null; }
    });
  }
  function popAmt(h) { if (h.hit) return Math.max(0, 1 - h.hit / 14); var a = h.t < 8 ? h.t / 8 : (h.t > h.stay ? Math.max(0, 1 - (h.t - h.stay) / 14) : 1); return a; }
  function render(dt) {
    T += dt; if (state === 'run') update(dt); hammer.t += dt;
    var n = PP.night(), gr = g.createLinearGradient(0, 0, 0, W); gr.addColorStop(0, n ? '#2b6a2f' : '#9be66b'); gr.addColorStop(1, n ? '#1f5a2a' : '#6fd058'); g.fillStyle = gr; g.fillRect(0, 0, W, W);
    g.fillStyle = n ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.14)'; for (var gy = 0; gy < W; gy += 30) for (var gx = (gy / 30 % 2) * 30; gx < W; gx += 60) g.fillRect(gx, gy, 30, 30);
    holes.forEach(function (h, i) {
      var cx = (i % N) * CS + CS / 2, cy = ((i / N | 0) * CS) + CS / 2 + 22, p = h.k ? popAmt(h) : 0;
      PP.props.moundBack(g, cx, cy);
      g.save(); g.beginPath(); g.rect(cx - 62, cy - 110, 124, 110 + 2); g.clip();
      if (h.k) {
        var y = cy - 4 - p * 54, sq = h.hit ? 1 - Math.min(1, h.hit / 14) * .25 : 1;
        if (h.k === 'bomb') PP.props.bomb(g, cx, y, T); else PP.chars.mole(g, cx, y, { gold: h.k === 'gold', hit: h.hit, sq: sq, T: T });
      }
      g.restore();
      PP.props.moundFront(g, cx, cy);
    });
    if (hammer.t < 12) { var q = Math.min(1, hammer.t / 8); g.save(); g.translate(hammer.x + 6, hammer.y + 8); g.rotate(-.9 + q * 1.1); g.globalAlpha = 1 - hammer.t / 14; PP.props.hammer(g); g.restore(); g.globalAlpha = 1; }
  }
  function whack(e) {
    if (state !== 'run') return;
    var r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * W, my = (e.clientY - r.top) / r.height * W;
    hammer = { x: mx, y: my, t: 0 };
    for (var i = 0; i < 9; i++) {
      var h = holes[i]; if (!h.k || h.hit) continue; var cx = (i % N) * CS + CS / 2, cy = ((i / N | 0) * CS) + CS / 2 + 22;
      if (Math.abs(mx - cx) < 46 && my > cy - 70 && my < cy + 14 && popAmt(h) > .35) {
        h.hit = 1;
        if (h.k === 'bomb') { score = Math.max(0, score - 5); left = Math.max(1, left - 3); $('tm').textContent = left; combo = 0; PP.sfx('boom'); PP.shake(10); PP.burst(cx, cy - 20, '#ff9442', 24, 6); PP.pop('-5 -3s', cx, cy - 60, '#ff4f5a'); }
        else { combo++; var pts = (h.k === 'gold' ? 5 : 1) * (1 + Math.min(4, combo / 3 | 0)); score += pts; PP.sfx('whack'); PP.burst(cx, cy - 20, h.k === 'gold' ? '#ffd23f' : '#b5733a', 12, 4); PP.pop('+' + pts + (combo >= 3 ? ' x' + (1 + Math.min(4, combo / 3 | 0)) : ''), cx, cy - 60); PP.shake(2); }
        $('sc').textContent = score; if (PP.setBest('whack', score)) $('bs').textContent = score; return;
      }
    }
    combo = 0;
  }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); whack(e); });
  $('start').addEventListener('click', function () { if (state === 'over') reset(); begin(); });
  $('again').addEventListener('click', function () { reset(); });
  reset(); PP.run(cv, g, render);
})();
