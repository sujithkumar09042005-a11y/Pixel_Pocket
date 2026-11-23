// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// Detailed characters and props shared by the games and the hub thumbnails (PP.chars, PP.props)
(function () {
  var P = window.PP, mix = P.mix, R = P.rr, C = P.circ, E = P.ell;
  var RC = ['#ff4f8b', '#ff9442', '#ffd23f', '#8cff5a', '#35e0ff', '#d44fff'];
  var HURT = ['#ffc2d9', '#ffd9b8', '#e6ffc9', '#fff0b0', '#c8f6ff', '#f0c8ff'];
  var K = 'rgba(10,6,24,.65)';

  // outlined, highlighted polyline stroke (arms, tails, branches)
  function poly(c, pts, w, col) {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); });
    c.strokeStyle = K; c.lineWidth = w + 3; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
    c.save(); c.translate(-w * .18, -w * .18); c.strokeStyle = mix(col, .42); c.lineWidth = Math.max(1, w * .24); c.stroke(); c.restore();
  }
  function hgrad(c, x0, x1, stops) { var g = c.createLinearGradient(x0, 0, x1, 0); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function flower(c, x, y, r, col) {
    for (var i = 0; i < 6; i++) { var a = i * 1.0472; P.part(c, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, r * .62, r * .62, col, 0, true); }
    C(c, x, y, r * .55, '#ffd23f', 'rgba(10,6,24,.4)', 1);
  }
  function tuft(c, x, y, col) { c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - 6); c.moveTo(x, y); c.lineTo(x, y - 8); c.moveTo(x, y); c.lineTo(x + 3, y - 6); c.stroke(); }

  var props = {};
  // ---------- cactus: saguaro (kind 0) or flowering barrel (kind 1) ----------
  props.cactus = function (g, x, base, h, kind) {
    var im = P.sprite('cac' + kind + '_' + h, 52, h + 20, function (c, W, H) {
      var bs = H - 4, top = 18, cx = 26, i;
      E(c, cx, bs + 1, 20, 4.5, 'rgba(0,0,0,.32)'); E(c, cx - 14, bs, 5, 2.4, '#c9a06a'); E(c, cx + 15, bs - .5, 4, 2, '#b88a54'); E(c, cx + 9, bs + .5, 2.4, 1.4, '#e0bd8a');
      if (kind === 0) {
        var ay = top + (bs - top) * .4, by2 = top + (bs - top) * .62;
        poly(c, [[cx - 6, by2], [cx - 17, by2], [cx - 17, by2 - 17]], 9, '#2fae62');
        poly(c, [[cx + 6, ay], [cx + 17, ay], [cx + 17, ay - 15]], 9, '#2fae62');
        [[cx - 17, by2 - 19, 3], [cx + 17, ay - 17, 3.2]].forEach(function (q) { for (var s = 0; s < 3; s++) { c.strokeStyle = 'rgba(255,248,200,.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(q[0] + (s - 1) * 2, q[1] + 3); c.lineTo(q[0] + (s - 1) * 3, q[1] - 1); c.stroke(); } });
        c.beginPath(); c.moveTo(cx - 8, bs); c.lineTo(cx - 8, top + 8); c.arc(cx, top + 8, 8, Math.PI, 0); c.lineTo(cx + 8, bs); c.closePath();
        c.fillStyle = hgrad(c, cx - 8, cx + 8, [[0, '#1b7a47'], [.28, '#34b86a'], [.42, '#86e89c'], [.62, '#3cc472'], [1, '#17703f']]); c.fill();
        c.lineWidth = 1.8; c.strokeStyle = K; c.stroke();
        c.strokeStyle = 'rgba(8,60,30,.42)'; c.lineWidth = 1.2;
        [-4, 0, 4].forEach(function (rx) { c.beginPath(); c.moveTo(cx + rx * 1.4, top + 4 + Math.abs(rx) * .5); c.lineTo(cx + rx * 1.4, bs - 2); c.stroke(); });
        for (var yy = top + 14; yy < bs - 4; yy += 9) [-5.5, -1.5, 2.5, 6].forEach(function (rx, j) { c.strokeStyle = 'rgba(255,248,200,.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx + rx, yy + (j % 2) * 4 + 2); c.lineTo(cx + rx + (rx < 0 ? -2.4 : 2.4), yy + (j % 2) * 4); c.stroke(); });
        flower(c, cx, top + 1, 4.2, '#ff6fa5'); flower(c, cx - 17, by2 - 19, 2.8, '#ff9fc0');
      } else {
        var mid = (top + bs) / 2, ry = (bs - top) / 2 + 2;
        c.beginPath(); c.ellipse(cx, mid + 2, 19, ry, 0, 0, 6.2832);
        c.fillStyle = hgrad(c, cx - 19, cx + 19, [[0, '#17703f'], [.25, '#2fae62'], [.4, '#7be08f'], [.6, '#38b86a'], [1, '#146a3a']]); c.fill(); c.lineWidth = 1.8; c.strokeStyle = K; c.stroke();
        c.strokeStyle = 'rgba(8,60,30,.45)'; c.lineWidth = 1.3;
        [-2, -1, 0, 1, 2].forEach(function (k) { c.beginPath(); c.moveTo(cx, mid + 2 - ry + 1); c.quadraticCurveTo(cx + k * 12, mid + 2, cx, mid + 2 + ry - 1); c.stroke(); });
        [-2, -1, 0, 1, 2].forEach(function (k) { for (var t = .25; t < .8; t += .22) { var yy = mid + 2 - ry + 2 * ry * t, xx = cx + k * 12 * Math.sin(t * Math.PI) * .75; for (var s = 0; s < 3; s++) { c.strokeStyle = 'rgba(255,248,200,.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + (s - 1) * 2.6, yy - 3); c.stroke(); } } });
        P.part(c, cx - 7, mid - ry * .45, 4, 7, 'rgba(255,255,255,.28)', .3, true);
        flower(c, cx - 5, top + 1, 3.6, '#ff6fa5'); flower(c, cx + 5, top + 3, 3.2, '#ffd23f'); flower(c, cx + 1, top - 3, 2.8, '#ff9fc0');
      }
    });
    g.drawImage(im, x - 5, base - h - 16, 52, h + 20);
  };
  // ---------- flyer: armoured pterodactyl with animated wings ----------
  function wing(c, sx, sy, a, far) {
    var tx = sx - 40 * (1 - Math.abs(a) * .42), ty = sy - 38 * a - 3, rx = sx - 26, ry = sy + 13, i;
    var pts = [0, 1, 2, 3].map(function (k) { var t = k / 3; return [tx + (rx - tx) * t, ty + (ry - ty) * t]; });
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(tx, ty);
    for (i = 1; i < 4; i++) c.quadraticCurveTo((pts[i - 1][0] + pts[i][0]) / 2 + 3, (pts[i - 1][1] + pts[i][1]) / 2 + 4 + (a < 0 ? -6 : 0), pts[i][0], pts[i][1]);
    c.closePath();
    var g = c.createLinearGradient(0, ty, 0, ry); g.addColorStop(0, far ? '#c4552f' : '#ff9a6a'); g.addColorStop(1, far ? '#8f3a24' : '#ff6a3f');
    c.fillStyle = g; c.fill(); c.lineWidth = 1.8; c.lineJoin = 'round'; c.strokeStyle = K; c.stroke();
    c.strokeStyle = 'rgba(80,20,20,.5)'; c.lineWidth = 1.3; c.beginPath(); for (i = 1; i < 4; i++) { c.moveTo(sx - 2, sy + 1); c.lineTo(pts[i][0], pts[i][1]); } c.stroke();
    c.strokeStyle = 'rgba(255,230,200,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(sx, sy + 2); c.lineTo(tx + 1, ty + 2); c.stroke();
    poly(c, [[sx, sy], [tx, ty]], 3.4, far ? '#5a2a9a' : '#7a3fd0');
    C(c, tx, ty, 2.6, '#ffd23f', K, 1);
  }
  props.flyer = function (g, cx, cy, f) {
    var im = P.sprite('fly' + f, 104, 76, function (c) {
      var a = Math.cos(f / 4 * 6.2832), bx = 50, by = 44;
      wing(c, bx + 6, by - 7, a, true);
      poly(c, [[bx - 20, by + 3], [bx - 34, by + 9], [bx - 44, by + 5]], 4, '#8a4bd6');
      P.shape(c, by - 6, by + 14, '#ff4f5a', function (q) { q.moveTo(bx - 42, by + 5); q.lineTo(bx - 52, by - 2); q.lineTo(bx - 49, by + 6); q.lineTo(bx - 54, by + 12); q.closePath(); });
      c.strokeStyle = '#ffb02a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 6, by + 10); c.lineTo(bx - 8, by + 17); c.moveTo(bx + 3, by + 10); c.lineTo(bx + 4, by + 17); c.stroke();
      P.part(c, bx, by, 23, 13, '#8a4bd6', -.12); P.part(c, bx + 3, by + 6, 16, 6.5, '#ecd0ff', -.12, true);
      c.strokeStyle = 'rgba(80,30,130,.35)'; c.lineWidth = 1.2; for (var i = 0; i < 4; i++) { c.beginPath(); c.arc(bx - 8 + i * 8, by + 8, 3.6, .2, Math.PI - .2); c.stroke(); }
      P.part(c, bx + 21, by - 6, 9, 8, '#8a4bd6');
      P.shape(c, by - 30, by - 6, '#ff4f5a', function (q) { q.moveTo(bx + 28, by - 15); q.lineTo(bx + 18, by - 28); q.lineTo(bx + 23, by - 16); q.lineTo(bx + 12, by - 22); q.lineTo(bx + 21, by - 11); q.closePath(); });
      P.part(c, bx + 32, by - 10, 11.5, 9, '#9b5be6');
      P.shape(c, by - 15, by - 4, '#ffd23f', function (q) { q.moveTo(bx + 40, by - 15); q.quadraticCurveTo(bx + 58, by - 12, bx + 62, by - 8); q.lineTo(bx + 40, by - 7); q.closePath(); });
      P.shape(c, by - 8, by, '#ffa51f', function (q) { q.moveTo(bx + 40, by - 7); q.lineTo(bx + 58, by - 6); q.quadraticCurveTo(bx + 52, by - 1, bx + 40, by - 3); q.closePath(); });
      C(c, bx + 52, by - 11, 1, 'rgba(10,6,24,.6)');
      P.eye2(c, bx + 33, by - 12, 5, 1, .3);
      c.strokeStyle = '#1a1033'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx + 27, by - 19); c.lineTo(bx + 38, by - 15); c.stroke();
      C(c, bx + 40, by - 3, 2.2, 'rgba(255,120,150,.5)');
      wing(c, bx + 4, by - 5, a, false);
    });
    g.drawImage(im, cx - 52 * .78, cy - 44 * .78, 104 * .78, 76 * .78);
  };
  // ---------- flappy pipes: ribbed metal-green with rivets, moss and vines ----------
  props.pipe = function (g, x, top, bot, isTop, W) {
    var body = P.sprite('pbody', 52, 64, function (c) {
      c.fillStyle = hgrad(c, 0, 52, [[0, '#1b6e2e'], [.12, '#2fa645'], [.3, '#82e57e'], [.42, '#5fd26a'], [.8, '#2f9a40'], [1, '#175f27']]); c.fillRect(0, 0, 52, 64);
      c.fillStyle = 'rgba(10,6,24,.55)'; c.fillRect(0, 0, 2, 64); c.fillRect(50, 0, 2, 64);
      c.fillStyle = 'rgba(10,50,20,.5)'; c.fillRect(2, 0, 48, 3); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(2, 3, 48, 1.5);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(14, 6, 5, 58);
      [[40, 20, 5], [34, 44, 4]].forEach(function (m) { P.ell(c, m[0], m[1], m[2], m[2] * .6, 'rgba(90,160,40,.55)'); });
      c.strokeStyle = 'rgba(10,60,20,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(26, 8); c.lineTo(26, 62); c.stroke();
    });
    var cap = P.sprite('pcap', 64, 30, function (c) {
      c.beginPath(); P.path(c, 1, 1, 62, 28, 9); c.fillStyle = hgrad(c, 0, 64, [[0, '#1b6e2e'], [.1, '#33b04a'], [.28, '#92f08a'], [.4, '#66d86f'], [.82, '#34a044'], [1, '#175f27']]); c.fill();
      c.lineWidth = 2; c.strokeStyle = K; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.4)'; R(c, 6, 4, 52, 4, 2, 'rgba(255,255,255,.35)'); R(c, 4, 22, 56, 4, 2, 'rgba(10,50,20,.4)');
      [[9, 15], [55, 15]].forEach(function (b) { C(c, b[0], b[1], 3.4, '#d9ffd2', K, 1.2); C(c, b[0] - 1, b[1] - 1, 1, '#fff'); });
      c.strokeStyle = '#2f8a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(20, 28); c.quadraticCurveTo(16, 33, 22, 36); c.stroke(); P.part(c, 21, 35, 3.2, 1.8, '#6fe048', .5);
    });
    var w = W || 60, bx = x + (w - 52) / 2 + 0;
    var y0 = isTop ? -4 : top, y1 = isTop ? bot : 1000, ch = 28;
    g.save(); g.beginPath(); g.rect(x, isTop ? -6 : top + ch - 2, w, isTop ? bot - ch + 8 : 700); g.clip();
    var st = isTop ? bot - ch : top + ch - 2; if (isTop) { for (var yy = st; yy > -70; yy -= 64) g.drawImage(body, bx, yy - 62, 52, 64); } else { for (yy = st; yy < 700; yy += 64) g.drawImage(body, bx, yy, 52, 64); }
    g.restore();
    g.drawImage(cap, x - 2, isTop ? bot - ch : top, w + 4, 30);
  };
  // ---------- flappy ground tufts ----------
  props.tuft = function (g, x, y, s) { var im = P.sprite('gtuft', 22, 18, function (c) { tuft(c, 5, 16, '#4cc060'); tuft(c, 11, 16, '#6fe048'); tuft(c, 17, 16, '#3fb356'); }); g.drawImage(im, x, y - 14 * s, 22 * s, 18 * s); };
  props.tree = function (g, x, base, h, night) {
    var im = P.sprite('tree' + h + (night ? 'n' : 'd'), 40, h + 6, function (c, W, H) {
      var col = night ? '#2a1a58' : '#3fa05a', hi = night ? '#3a2a70' : '#62c878';
      P.rr(c, 18, H - 12, 5, 12, 2, night ? '#1a1038' : '#7a4a22');
      for (var i = 0; i < 3; i++) { var yy = H - 10 - i * (h / 3.2), w = 17 - i * 4; c.beginPath(); c.moveTo(20, yy - h / 2.6); c.lineTo(20 + w, yy); c.lineTo(20 - w, yy); c.closePath(); c.fillStyle = i % 2 ? col : hi; c.fill(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(10,6,24,.45)'; c.stroke(); }
    });
    g.drawImage(im, x - 20, base - h - 6, 40, h + 6);
  };
  // ---------- invaders ammo ----------
  props.laser = function (g, x, y) {
    var im = P.sprite('laser', 20, 34, function (c) { var q = c.createRadialGradient(10, 17, 1, 10, 17, 14); q.addColorStop(0, 'rgba(53,224,255,.8)'); q.addColorStop(1, 'rgba(53,224,255,0)'); c.fillStyle = q; c.fillRect(0, 0, 20, 34); R(c, 7.5, 5, 5, 24, 2.5, '#fff', '#35e0ff', 1.5); R(c, 8.8, 8, 2.4, 18, 1.2, '#bff4ff'); });
    g.drawImage(im, x - 10, y - 20, 20, 34);
  };
  props.plasma = function (g, x, y, t) {
    var f = (t / 4 | 0) % 2, im = P.sprite('plasma' + f, 24, 36, function (c) {
      var q = c.createRadialGradient(12, 20, 1, 12, 20, 15); q.addColorStop(0, 'rgba(255,79,90,.75)'); q.addColorStop(1, 'rgba(255,79,90,0)'); c.fillStyle = q; c.fillRect(0, 0, 24, 36);
      c.strokeStyle = '#ff4f5a'; c.lineWidth = 3.4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(12, 3); c.lineTo(12 + (f ? 5 : -5), 10); c.lineTo(12 + (f ? -5 : 5), 17); c.lineTo(12, 22); c.stroke();
      c.strokeStyle = '#ffd9d9'; c.lineWidth = 1.4; c.stroke(); P.orb(c, 12, 26, 6, '#ff4f5a'); C(c, 10, 24, 1.8, '#fff');
    });
    g.drawImage(im, x - 12, y - 12, 24, 36);
  };
  // ---------- whack: mounds, bomb, hammer ----------
  props.moundBack = function (g, cx, cy) {
    var im = P.sprite('mback', 124, 60, function (c) { E(c, 62, 40, 56, 17, '#6a4220'); E(c, 62, 34, 50, 13, '#2a1608'); E(c, 62, 32, 44, 9, '#0a0618'); });
    g.drawImage(im, cx - 62, cy - 28, 124, 60);
  };
  props.moundFront = function (g, cx, cy) {
    var im = P.sprite('mfront', 124, 40, function (c) {
      c.beginPath(); c.moveTo(4, 18); c.quadraticCurveTo(62, 40, 120, 18); c.quadraticCurveTo(122, 32, 62, 38); c.quadraticCurveTo(2, 32, 4, 18); c.closePath();
      var q = c.createLinearGradient(0, 14, 0, 38); q.addColorStop(0, '#9a6a36'); q.addColorStop(1, '#5a3418'); c.fillStyle = q; c.fill(); c.lineWidth = 1.8; c.strokeStyle = K; c.stroke();
      c.beginPath(); c.moveTo(3, 18); c.quadraticCurveTo(62, 40, 121, 18); c.lineTo(121, 10); c.quadraticCurveTo(62, 28, 3, 10); c.closePath(); c.fillStyle = '#58c850'; c.fill(); c.lineWidth = 1.4; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(8, 12); c.quadraticCurveTo(62, 28, 116, 12); c.lineTo(116, 14); c.quadraticCurveTo(62, 31, 8, 14); c.fill();
      [[18, 12], [40, 17], [76, 17], [100, 12]].forEach(function (t) { tuft(c, t[0], t[1] + 2, '#3fb356'); });
      E(c, 30, 30, 4, 2.4, '#c9a06a'); E(c, 92, 29, 3.4, 2, '#d8b480'); E(c, 62, 34, 3, 1.8, '#b88a54');
    });
    g.drawImage(im, cx - 62, cy + 4, 124, 40);
  };
  props.bomb = function (g, cx, y, t) {
    var f = (t / 3 | 0) % 3, im = P.sprite('bomb' + f, 80, 92, function (c) {
      c.translate(40, 54);
      P.orb(c, 0, 0, 26, '#3b3b58');
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 21, .3, 2.4); c.stroke();
      [[-19, -9], [19, -9], [-20, 8], [20, 8], [0, -23]].forEach(function (r) { C(c, r[0], r[1], 2.2, '#8a8aa8', K, 1); C(c, r[0] - .6, r[1] - .6, .8, '#fff'); });
      P.block(c, -8, -35, 16, 11, '#5a5a78', 4); R(c, -3, -38, 6, 5, 2, '#222');
      c.strokeStyle = '#7a4a22'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -38); c.quadraticCurveTo(8, -46, 15, -42); c.stroke();
      var s = [7, 9, 6][f]; c.fillStyle = '#ffd23f'; c.beginPath(); for (var i = 0; i < 8; i++) { var a = i * .7854, r = i % 2 ? s * .45 : s; c.lineTo(15 + Math.cos(a) * r, -43 + Math.sin(a) * r); } c.closePath(); c.fill(); C(c, 15, -43, 2.6, f === 1 ? '#fff' : '#ff9442');
      P.eye2(c, -9, 0, 7, 0, .5); P.eye2(c, 9, 0, 7, 0, .5);
      c.strokeStyle = '#fff'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-17, -10); c.lineTo(-4, -6); c.moveTo(17, -10); c.lineTo(4, -6); c.stroke();
      c.beginPath(); c.moveTo(-10, 14); c.lineTo(-6, 11); c.lineTo(-2, 14); c.lineTo(2, 11); c.lineTo(6, 14); c.lineTo(10, 11); c.stroke();
    });
    g.drawImage(im, cx - 40, y - 24, 80, 92);
  };
  props.hammer = function (g) {
    var im = P.sprite('hammer', 80, 110, function (c) {
      c.translate(40, 0);
      c.fillStyle = hgrad(c, -6, 6, [[0, '#8a5a22'], [.4, '#e0a860'], [1, '#7a4a18']]); R(c, -6, 30, 12, 76, 5, c.fillStyle, K, 1.6);
      c.strokeStyle = 'rgba(90,50,10,.4)'; c.lineWidth = 1; for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-3, 40 + i * 11); c.lineTo(2, 44 + i * 11); c.stroke(); }
      R(c, -9, 94, 18, 8, 4, '#ff4f8b', K, 1.4); R(c, -8, 26, 16, 7, 3, '#b8b8d8', K, 1.4);
      P.block(c, -33, 2, 66, 32, '#ff4f8b', 11); R(c, -33, 5, 9, 26, 5, '#ffd23f', K, 1.4); R(c, 24, 5, 9, 26, 5, '#ffd23f', K, 1.4);
      c.fillStyle = 'rgba(255,255,255,.4)'; R(c, -18, 7, 34, 5, 2.5, 'rgba(255,255,255,.4)');
      [[-28, 12], [-28, 25], [28, 12], [28, 25]].forEach(function (r) { C(c, r[0], r[1], 1.6, '#fff4d6'); });
    });
    g.drawImage(im, -40, -4, 80, 110);
  };
  // ---------- minesweeper ----------
  props.mine = function (g, cx, cy) {
    var im = P.sprite('mine', 56, 56, function (c) {
      c.translate(28, 28); c.lineJoin = 'round';
      for (var i = 0; i < 8; i++) { c.save(); c.rotate(i * .7854); c.beginPath(); c.moveTo(-4, -12); c.lineTo(0, -25); c.lineTo(4, -12); c.closePath(); c.fillStyle = '#9a9ab8'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke(); c.restore(); }
      P.orb(c, 0, 0, 15, '#2a2a3a'); C(c, 0, 0, 5.5, '#ff4f5a', K, 1.2); C(c, -1.6, -1.6, 1.8, '#ffd9d9'); C(c, -6, -6, 2.6, 'rgba(255,255,255,.85)');
    });
    g.drawImage(im, cx - 28, cy - 28, 56, 56);
  };
  props.flag = function (g, cx, cy, f) {
    var im = P.sprite('flag' + f, 40, 44, function (c) {
      E(c, 20, 40, 11, 3, 'rgba(0,0,0,.28)'); P.block(c, 12, 34, 16, 7, '#8a8aa8', 3);
      R(c, 18.2, 6, 3.6, 31, 1.8, '#2a1a4a', null); R(c, 18.8, 7, 1.2, 28, .6, 'rgba(255,255,255,.35)'); C(c, 20, 6, 3.2, '#ffd23f', K, 1.2);
      var w = [0, 2, -2][f]; c.beginPath(); c.moveTo(22, 8); c.quadraticCurveTo(30, 6 + w, 38, 10 + w); c.quadraticCurveTo(32, 14 - w, 38, 20 - w); c.quadraticCurveTo(30, 22 + w, 22, 22); c.closePath();
      var q = c.createLinearGradient(0, 6, 0, 22); q.addColorStop(0, '#ff7aa8'); q.addColorStop(1, '#e0306a'); c.fillStyle = q; c.fill(); c.lineWidth = 1.5; c.strokeStyle = K; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; C(c, 29, 14, 2.2, 'rgba(255,255,255,.75)');
    });
    g.drawImage(im, cx - 20, cy - 24, 40, 44);
  };
  // ---------- breakout paddle ----------
  props.paddle = function (g, x, y, w) {
    var im = P.sprite('pad' + w, w, 22, function (c) {
      P.block(c, 0, 2, w, 16, '#b8c4e8', 8); R(c, 12, 6, w - 24, 8, 4, '#2a1a58', K, 1);
      var q = c.createLinearGradient(12, 0, w - 12, 0); q.addColorStop(0, '#35e0ff'); q.addColorStop(.5, '#bff4ff'); q.addColorStop(1, '#35e0ff'); R(c, 15, 8, w - 30, 4, 2, q);
      C(c, 7, 10, 3, '#ff4f8b', K, 1); C(c, w - 7, 10, 3, '#ff4f8b', K, 1); C(c, 6, 8.6, 1, '#fff'); C(c, w - 8, 8.6, 1, '#fff');
    });
    g.drawImage(im, x, y - 3, w, 22);
  };
  P.props = props;

  // ================= characters =================
  var chars = {};
  chars.alien = function (c, t, f, hurt) {
    var col = hurt ? HURT[t] : RC[t], sw = f ? 1 : -1, D = '#1a1033', i;
    c.translate(2, 2);
    if (t === 0) { // crab
      PP.limb(c, 9, 20, 3, 12 + sw * 2, 4, col); PP.limb(c, 31, 20, 37, 12 - sw * 2, 4, col);
      PP.part(c, 3, 10 + sw * 2, 5, 4.4, col); PP.part(c, 37, 10 - sw * 2, 5, 4.4, col);
      for (i = 0; i < 3; i++) { PP.limb(c, 11 + i * 3, 27, 7 + i * 3 + sw * 2, 33, 2.6, col); PP.limb(c, 29 - i * 3, 27, 33 - i * 3 - sw * 2, 33, 2.6, col); }
      PP.limb(c, 14, 14, 13, 8, 2.6, col); PP.limb(c, 26, 14, 27, 8, 2.6, col); PP.part(c, 20, 21, 15, 10, col);
      PP.eye2(c, 13, 6, 4.6, sw, 1); PP.eye2(c, 27, 6, 4.6, sw, 1); c.strokeStyle = D; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.arc(20, 23, 4, .2, Math.PI - .2); c.stroke();
    } else if (t === 1) { // squid
      for (i = 0; i < 5; i++) { var x = 10 + i * 5, sway = Math.sin(i * 1.4 + f * 2) * 3; PP.limb(c, x, 20, x + sway, 30, 3.4, col); PP.part(c, x + sway * 1.1, 31, 2.6, 2.6, col, 0, true); }
      PP.shape(c, 2, 24, col, function (g) { g.moveTo(5, 22); g.bezierCurveTo(4, 2, 36, 2, 35, 22); g.quadraticCurveTo(20, 27, 5, 22); });
      PP.part(c, 13, 8, 4, 2.4, 'rgba(255,255,255,.55)', -.6, true); PP.eye2(c, 14, 16, 5, sw, .6); PP.eye2(c, 26, 16, 5, sw, .6);
      c.fillStyle = 'rgba(255,100,140,.55)'; c.beginPath(); c.ellipse(8, 21, 3, 1.8, 0, 0, 6.2832); c.ellipse(32, 21, 3, 1.8, 0, 0, 6.2832); c.fill();
    } else if (t === 2) { // antenna blob
      PP.limb(c, 14, 12, 10, 4 + sw, 2.2, col); PP.limb(c, 26, 12, 30, 4 - sw, 2.2, col); PP.part(c, 10, 3 + sw, 3.6, 3.6, '#ffd23f'); PP.part(c, 30, 3 - sw, 3.6, 3.6, '#ffd23f');
      PP.part(c, 12, 31 + sw, 4.5, 3, col); PP.part(c, 28, 31 - sw, 4.5, 3, col);
      PP.part(c, 20, 20, 16.5, 12.5, col); PP.eye2(c, 14, 17, 5.2, sw, .4); PP.eye2(c, 26, 17, 5.2, sw, .4);
      PP.rr(c, 14, 24, 12, 5, 2.4, '#fff', 'rgba(26,16,51,.7)', 1.4); c.fillStyle = D; c.fillRect(18, 24.5, 1.2, 4); c.fillRect(21.5, 24.5, 1.2, 4);
    } else if (t === 3) { // beetle
      PP.part(c, 7, 18, 8, 5.5, 'rgba(255,255,255,.75)', -.5 + sw * .5); PP.part(c, 33, 18, 8, 5.5, 'rgba(255,255,255,.75)', .5 - sw * .5);
      PP.limb(c, 11, 11, 7, 4, 1.8, D); PP.limb(c, 29, 11, 33, 4, 1.8, D);
      for (i = 0; i < 3; i++) { PP.limb(c, 12, 20 + i * 4, 4, 22 + i * 5 + sw * (i - 1), 2.4, col); PP.limb(c, 28, 20 + i * 4, 36, 22 + i * 5 - sw * (i - 1), 2.4, col); }
      PP.part(c, 20, 20, 13, 13, col); c.strokeStyle = 'rgba(26,16,51,.45)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(20, 8); c.lineTo(20, 33); c.stroke();
      PP.part(c, 20, 10, 8.5, 7, '#ff9442'); PP.eye2(c, 16, 10, 3.8, sw, 1); PP.eye2(c, 24, 10, 3.8, sw, 1);
      PP.circ(c, 14, 24, 2.6, 'rgba(26,16,51,.35)'); PP.circ(c, 26, 24, 2.6, 'rgba(26,16,51,.35)');
    } else if (t === 4) { // robot
      PP.limb(c, 20, 6, 20, 1.5, 2, '#9aa'); PP.part(c, 20, 3, 3.2, 3.2, sw > 0 ? '#ff4f5a' : '#ffd23f');
      PP.limb(c, 7, 24, 3, 30 + sw, 3.6, col); PP.limb(c, 33, 24, 37, 30 - sw, 3.6, col);
      PP.block(c, 7, 6, 26, 24, col, 8); PP.rr(c, 10, 12, 20, 10, 5, D, 'rgba(255,255,255,.3)', 1.2);
      PP.circ(c, 15.5 + sw * .8, 17, 3.4, '#9dffb0'); PP.circ(c, 24.5 + sw * .8, 17, 3.4, '#9dffb0'); PP.circ(c, 15, 16.2, 1, '#fff'); PP.circ(c, 24, 16.2, 1, '#fff');
      PP.part(c, 7, 18, 2.4, 4, '#8aa', 0); PP.part(c, 33, 18, 2.4, 4, '#8aa', 0);
      PP.block(c, 11 + sw, 30, 8, 6, col, 3); PP.block(c, 21 - sw, 30, 8, 6, col, 3); c.fillStyle = 'rgba(26,16,51,.55)'; for (i = 0; i < 4; i++) c.fillRect(13 + i * 4.5, 25, 2, 3);
    } else { // boss
      PP.shape(c, 0, 12, '#ffd23f', function (g) { g.moveTo(10, 8); g.lineTo(11, -1); g.lineTo(16, 5); g.lineTo(20, -3); g.lineTo(24, 5); g.lineTo(29, -1); g.lineTo(30, 8); g.closePath(); });
      PP.part(c, 20, 20, 18, 14, col); PP.part(c, 4, 18, 4, 7, col, -.3); PP.part(c, 36, 18, 4, 7, col, .3);
      PP.limb(c, 9, 12, 5, 6, 3, '#fff4d6'); PP.limb(c, 31, 12, 35, 6, 3, '#fff4d6');
      PP.eye2(c, 13, 18, 5.5, sw, .5); PP.eye2(c, 27, 18, 5.5, sw, .5);
      c.strokeStyle = D; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(7, 12); c.lineTo(17, 15); c.moveTo(33, 12); c.lineTo(23, 15); c.stroke();
      PP.rr(c, 12, 26, 16, 6, 3, '#1a1033'); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(14, 26); c.lineTo(16, 30); c.lineTo(18, 26); c.moveTo(22, 26); c.lineTo(24, 30); c.lineTo(26, 26); c.fill();
    }
    // shared surface detail: specks and a soft rim light
    var sp = [[[12, 22, 1.4], [28, 20, 1.2], [20, 28, 1.3]], [[14, 10, 1.1], [26, 12, 1.1], [20, 6, 1]], [[10, 24, 1.3], [30, 24, 1.3], [20, 12, 1]], [[14, 28, 1.3], [26, 28, 1.3]], [[12, 14, 1.2], [28, 14, 1.2], [20, 28, 1.2]], [[10, 24, 1.4], [30, 24, 1.4], [20, 31, 1.3]]][t] || [];
    sp.forEach(function (s) { C(c, s[0], s[1], s[2], 'rgba(26,16,51,.28)'); });
    if (!hurt) { c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1.3; c.beginPath(); c.arc(20, 19, 15, 3.6, 4.9); c.stroke(); }

  };
  chars.ship = function (c) {
      c.translate(4, 2);
      PP.shape(c, 20, 44, '#2a8fff', function (g) { g.moveTo(8, 24); g.lineTo(0, 42); g.lineTo(3, 46); g.lineTo(12, 40); g.lineTo(14, 32); g.closePath(); });
      PP.shape(c, 20, 44, '#2a8fff', function (g) { g.moveTo(40, 24); g.lineTo(48, 42); g.lineTo(45, 46); g.lineTo(36, 40); g.lineTo(34, 32); g.closePath(); });
      PP.shape(c, 2, 46, '#35e0ff', function (g) { g.moveTo(24, 2); g.bezierCurveTo(33, 14, 36, 28, 34, 42); g.quadraticCurveTo(24, 47, 14, 42); g.bezierCurveTo(12, 28, 15, 14, 24, 2); });
      PP.part(c, 24, 8, 3.4, 5, '#ff4f8b'); PP.part(c, 24, 22, 6, 9, '#bff4ff'); PP.part(c, 22.5, 19, 1.8, 3.4, 'rgba(255,255,255,.9)', 0, true);
      c.fillStyle = '#ffd23f'; c.fillRect(3, 41, 3, 4); c.fillRect(42, 41, 3, 4); PP.circ(c, 24, 38, 2.2, '#ff4f8b');
      c.strokeStyle = 'rgba(10,6,24,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(14, 26); c.lineTo(34, 26); c.moveTo(16, 33); c.lineTo(32, 33); c.stroke();
      P.part(c, 6, 36, 2.6, 5, '#ff4f8b', 0.1); P.part(c, 42, 36, 2.6, 5, '#ff4f8b', -0.1); c.fillStyle = '#ffd23f'; c.fillRect(2.2, 44, 2.6, 3); c.fillRect(43.2, 44, 2.6, 3);
      P.part(c, 24, 14, 2.4, 3, 'rgba(255,255,255,.85)', 0, true); C(c, 20, 30, 1.2, '#ffd23f'); C(c, 28, 30, 1.2, '#ffd23f');

  };
  chars.apple = function (g, x, y) {
    var im = P.sprite('apple', 28, 30, function (c) {
      P.part(c, 10.5, 18, 8.5, 9.5, '#ff4f5a'); P.part(c, 17.5, 18, 8.5, 9.5, '#ff4f5a'); P.part(c, 14, 20, 9, 8, '#ff5a64', 0, true);
      c.lineCap = 'round'; c.strokeStyle = '#6b4220'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(14, 11); c.quadraticCurveTo(14, 7, 17, 4); c.stroke();
      P.part(c, 20, 6, 5.5, 3, '#6fe048', -.5); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(8.5, 15.5, 2.4, 3.6, -.5, 0, 6.2832); c.fill();
      c.strokeStyle = 'rgba(120,10,20,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(14, 12); c.quadraticCurveTo(12, 20, 14, 27); c.stroke();
    });
    g.drawImage(im, x - 14, y - 15, 28, 30);
  };
  chars.snakeHead = function (g, tongue) { // drawn facing +x at the origin
    if (tongue) { g.strokeStyle = '#ff4f5a'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(13, 0); g.lineTo(21, 0); g.moveTo(21, 0); g.lineTo(25, -3); g.moveTo(21, 0); g.lineTo(25, 3); g.stroke(); }
    P.part(g, 2, 0, 14.5, 12.8, '#58e070');
    P.part(g, -6, 0, 6, 7, 'rgba(20,110,50,.45)', 0, true);
    [[-2, -6], [-2, 6], [-8, -3], [-8, 3]].forEach(function (s) { P.part(g, s[0], s[1], 2.2, 1.6, 'rgba(20,110,50,.5)', .6, true); });
    P.part(g, 9, 0, 6, 8.5, 'rgba(255,255,255,.12)', 0, true);
    C(g, 12.5, -3.4, 1.3, '#0a2a14'); C(g, 12.5, 3.4, 1.3, '#0a2a14');
    P.eye2(g, 4, -7.2, 5, 1, .2); P.eye2(g, 4, 7.2, 5, 1, -.2);
    g.strokeStyle = '#1a1033'; g.lineWidth = 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(.5, -12.4); g.lineTo(8, -10.6); g.moveTo(.5, 12.4); g.lineTo(8, 10.6); g.stroke();
  };
  chars.bird = function (g, flap) { // origin = body centre, faces +x
    var fl = flap;
    [0, 1, 2].forEach(function (i) { P.part(g, -20 - i * 2, -3 + i * 6 + fl * 2, 11, 3.6, ['#ff7a3a', '#ff9442', '#ffb23f'][i], (i - 1) * .45 + fl * .1); });
    c2(); function c2() { g.strokeStyle = '#ff9442'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-4, 13); g.lineTo(-6, 20); g.moveTo(-6, 20); g.lineTo(-10, 21); g.moveTo(-6, 20); g.lineTo(-3, 22); g.moveTo(4, 13); g.lineTo(3, 20); g.moveTo(3, 20); g.lineTo(-1, 21); g.moveTo(3, 20); g.lineTo(6, 22); g.stroke(); }
    g.save(); g.translate(-3, -4); g.rotate(-.55 - fl * .55);
    [0, 1, 2].forEach(function (i) { P.part(g, -12 - i * 1.5, -4 + i * 4, 9, 3.2, ['#e8832a', '#ff9442', '#ffa94a'][i], -.25 + i * .22); });
    P.part(g, -4, 0, 11, 6.5, '#ffb23f'); P.part(g, -5, 1, 7.5, 3.4, '#ffd98a', 0, true); g.restore();
    P.part(g, 0, 1, 17.5, 15, '#ffd23f'); P.part(g, 1, 7, 11.5, 8, '#fff1b0', 0, true);
    g.strokeStyle = 'rgba(200,140,20,.4)'; g.lineWidth = 1.2; for (var i = 0; i < 3; i++) { g.beginPath(); g.arc(-3 + i * 5, 10, 3, .3, Math.PI - .3); g.stroke(); }
    [-3, 2, 7].forEach(function (cx, i) { P.part(g, cx, -14 - (i === 1 ? 4 : 0), 2.6, 6, ['#ff4f5a', '#ff7a5a', '#ff4f5a'][i], (i - 1) * .5); });
    P.part(g, 2, -13, 8, 3.6, '#ffe58a', 0, true);
    C(g, 10, 5.5, 3.4, 'rgba(255,120,150,.55)');
    P.eye2(g, 8, -4, 6.6, 1, .2);
    g.strokeStyle = '#1a1033'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(3, -11.5); g.lineTo(12, -9.5); g.stroke();
    P.shape(g, -3, 12, '#ff7a3a', function (q) { q.moveTo(14, -1); q.quadraticCurveTo(25, -2, 27, 4); q.quadraticCurveTo(22, 5, 14, 4); q.closePath(); });
    P.shape(g, 3, 12, '#ff5a2a', function (q) { q.moveTo(14, 4); q.quadraticCurveTo(23, 5, 26, 4.5); q.quadraticCurveTo(22, 11, 14, 9); q.closePath(); });
    C(g, 21, 1.5, .9, 'rgba(10,6,24,.6)');
  };
  chars.kid = function (g, cx, py, o) {
    var air = o.air, ph = air ? 0 : o.ph, run = Math.sin(ph), run2 = -run, by = py - (air ? 0 : Math.abs(run) * 2.5), T = o.T || 0;
    E(g, cx, py + 2, 15 - (o.lift || 0) / 14, 3.5, 'rgba(0,0,0,.25)');
    function shoe(fx, fy) { P.part(g, fx + 3, fy - 2, 8, 4.6, '#fff4e8'); R(g, fx - 4, fy + 1.2, 16, 3, 1.5, '#2a1a4a'); P.part(g, fx + 7, fy - 2.4, 3, 2, '#35e0ff', 0, true); g.strokeStyle = '#35e0ff'; g.lineWidth = 1; g.beginPath(); g.moveTo(fx + 1, fy - 4); g.lineTo(fx + 4, fy - 2); g.moveTo(fx + 3, fy - 5); g.lineTo(fx + 6, fy - 3); g.stroke(); }
    function leg(sw) {
      var sp = air ? sw * 7 : Math.sin(ph + (sw > 0 ? 0 : Math.PI)) * 9, lift = air ? (sw > 0 ? 6 : 2) : Math.max(0, Math.cos(ph + (sw > 0 ? 0 : Math.PI))) * 6;
      var hx = cx + sw * 4, hy = by - 11, fx = hx + sp, fy = py - lift;
      P.limb(g, hx, hy, fx, fy - 4, 7.4, '#3b6bff'); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx + sp * .5, hy + 6 + (fy - 4 - hy) * .4); g.lineTo(hx + sp * .5 + 3, hy + 6 + (fy - 4 - hy) * .4); g.stroke(); shoe(fx, fy);
    }
    if (o.duck) {
      P.part(g, cx, py - 12, 21, 11.5, '#ff4f8b'); P.part(g, cx - 6, py - 10, 9, 8, '#a56a28'); P.part(g, cx + 12, py - 14, 12.5, 11, '#ffe9b8'); P.eye2(g, cx + 17, py - 15, 4.8, 1, .2);
      P.shape(g, py - 28, py - 16, '#35e0ff', function (q) { q.moveTo(cx + 1, py - 18); q.quadraticCurveTo(cx + 3, py - 29, cx + 14, py - 25); q.quadraticCurveTo(cx + 20, py - 24, cx + 24, py - 19); q.quadraticCurveTo(cx + 12, py - 20, cx + 1, py - 18); });
      P.part(g, cx + 3, py - 7, 7, 4, '#ffe9b8'); P.limb(g, cx - 10, py - 6, cx - 16, py - 2, 6.4, '#3b6bff'); shoe(cx - 22, py);
      return;
    }
    var sc = Math.sin(T / 3) * 3.5;
    P.shape(g, by - 40, by - 24, '#ff3f6a', function (q) { q.moveTo(cx - 5, by - 34); q.quadraticCurveTo(cx - 20, by - 36 + sc, cx - 32, by - 30 + sc * 1.6); q.lineTo(cx - 30, by - 25 + sc * 1.6); q.quadraticCurveTo(cx - 18, by - 29 + sc, cx - 4, by - 28); q.closePath(); });
    P.block(g, cx - 21, by - 34, 14, 22, '#a56a28', 7); R(g, cx - 19, by - 30, 10, 3, 1.5, '#7a4a18'); C(g, cx - 14, by - 15, 1.4, '#ffd23f');
    leg(-1);
    P.limb(g, cx - 9, by - 28, cx - 15 - run2 * 4, by - 21 + run2 * 3, 6.4, '#ffe9b8'); P.part(g, cx - 15 - run2 * 4, by - 21 + run2 * 3, 3.6, 3.6, '#ffe9b8');
    P.part(g, cx, by - 23, 15.5, 17, '#ff4f8b'); P.part(g, cx, by - 18, 10, 9, '#ff8db5', 0, true);
    R(g, cx - 14, by - 19, 28, 3.4, 1.7, '#a56a28'); R(g, cx - 3, by - 20, 6, 5, 1.6, '#ffd23f', K, 1);
    g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(cx, by - 31); g.lineTo(cx + 3, by - 25); g.lineTo(cx - 3, by - 25); g.fill();
    leg(1);
    P.limb(g, cx + 9, by - 28, cx + 16 + run * 4, by - 24 - run * 3, 6.4, '#ffe9b8'); P.part(g, cx + 16 + run * 4, by - 24 - run * 3, 3.6, 3.6, '#ffe9b8');
    P.part(g, cx - 8, by - 44, 4.4, 5.6, '#f5cfa0');
    P.shape(g, by - 56, by - 44, '#7a4a22', function (q) { q.moveTo(cx - 11, by - 46); q.quadraticCurveTo(cx - 22, by - 44, cx - 21, by - 38); q.quadraticCurveTo(cx - 14, by - 40, cx - 8, by - 42); q.closePath(); });
    P.part(g, cx + 1, by - 46, 17, 16, '#ffe9b8'); P.part(g, cx + 6, by - 42, 9, 8, 'rgba(255,255,255,.2)', 0, true);
    P.shape(g, by - 68, by - 52, '#35e0ff', function (q) { q.moveTo(cx - 16, by - 50); q.quadraticCurveTo(cx - 17, by - 66, cx, by - 66); q.quadraticCurveTo(cx + 17, by - 66, cx + 17, by - 53); q.quadraticCurveTo(cx + 2, by - 56, cx - 16, by - 50); });
    P.part(g, cx - 16, by - 56, 6, 3.4, '#35e0ff', .9); R(g, cx + 7, by - 61, 12, 5, 2.5, '#2a8fd0', K, 1.2); C(g, cx - 1, by - 62, 2.2, '#fff4d6', K, 1);
    P.eye2(g, cx + 7, by - 45, 6.2, 1, air ? -.8 : .1);
    g.strokeStyle = '#7a4a22'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + 2, by - 53.6); g.lineTo(cx + 11, by - 52); g.stroke();
    C(g, cx + 14, by - 39, 3, 'rgba(255,120,150,.6)'); C(g, cx + 17.5, by - 44, 1, 'rgba(180,120,70,.6)'); C(g, cx + 15, by - 46, .9, 'rgba(180,120,70,.6)');
    if (air) { P.part(g, cx + 10, by - 36, 3.4, 4, '#7a1a3a'); } else { g.strokeStyle = '#1a1033'; g.lineWidth = 2.2; g.beginPath(); g.arc(cx + 9, by - 38, 4.2, .2, Math.PI - .5); g.stroke(); }
  };
  chars.mole = function (g, cx, y, o) {
    var gold = o.gold, col = gold ? '#ffd23f' : '#9a6a3a', belly = gold ? '#fff0a8' : '#e9c9a0', dk = gold ? '#e0a000' : '#6a4224', T = o.T || 0;
    g.save(); g.translate(cx, y + 36); g.scale(1 / (o.sq || 1), o.sq || 1); g.translate(-cx, -(y + 36));
    [-1, 1].forEach(function (s) {
      P.part(g, cx + s * 31, y + 24, 9, 6.5, col, -s * .6); g.strokeStyle = '#fff4d6'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath();
      for (var i = 0; i < 3; i++) { g.moveTo(cx + s * (34 + i * 2.4), y + 28 + i * 1.5); g.lineTo(cx + s * (39 + i * 2.6), y + 31 + i * 2.6); } g.stroke();
    });
    P.part(g, cx, y + 20, 29, 34, col); P.part(g, cx, y + 30, 18, 20, belly, 0, true);
    g.strokeStyle = 'rgba(10,6,24,.2)'; g.lineWidth = 1.4; for (var k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx - 10 + k * 6, y + 40); g.lineTo(cx - 9 + k * 6, y + 46); g.stroke(); }
    [-1, 1].forEach(function (s) { P.part(g, cx + s * 19, y - 11, 8, 8.5, col); P.part(g, cx + s * 19, y - 10, 4.4, 5, '#ffa0bb', 0, true); });
    tuft(g, cx - 5, y - 8, dk); tuft(g, cx + 4, y - 9, dk);
    P.part(g, cx - 20, y + 10, 5, 3, 'rgba(70,40,20,.35)', 0, true); P.part(g, cx + 20, y + 10, 5, 3, 'rgba(70,40,20,.35)', 0, true);
    P.part(g, cx, y + 17, 15, 11, belly, 0, true); P.part(g, cx, y + 12, 6.8, 5, '#ff6f9c'); P.part(g, cx - 2, y + 10.6, 2.2, 1.5, 'rgba(255,255,255,.9)', 0, true);
    [[-8, 15], [-11, 18], [8, 15], [11, 18]].forEach(function (f) { C(g, cx + f[0], y + f[1], .8, 'rgba(80,50,30,.55)'); });
    if (o.hit) {
      g.lineWidth = 3.2; g.strokeStyle = '#1a1033'; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 17, y); g.lineTo(cx - 7, y + 8); g.moveTo(cx - 7, y); g.lineTo(cx - 17, y + 8); g.moveTo(cx + 7, y); g.lineTo(cx + 17, y + 8); g.moveTo(cx + 17, y); g.lineTo(cx + 7, y + 8); g.stroke();
      g.beginPath(); g.arc(cx, y + 26, 5, Math.PI + .3, -.3); g.stroke();
    } else {
      P.eye2(g, cx - 11, y + 2, 7.4, 0, .6); P.eye2(g, cx + 11, y + 2, 7.4, 0, .6);
      g.strokeStyle = dk; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx - 17, y - 7); g.lineTo(cx - 6, y - 5); g.moveTo(cx + 17, y - 7); g.lineTo(cx + 6, y - 5); g.stroke();
      R(g, cx - 3.6, y + 21, 7.2, 8, 2, '#fff', 'rgba(26,16,51,.7)', 1.2); g.strokeStyle = '#1a1033'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, y + 21); g.lineTo(cx, y + 28); g.stroke();
    }
    g.strokeStyle = 'rgba(26,16,51,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx - 12, y + 14); g.lineTo(cx - 25, y + 11); g.moveTo(cx - 12, y + 17); g.lineTo(cx - 25, y + 18); g.moveTo(cx + 12, y + 14); g.lineTo(cx + 25, y + 11); g.moveTo(cx + 12, y + 17); g.lineTo(cx + 25, y + 18); g.stroke();
    g.restore();
    if (gold) { var tw = .5 + .5 * Math.sin(T / 4); g.fillStyle = 'rgba(255,255,255,' + tw + ')'; C(g, cx + 24, y - 16, 3, g.fillStyle); C(g, cx - 26, y + 8, 2.2, g.fillStyle); C(g, cx + 30, y + 14, 1.8, g.fillStyle); }
  };
  P.chars = chars;
})();
