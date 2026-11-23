(function () {
  var $ = function (i) { return document.getElementById(i); };
  var cv = PP.hd($('cv')), g = cv.getContext('2d'), N = 4, GAP = 10, S = (cv.lw - GAP * (N + 1)) / N;
  var cards, first, lock, moves, matched, start, tick, T = 0, started, cur = 0, kb = false;
  var ICONS = ['heart', 'star', 'moon', 'bolt', 'gem', 'smile', 'cherry', 'ghost'];
  var COLS = ['#ff4f8b', '#ffd23f', '#8a6bff', '#35e0ff', '#35a0ff', '#ff9442', '#ff4f5a', '#8cff5a'];
  var b = PP.best('memory'); $('bs').textContent = b ? b + 's' : '-';
  var ST = $('start'); if (ST) ST.style.display = 'none';

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.random() * (i + 1) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function reset() {
    var ids = []; for (var i = 0; i < 8; i++) ids.push(i, i); shuffle(ids);
    cards = ids.map(function (id) { return { id: id, flip: 0, up: false, done: false, shake: 0, glow: 0 }; });
    cur = 0; first = null; lock = false; moves = 0; matched = 0; started = false; clearInterval(tick);
    $('mv').textContent = 0; $('tm').textContent = 0; $('ov').hidden = true;
  }
  function px(i) { return GAP + (i % N) * (S + GAP); } function py(i) { return GAP + (i / N | 0) * (S + GAP); }
  function icon(k, x, y, s, col) { // smooth vector icons in a 100x100 box
    g.save(); g.translate(x, y); g.scale(s / 100, s / 100); g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = '#2a1a4a'; g.fillStyle = col; g.beginPath();
    if (k === 'heart') { g.moveTo(50, 88); g.bezierCurveTo(-10, 50, 10, 6, 50, 32); g.bezierCurveTo(90, 6, 110, 50, 50, 88); }
    else if (k === 'star') { for (var i = 0; i < 10; i++) { var r = i % 2 ? 22 : 48, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.closePath(); }
    else if (k === 'moon') { g.moveTo(62, 10); g.bezierCurveTo(24, 14, 14, 60, 42, 82); g.bezierCurveTo(60, 94, 82, 88, 90, 72); g.bezierCurveTo(60, 74, 46, 40, 62, 10); g.closePath(); }
    else if (k === 'bolt') { g.moveTo(58, 8); g.lineTo(22, 56); g.lineTo(46, 56); g.lineTo(38, 92); g.lineTo(78, 40); g.lineTo(54, 40); g.closePath(); }
    else if (k === 'gem') { g.moveTo(26, 22); g.lineTo(74, 22); g.lineTo(92, 42); g.lineTo(50, 90); g.lineTo(8, 42); g.closePath(); }
    else if (k === 'smile') { g.arc(50, 50, 40, 0, 6.2832); }
    else if (k === 'cherry') { g.arc(30, 72, 19, 0, 6.2832); g.moveTo(89, 68); g.arc(70, 68, 19, 0, 6.2832); }
    else { g.moveTo(14, 90); g.lineTo(14, 46); g.bezierCurveTo(14, 4, 86, 4, 86, 46); g.lineTo(86, 90); g.lineTo(71, 76); g.lineTo(57, 90); g.lineTo(43, 76); g.lineTo(29, 90); g.closePath(); }
    g.fill(); g.stroke();
    if (k === 'smile') { PP.circ(g, 36, 40, 6, '#2a1a4a'); PP.circ(g, 64, 40, 6, '#2a1a4a'); g.beginPath(); g.arc(50, 56, 20, .2, Math.PI - .2); g.stroke(); }
    else if (k === 'cherry') { g.beginPath(); g.moveTo(30, 52); g.quadraticCurveTo(46, 20, 64, 10); g.moveTo(70, 48); g.quadraticCurveTo(70, 24, 64, 10); g.stroke(); PP.ell(g, 78, 14, 14, 7, '#6fe048'); }
    else if (k === 'ghost') { PP.circ(g, 36, 46, 8, '#fff'); PP.circ(g, 64, 46, 8, '#fff'); PP.circ(g, 38, 48, 4, '#2a1a4a'); PP.circ(g, 66, 48, 4, '#2a1a4a'); }
    else if (k === 'gem') { g.lineWidth = 4; g.beginPath(); g.moveTo(26, 22); g.lineTo(38, 42); g.lineTo(62, 42); g.lineTo(74, 22); g.moveTo(8, 42); g.lineTo(92, 42); g.moveTo(38, 42); g.lineTo(50, 90); g.moveTo(62, 42); g.lineTo(50, 90); g.stroke(); }
    g.restore();
  }
  function render(dt) {
    T += dt; g.fillStyle = PP.night() ? '#2f1d5c' : '#fff0c8'; g.fillRect(0, 0, cv.lw, cv.lh);
    cards.forEach(function (c, i) {
      var target = c.up || c.done ? 1 : 0; c.flip += (target - c.flip) * Math.min(1, .22 * dt);
      var sx = Math.abs(Math.cos(c.flip * Math.PI)), face = c.flip > .5, x = px(i), y = py(i) - (c.done ? Math.abs(Math.sin(c.glow)) * 3 : 0);
      if (c.done) c.glow += .08 * dt; if (c.shake > 0) { c.shake -= dt; x += Math.sin(c.shake * 2) * 4; }
      var w = Math.max(6, S * sx), ox = x + (S - w) / 2, lift = Math.sin(c.flip * Math.PI) * 6;
      PP.ell(g, x + S / 2, y + S + 2, w / 2, 4, 'rgba(0,0,0,.2)');
      if (face) {
        PP.block(g, ox, y - lift, w, S, c.done ? PP.mix(COLS[c.id], .55) : '#fff4d6', 16);
        if (sx > .55) { g.save(); g.translate(x + S / 2, 0); g.scale(sx, 1); g.translate(-(x + S / 2), 0); icon(ICONS[c.id], x + S * .17, y - lift + S * .17, S * .66, COLS[c.id]); g.restore(); }
      } else {
        PP.block(g, ox, y - lift, w, S, '#8a6bff', 16);
        if (sx > .55) { g.fillStyle = 'rgba(255,255,255,.2)'; PP.circ(g, x + S * .25, y + S * .25 - lift, 6, g.fillStyle); PP.circ(g, x + S * .75, y + S * .75 - lift, 6, g.fillStyle); g.fillStyle = '#ffd23f'; g.font = '800 38px ' + PP.font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x + S / 2, y - lift + S / 2 + 2); }
      }
    });
    if (kb) {
      var cx = px(cur), cy = py(cur), pu = .6 + .4 * Math.sin(T / 6);
      PP.rr(g, cx - 5, cy - 5, S + 10, S + 10, 20, null, '#0a0618', 8); PP.rr(g, cx - 5, cy - 5, S + 10, S + 10, 20, null, '#ffffff', 5);
      g.globalAlpha = pu; PP.rr(g, cx - 1, cy - 1, S + 2, S + 2, 16, null, '#ffd23f', 3); g.globalAlpha = 1;
    }
  }
  function click(i) {
    var c = cards[i]; if (lock || c.up || c.done) return;
    if (!started) { started = true; start = Date.now(); tick = setInterval(function () { $('tm').textContent = (Date.now() - start) / 1000 | 0; }, 250); }
    c.up = true; PP.sfx('flip'); PP.say('Card ' + (i + 1) + ': ' + ICONS[c.id]);
    if (first === null) { first = i; return; }
    moves++; $('mv').textContent = moves; var a = cards[first], bi = first; first = null;
    if (a.id === c.id) {
      setTimeout(function () {
        a.done = c.done = true; a.up = c.up = false; matched++; PP.sfx('coin'); PP.say('Match. ' + ICONS[c.id]);
        PP.burst(px(bi) + S / 2, py(bi) + S / 2, COLS[c.id], 14, 4); PP.burst(px(i) + S / 2, py(i) + S / 2, COLS[c.id], 14, 4); PP.pop('Match!', cv.lw / 2, cv.lh / 2);
        if (matched === 8) win();
      }, 350);
    } else {
      lock = true; PP.say('No match'); setTimeout(function () { a.shake = c.shake = 14; PP.sfx('hit'); }, 300);
      setTimeout(function () { a.up = c.up = false; lock = false; }, 800);
    }
  }
  function win() {
    clearInterval(tick); var t = (Date.now() - start) / 1000 | 0; PP.sfx('win');
    for (var q = 0; q < 6; q++) PP.burst(Math.random() * cv.lw, Math.random() * cv.lh, COLS[q], 16, 5);
    if (PP.setBest('memory', t, true)) $('bs').textContent = t + 's';
    $('ov-t').textContent = 'You win!'; $('ov-p').textContent = moves + ' moves in ' + t + 's. Press Enter to play again'; PP.say('You win. ' + moves + ' moves in ' + t + ' seconds.'); $('ov').hidden = false;
  }
  cv.addEventListener('pointerdown', function (e) {
    var r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * cv.lw, my = (e.clientY - r.top) / r.height * cv.lh;
    for (var i = 0; i < cards.length; i++) if (mx >= px(i) && mx <= px(i) + S && my >= py(i) && my <= py(i) + S) { click(i); break; }
  });
  var MV = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  function describe(i) { var c = cards[i]; return 'Card ' + (i + 1) + ', row ' + ((i / N | 0) + 1) + ', column ' + (i % N + 1) + ', ' + (c.up || c.done ? ICONS[c.id] : 'face down'); }
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var d = MV[e.key];
    if (d) { e.preventDefault(); kb = true; var x = Math.max(0, Math.min(N - 1, cur % N + d[0])), y = Math.max(0, Math.min(N - 1, (cur / N | 0) + d[1])); cur = y * N + x; PP.say(describe(cur)); return; }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (e.repeat) return; kb = true; if (matched === 8) reset(); else click(cur); }
  });
  cv.addEventListener('pointermove', function () { kb = false; });
  $('again').addEventListener('click', reset);
  reset(); PP.run(cv, g, render);
})();
