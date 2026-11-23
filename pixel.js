// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
// Pixel Pocket shared helpers: theme, sound, best scores, pixel blocks, particles (window.PP)
(function () {
  var S = {
    get: function (k, d) { try { var v = localStorage.getItem('pp_' + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pp_' + k, v); } catch (e) { } }
  };
  var mode = S.get('mode', null) || (matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night');
  var muted = S.get('muted', '0') === '1';
  var ctx = null, cache = {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyMode() { document.documentElement.dataset.mode = mode; cache = {}; }
  applyMode();

  function tone(freq, dur, type, vol, when, slide) {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var t = ctx.currentTime + (when || 0), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur);
    } catch (e) { }
  }
  var sounds = {
    blip: function () { tone(660, .06); },
    eat: function () { tone(520, .06); tone(780, .08, 'square', .05, .06); },
    land: function () { tone(150, .08, 'triangle', .08); },
    clear: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .09, 'square', .05, i * .06); }); },
    hit: function () { tone(300, .05); tone(450, .05, 'square', .04, .04); },
    bounce: function () { tone(440, .05, 'triangle', .07); },
    flag: function () { tone(380, .05, 'square'); },
    flap: function () { tone(300, .12, 'square', .04, 0, 600); },
    shoot: function () { tone(900, .12, 'square', .03, 0, 200); },
    boom: function () { tone(160, .25, 'sawtooth', .07, 0, 40); },
    jump: function () { tone(280, .15, 'square', .04, 0, 560); },
    flip: function () { tone(500, .05, 'triangle', .06); },
    whack: function () { tone(200, .1, 'square', .07, 0, 90); },
    coin: function () { tone(988, .06, 'square', .05); tone(1319, .14, 'square', .05, .06); },
    win: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, .12, 'square', .05, i * .09); }); },
    lose: function () { [330, 262, 196, 130].forEach(function (f, i) { tone(f, .16, 'sawtooth', .05, i * .12); }); }
  };

  // ---- drawing helpers: smooth rounded shapes, cached as sprites ----
  var SC = Math.min(2, Math.max(1, Math.ceil(window.devicePixelRatio || 1)));
  var mixCache = {};
  function mix(hex, amt) {
    var key = hex + amt, hit = mixCache[key]; if (hit) return hit;
    var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16), r = n >> 16, g = n >> 8 & 255, b = n & 255, t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return (mixCache[key] = 'rgb(' + Math.round(r + (t - r) * p) + ',' + Math.round(g + (t - g) * p) + ',' + Math.round(b + (t - b) * p) + ')');
  }
  function path(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  var sprites = {}, nSprites = 0;
  function sprite(key, w, h, draw) {
    var s = sprites[key]; if (s) return s;
    if (nSprites > 400) { sprites = {}; nSprites = 0; }
    var c = document.createElement('canvas'); c.width = Math.ceil(w * SC); c.height = Math.ceil(h * SC);
    var x = c.getContext('2d'); x.scale(SC, SC); draw(x, w, h); nSprites++; return (sprites[key] = c);
  }
  function drawBlock(x, w, h, col, r) {
    path(x, 1, 1, w - 2, h - 2, r);
    var gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, mix(col, .35)); gr.addColorStop(.5, col); gr.addColorStop(1, mix(col, -.3));
    x.fillStyle = gr; x.fill(); x.lineWidth = 1.5; x.strokeStyle = 'rgba(10,6,24,.55)'; x.stroke();
    if (w > 10 && h > 10) {
      path(x, 3, 3, w - 6, h - 6, Math.max(1, r - 2)); x.lineWidth = 1; x.strokeStyle = 'rgba(255,255,255,.22)'; x.stroke();
      path(x, 4, 3, w - 8, h * .36, Math.max(1, r * .6)); x.fillStyle = 'rgba(255,255,255,.2)'; x.fill();
    }
  }

  // ---- particles, floating text, screen shake ----
  var parts = [], pops = [], shakeAmt = 0;

  var PP = window.PP = {
    S: SC, sprite: sprite,
    font: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
    sfx: function (n) { if (sounds[n]) sounds[n](); },
    best: function (game) { return parseFloat(S.get('best_' + game, '0')) || 0; },
    setBest: function (game, v, lowerBetter) {
      var b = this.best(game);
      if (!b || (lowerBetter ? v < b : v > b)) { S.set('best_' + game, v); return true; }
      return false;
    },
    css: function (n) { return cache[n] || (cache[n] = getComputedStyle(document.documentElement).getPropertyValue(n).trim()); },
    onMode: function (fn) { document.addEventListener('ppmode', fn); },
    night: function () { return document.documentElement.dataset.mode !== 'day'; },
    mix: mix, path: path,
    // set a canvas up for crisp, smooth drawing; logical size stays cv.lw x cv.lh
    hd: function (cv) { cv.lw = cv.width; cv.lh = cv.height; cv.width = cv.lw * SC; cv.height = cv.lh * SC; cv._S = SC; cv.style.width = cv.lw + 'px'; return cv; },
    // glossy rounded block (cached sprite)
    block: function (g, x, y, w, h, col, r) {
      w = Math.max(3, Math.round(w)); h = Math.max(3, Math.round(h)); r = Math.min(r === undefined ? Math.min(w, h) * .26 : r * 1.4, w / 2, h / 2);
      var rk = Math.round(r);
      g.drawImage(sprite('b' + col + w + 'x' + h + 'r' + rk, w, h, function (c, W, H) { drawBlock(c, W, H, col, rk); }), x, y, w, h);
    },
    // glossy ball
    orb: function (g, x, y, rad, col) {
      var d = Math.round(rad * 2);
      g.drawImage(sprite('o' + col + d, d + 2, d + 2, function (c, W) {
        var r = d / 2, gr = c.createRadialGradient(r * .7, r * .6, r * .1, r + 1, r + 1, r);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, mix(col, .35)); gr.addColorStop(.7, col); gr.addColorStop(1, mix(col, -.4));
        c.beginPath(); c.arc(r + 1, r + 1, r - .5, 0, 6.2832); c.fillStyle = gr; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(10,6,24,.5)'; c.stroke();
      }), x - rad - 1, y - rad - 1, d + 2, d + 2);
    },
    rr: function (g, x, y, w, h, r, fill, stroke, lw) {
      path(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = lw || 2; g.strokeStyle = stroke; g.stroke(); }
    },
    circ: function (g, x, y, r, fill, stroke, lw) {
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.lineWidth = lw || 2; g.strokeStyle = stroke; g.stroke(); }
    },
    ell: function (g, x, y, rx, ry, fill) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.2832); g.fillStyle = fill; g.fill(); },
    eye: function (g, x, y, r, dx, dy) {
      PP.circ(g, x, y, r, '#ffffff', 'rgba(10,6,24,.6)', 1.2); PP.circ(g, x + (dx || 0) * r * .35, y + (dy || 0) * r * .35, r * .5, '#0a0618');
    },
    // ---- character toolkit: shaded ellipses and rounded limbs with consistent outlines ----
    part: function (g, x, y, rx, ry, col, rot, noOutline) {
      g.save(); g.translate(x, y); if (rot) g.rotate(rot);
      var gr = g.createRadialGradient(-rx * .35, -ry * .45, Math.min(rx, ry) * .1, 0, 0, Math.max(rx, ry) * 1.1);
      gr.addColorStop(0, mix(col, .5)); gr.addColorStop(.55, col); gr.addColorStop(1, mix(col, -.35));
      g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 6.2832); g.fillStyle = gr; g.fill();
      if (!noOutline) { g.lineWidth = 1.6; g.strokeStyle = 'rgba(10,6,24,.6)'; g.stroke(); }
      g.restore();
    },
    limb: function (g, x1, y1, x2, y2, w, col) {
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = 'rgba(10,6,24,.65)'; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = col; g.lineWidth = w; g.stroke();
      g.strokeStyle = mix(col, .45); g.lineWidth = Math.max(1, w * .28); g.beginPath(); g.moveTo(x1 - w * .18, y1 - w * .18); g.lineTo(x2 - w * .18, y2 - w * .18); g.stroke();
    },
    // outlined polygon/curve path filled with a vertical gradient between bounds
    shape: function (g, y0, y1, col, drawPath) {
      g.beginPath(); drawPath(g);
      var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, mix(col, .4)); gr.addColorStop(.5, col); gr.addColorStop(1, mix(col, -.35));
      g.fillStyle = gr; g.fill(); g.lineWidth = 1.6; g.lineJoin = 'round'; g.strokeStyle = 'rgba(10,6,24,.6)'; g.stroke();
    },
    // cute eye with highlight; look direction dx,dy in -1..1
    eye2: function (g, x, y, r, dx, dy, lid) {
      PP.circ(g, x, y, r, '#fff', 'rgba(10,6,24,.65)', 1.3);
      var px = x + (dx || 0) * r * .3, py = y + (dy || 0) * r * .3;
      PP.circ(g, px, py, r * .62, '#1a1033'); PP.circ(g, px - r * .2, py - r * .22, r * .22, '#fff');
      if (lid) { g.fillStyle = lid; g.beginPath(); g.arc(x, y, r + .6, Math.PI, 0); g.lineTo(x + r, y - r * (1 - lid.k)); g.fill(); }
    },
    burst: function (x, y, col, n, spd) {
      if (reduce) n = Math.ceil((n || 12) / 3);
      n = Math.min(n || 12, 18);
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.283, s = (spd || 4) * (.3 + Math.random() * .9);
        parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 0, max: 24 + Math.random() * 20, col: col, sz: 2 + Math.random() * 3 });
      }
      if (parts.length > 160) parts.splice(0, parts.length - 160);
    },
    pop: function (text, x, y, col) { pops.push({ t: text, x: x, y: y, life: 0, col: col || '#ffd23f' }); },
    shake: function (a) { if (!reduce) shakeAmt = Math.max(shakeAmt, a); },
    // render loop: drawFn(dt) with dt in 60fps frames (clamped)
    run: function (cv, g, drawFn) {
      var last = performance.now(), sc = cv._S || 1;
      function frame(now) {
        var dt = Math.min(3, (now - last) / 16.667); last = now;
        if (document.hidden) { requestAnimationFrame(frame); return; }
        g.setTransform(sc, 0, 0, sc, 0, 0);
        g.save();
        if (shakeAmt > .3) { g.translate((Math.random() - .5) * shakeAmt * 2, (Math.random() - .5) * shakeAmt * 2); shakeAmt *= Math.pow(.88, dt); } else shakeAmt = 0;
        drawFn(dt);
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .25 * dt;
          if (p.life > p.max) { parts.splice(i, 1); continue; }
          g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.sz * (1 - p.life / p.max * .5), 0, 6.2832); g.fill();
        }
        g.globalAlpha = 1;
        if (pops.length) {
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 20px ' + PP.font; g.lineJoin = 'round'; g.lineWidth = 5; g.strokeStyle = '#0a0618';
          for (i = pops.length - 1; i >= 0; i--) {
            var q = pops[i]; q.life += dt; q.y -= .8 * dt;
            if (q.life > 42) { pops.splice(i, 1); continue; }
            g.globalAlpha = Math.min(1, (42 - q.life) / 15); g.strokeText(q.t, q.x, q.y); g.fillStyle = q.col; g.fillText(q.t, q.x, q.y);
          }
        }
        g.globalAlpha = 1; g.restore();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  };

  var GAMES = [['snake', 'Snake'], ['blocks', 'Block Stack'], ['2048', '2048'], ['breakout', 'Breakout'], ['mines', 'Minesweeper'], ['flappy', 'Flappy Hop'], ['invaders', 'Space Invaders'], ['runner', 'Pixel Runner'], ['memory', 'Memory Match'], ['whack', 'Whack-a-Mole']];
  var ACC = { snake: '#8cff5a', blocks: '#35e0ff', '2048': '#ffd23f', breakout: '#ff4f8b', mines: '#ff9442', flappy: '#7fd8ff', invaders: '#d44fff', runner: '#ff7a5a', memory: '#8a6bff', whack: '#b5733a' };
  PP.games = GAMES; PP.accent = ACC;
  document.addEventListener('DOMContentLoaded', function () {
    var m0 = location.pathname.match(/Games\/([^\/]+)\//), hh = document.querySelector('.handheld');
    if (m0 && hh) {
      var id = m0[1], i = GAMES.findIndex(function (q) { return q[0] === id; }), nx = GAMES[(i + 1) % GAMES.length];
      document.documentElement.style.setProperty('--c', ACC[id] || '#ffd23f');
      var a = document.createElement('a'); a.className = 'next'; a.href = '../' + nx[0] + '/index.html'; a.innerHTML = 'Next game <b>' + nx[1] + '</b> &gt;'; hh.appendChild(a);
    }
    var m = document.getElementById('mode-btn'), s = document.getElementById('sound-btn');
    function paint() {
      if (m) { m.setAttribute('aria-checked', mode === 'night'); m.setAttribute('aria-label', 'Night mode'); }
      if (s) { s.setAttribute('aria-checked', !muted); }
    }
    paint();
    if (m) m.addEventListener('click', function () {
      mode = mode === 'day' ? 'night' : 'day'; S.set('mode', mode); applyMode(); paint();
      document.dispatchEvent(new Event('ppmode'));
    });
    if (s) s.addEventListener('click', function () { muted = !muted; S.set('muted', muted ? '1' : '0'); paint(); if (!muted) sounds.blip(); });
  });
})();
