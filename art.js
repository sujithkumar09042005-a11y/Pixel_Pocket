// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// Hub cartridge thumbnails: the same characters used inside the games, drawn on a 96x96 canvas.
(function () {
  var P = window.PP, R = P.rr, C = P.circ, E = P.ell, B = P.block;
  function glow(g, x, y, r, col) { var q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, col); q.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); }
  function txt(g, t, x, y, s, col) { g.font = '800 ' + s + 'px ' + P.font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.6)'; g.strokeText(t, x, y); g.fillStyle = col || '#2a1a4a'; g.fillText(t, x, y); }

  var art = {
    snake: function (g) {
      g.lineCap = 'round'; g.lineJoin = 'round'; var pts = [[12, 78], [26, 82], [42, 74], [52, 58], [62, 46]];
      for (var pass = 0; pass < 3; pass++) for (var i = pts.length - 1; i > 0; i--) {
        g.strokeStyle = pass === 0 ? 'rgba(10,6,24,.7)' : pass === 1 ? (i % 2 ? '#3fcf5a' : '#4ddc62') : 'rgba(255,255,255,.28)';
        g.lineWidth = (pass === 0 ? 4 : 0) + 10 + i * 2.2 - (pass === 2 ? 6 + i * 1.3 : 0);
        g.beginPath(); g.moveTo(pts[i][0], pts[i][1] - (pass === 2 ? 3 : 0)); g.lineTo(pts[i - 1][0], pts[i - 1][1] - (pass === 2 ? 3 : 0)); g.stroke();
      }
      g.save(); g.translate(68, 38); g.rotate(-.9); g.scale(1.1, 1.1); P.chars.snakeHead(g, true); g.restore();
      E(g, 22, 42, 11, 3.5, 'rgba(0,0,0,.3)'); g.save(); g.translate(22, 34); g.scale(1.25, 1.25); P.chars.apple(g, 0, 0); g.restore();
    },
    blocks: function (g) {
      [['#35e0ff', 6, 70], ['#35e0ff', 26, 70], ['#d44fff', 46, 70], ['#ff9442', 66, 70], ['#ffd23f', 66, 50], ['#ffd23f', 46, 50], ['#8cff5a', 26, 30], ['#8cff5a', 46, 30], ['#8cff5a', 46, 10], ['#8cff5a', 66, 10]].forEach(function (q) { B(g, q[1], q[2], 20, 20, q[0], 6); });
      g.globalAlpha = .4; R(g, 7, 51, 18, 18, 6, null, '#35e0ff', 2); g.globalAlpha = 1;
    },
    '2048': function (g) {
      [['#ffe9b8', 6, 6, '2'], ['#ffd23f', 50, 6, '4'], ['#ff9442', 6, 50, '8'], ['#ff4f8b', 50, 50, '16']].forEach(function (q) { B(g, q[1], q[2], 40, 40, q[0], 11); txt(g, q[3], q[1] + 20, q[2] + 21, q[3].length > 1 ? 22 : 26); });
    },
    breakout: function (g) {
      ['#ff4f5a', '#ff9442', '#ffd23f', '#8cff5a'].forEach(function (c, r) { for (var i = 0; i < 4; i++) B(g, 4 + i * 22, 6 + r * 14, 21, 12, c, 5); });
      for (var i = 0; i < 6; i++) C(g, 70 - i * 3, 52 + i * 3.5, 1.5 + i * .5, 'rgba(255,210,63,' + i * .09 + ')');
      P.orb(g, 74, 48, 7, '#ffd23f'); E(g, 40, 90, 28, 4, 'rgba(0,0,0,.3)'); B(g, 14, 76, 52, 13, '#fff4d6', 6); C(g, 24, 82.5, 3, '#ff4f8b'); C(g, 56, 82.5, 3, '#ff4f8b');
    },
    mines: function (g) {
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) { if (r === 1 && c === 1) R(g, 8 + c * 27, 8 + r * 27, 25, 25, 7, '#2a1a58'); else B(g, 8 + c * 27, 8 + r * 27, 25, 25, '#ffd23f', 7); }
      P.props.mine(g, 48, 48); txt(g, '1', 21, 21, 20, '#2f7bff'); P.props.flag(g, 75, 74, 0);
    },
    flappy: function (g) {
      P.props.pipe(g, 66, 0, 30, true, 60); P.props.pipe(g, 66, 68, 120, false, 60);
      g.save(); g.translate(38, 50); g.rotate(-.22); g.scale(1.2, 1.2); P.chars.bird(g, .6); g.restore();
    },
    invaders: function (g) {
      for (var i = 0; i < 12; i++) C(g, (i * 37 + 9) % 94 + 1, (i * 53 + 7) % 50 + 2, .9 + (i % 3) * .4, 'rgba(255,255,255,.7)');
      g.save(); g.translate(6, 2); g.scale(1.5, 1.5); P.chars.alien(g, 2, 0, 0); g.restore();
      g.save(); g.translate(58, 52); g.scale(.78, .78); P.chars.ship(g); g.restore(); P.props.laser(g, 34, 74);
    },
    runner: function (g) {
      R(g, 0, 88, 96, 10, 5, '#6fe048'); P.props.cactus(g, 76, 88, 34, 0);
      g.save(); g.translate(0, 0); g.scale(.78, .78); P.chars.kid(g, 34, 112, { air: false, ph: 1.1, duck: false, T: 0 }); g.restore();
      P.props.flyer(g, 70, 16, 1);
    },
    memory: function (g) {
      B(g, 6, 8, 40, 38, '#fff4d6', 13); B(g, 50, 8, 40, 38, '#8a6bff', 13); B(g, 6, 50, 40, 38, '#8a6bff', 13); B(g, 50, 50, 40, 38, '#fff4d6', 13);
      g.save(); g.translate(14, 14); g.scale(.26, .26); g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = '#2a1a4a'; g.fillStyle = '#ff4f8b'; g.beginPath(); g.moveTo(50, 88); g.bezierCurveTo(-10, 50, 10, 6, 50, 32); g.bezierCurveTo(90, 6, 110, 50, 50, 88); g.fill(); g.stroke(); g.restore();
      g.save(); g.translate(58, 56); g.scale(.26, .26); g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = '#2a1a4a'; g.fillStyle = '#ffd23f'; g.beginPath(); for (var i = 0; i < 10; i++) { var r = i % 2 ? 22 : 48, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore();
      txt(g, '?', 70, 28, 28, '#ffd23f'); txt(g, '?', 26, 70, 28, '#ffd23f');
    },
    whack: function (g) {
      P.props.moundBack(g, 48, 70);
      g.save(); g.beginPath(); g.rect(0, 0, 96, 76); g.clip(); g.translate(0, 2); g.scale(.92, .92); g.translate(4, 0); P.chars.mole(g, 48, 20, { gold: false, T: 0 }); g.restore();
      P.props.moundFront(g, 48, 68);
      g.save(); g.translate(80, 12); g.rotate(.55); g.scale(.55, .55); P.props.hammer(g); g.restore();
    }
  };
  document.querySelectorAll('.cart').forEach(function (a) {
    var k = a.dataset.g, cv = a.querySelector('canvas'); cv.width = 96 * P.S; cv.height = 96 * P.S;
    var g = cv.getContext('2d'); g.scale(P.S, P.S); art[k](g);
    var b = P.best(k); if (b) a.querySelector('b').textContent = (k === 'mines' || k === 'memory') ? b + 's' : b;
  });
  window.PP_ART = art;
})();
