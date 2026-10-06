/* ============================================================================
   core.js — shared engine for the portfolio mockups.
   Art direction lives in each mockup's own CSS/markup; this file only holds
   the moving parts all three share: starfield, cursor, clock, audio player.
   ========================================================================= */
(function (global) {
  'use strict';

  var TAU = Math.PI * 2;
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* --------------------------------------------------------------------------
     STARFIELD
     Parallax star layers + twinkle + slow drift, with a click shockwave that
     shoves stars outward along a travelling ring before they settle back.
     ----------------------------------------------------------------------- */
  function createStarfield(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var layers = opts.layers || [
      { count: 260, size: [0.4, 0.9], depth: 0.25, alpha: [0.25, 0.55], color: '#ffffff' },
      { count: 120, size: [0.8, 1.5], depth: 0.6,  alpha: [0.4, 0.85], color: '#ffffff' },
      { count: 34,  size: [1.4, 2.4], depth: 1.0,  alpha: [0.6, 1.0],  color: '#ffffff' }
    ];
    var drift = opts.drift || { x: -2.5, y: 0.6 };      // px per second
    var parallax = opts.parallax == null ? 26 : opts.parallax;
    var twinkle = opts.twinkle !== false;
    // each star also wanders on its own slow loop, so the field breathes even when
    // nothing is moving. {amp: px, speed: rad/s}
    var float = opts.float || null;
    // gravity: the mouse bends nearby stars toward it. {radius, pull: px, swirl}
    var gravity = opts.gravity || null;
    // all motion maths runs on `mt`; dt is capped so a backgrounded tab does not leap ahead
    var mt = 0, last = performance.now();
    var gStr = 0, gx = 0, gy = 0, gTx = 0, gTy = 0, mouseIn = false;
    var rippleCfg = Object.assign(
      { speed: 620, width: 46, amplitude: 34, life: 1.9, ring: true, ringColor: '255,255,255', ringAlpha: 0.1 },
      opts.ripple || {}
    );
    var shooting = opts.shooting || null;               // {every:[min,max], speed, len}
    var alphaBoost = 1;                                 // light mode needs darker specks to read

    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var stars = [];
    var ripples = [];
    var shots = [];
    var mx = 0.5, my = 0.5;      // normalised pointer
    var px = 0.5, py = 0.5;      // smoothed pointer
    var t0 = performance.now();
    var raf;
    var nextShot = rand(1200, 4200);

    function build() {
      stars = [];
      layers.forEach(function (L, li) {
        for (var i = 0; i < L.count; i++) {
          stars.push({
            nx: Math.random(), ny: Math.random(),
            r: rand(L.size[0], L.size[1]),
            a: rand(L.alpha[0], L.alpha[1]),
            depth: L.depth,
            color: L.color,
            phase: Math.random() * TAU,
            tw: rand(0.4, 1.6),
            ox: 0, oy: 0,        // ripple offset
            gx: 0, gy: 0,        // gravity offset
            fp: Math.random() * TAU, fq: Math.random() * TAU,   // float phases
            fs: rand(0.6, 1.4), fr: rand(0.5, 1),               // float speed / reach
            layer: li
          });
        }
      });
    }

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.1);   // a backgrounded tab must not leap ahead
      last = now;
      mt += dt;
      var t = mt;
      ctx.clearRect(0, 0, W, H);

      px = lerp(px, mx, 0.055);
      py = lerp(py, my, 0.055);
      // gravity strength eases in/out; the pointer it chases is smoothed too
      gStr = lerp(gStr, mouseIn ? 1 : 0, 0.07);
      gx = lerp(gx, gTx, 0.22); gy = lerp(gy, gTy, 0.22);
      var offX = (px - 0.5) * parallax;
      var offY = (py - 0.5) * parallax;

      // prune dead ripples
      for (var ri = ripples.length - 1; ri >= 0; ri--) {
        if ((now - ripples[ri].t) / 1000 > rippleCfg.life) ripples.splice(ri, 1);
      }

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var x = s.nx * W + offX * s.depth + drift.x * t * s.depth;
        var y = s.ny * H + offY * s.depth + drift.y * t * s.depth;
        if (float) {
          // nearer stars wander further, which reads as depth
          var fa = float.amp * s.fr * (0.4 + s.depth);
          x += Math.sin(t * float.speed * s.fs + s.fp) * fa;
          y += Math.cos(t * float.speed * s.fs * 0.8 + s.fq) * fa;
        }
        // wrap
        x = ((x % W) + W) % W;
        y = ((y % H) + H) % H;

        // gravity well: stars fall toward the pointer, curving slightly as they go
        var pgx = 0, pgy = 0, gl = 0;
        if (gravity && gStr > 0.003) {
          var ddx = gx - x, ddy = gy - y;
          var dd = Math.sqrt(ddx * ddx + ddy * ddy) || 0.0001;
          if (dd < gravity.radius) {
            var f = 1 - dd / gravity.radius;
            f *= f;
            var stp = Math.min(f * gStr * gravity.pull * (0.35 + s.depth * 0.9), dd * 0.7);
            var ux = ddx / dd, uy = ddy / dd;
            pgx = ux * stp - uy * stp * gravity.swirl;
            pgy = uy * stp + ux * stp * gravity.swirl;
            gl = f * gStr;
          }
        }
        s.gx = lerp(s.gx, pgx, 0.16);
        s.gy = lerp(s.gy, pgy, 0.16);

        // shockwave displacement
        var dx = 0, dy = 0, boost = 0;
        for (var r = 0; r < ripples.length; r++) {
          var R = ripples[r];
          var age = (now - R.t) / 1000;
          var radius = age * rippleCfg.speed;
          var vx = x - R.x, vy = y - R.y;
          var d = Math.sqrt(vx * vx + vy * vy) || 0.0001;
          var band = d - radius;
          var infl = Math.exp(-(band * band) / (2 * rippleCfg.width * rippleCfg.width));
          if (infl < 0.004) continue;
          var decay = 1 - age / rippleCfg.life;
          var push = infl * rippleCfg.amplitude * R.k * decay * decay * (0.45 + s.depth);
          dx += (vx / d) * push;
          dy += (vy / d) * push;
          boost = Math.max(boost, infl * decay * R.k);
        }
        s.ox = lerp(s.ox, dx, 0.28);
        s.oy = lerp(s.oy, dy, 0.28);

        var alpha = s.a;
        if (twinkle) alpha *= 0.62 + 0.38 * Math.sin(t * s.tw + s.phase);
        alpha = clamp(alpha * alphaBoost + boost * 0.9 + gl * 0.35, 0, 1);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        var rr = s.r * (1 + boost * 0.8 + gl * 0.5);
        ctx.beginPath();
        ctx.arc(x + s.ox + s.gx, y + s.oy + s.gy, rr, 0, TAU);
        ctx.fill();
      }

      // the travelling ring itself
      if (rippleCfg.ring) {
        for (var k = 0; k < ripples.length; k++) {
          var Rk = ripples[k];
          var agek = (now - Rk.t) / 1000;
          var radk = agek * rippleCfg.speed;
          var fade = 1 - agek / rippleCfg.life;
          ctx.globalAlpha = rippleCfg.ringAlpha * Rk.k * fade * fade;
          ctx.strokeStyle = 'rgba(' + rippleCfg.ringColor + ',1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(Rk.x, Rk.y, radk, 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = rippleCfg.ringAlpha * Rk.k * fade * fade * 0.5;
          ctx.beginPath();
          ctx.arc(Rk.x, Rk.y, radk * 0.72, 0, TAU);
          ctx.stroke();
        }
      }

      // occasional shooting star
      if (shooting) {
        nextShot -= 16;
        if (nextShot <= 0) {
          nextShot = rand(shooting.every[0], shooting.every[1]);
          shots.push({ x: rand(0, W), y: rand(0, H * 0.6), vx: rand(-1, -0.35) * shooting.speed, vy: rand(0.2, 0.6) * shooting.speed, life: 1 });
        }
        for (var si = shots.length - 1; si >= 0; si--) {
          var sh = shots[si];
          sh.x += sh.vx / 60; sh.y += sh.vy / 60; sh.life -= 0.012;
          if (sh.life <= 0) { shots.splice(si, 1); continue; }
          var g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.06, sh.y - sh.vy * 0.06);
          g.addColorStop(0, 'rgba(255,255,255,' + (sh.life * 0.8) + ')');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - sh.vx * 0.06, sh.y - sh.vy * 0.06); ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onMove(e) { mx = e.clientX / global.innerWidth; my = e.clientY / global.innerHeight; }
    // gravity follows a real mouse only; a finger (or the synthetic mouse events a
    // tap produces) must not bend the sky
    function onPointerMove(e) {
      if (e.pointerType !== 'mouse') return;
      gTx = e.clientX; gTy = e.clientY;
      if (!mouseIn) { gx = gTx; gy = gTy; mouseIn = true; }
    }
    // Mouse: the full shockwave on press, exactly as before. Touch/pen: pressing
    // to scroll or swipe must not splash, so only a quick, still tap makes one,
    // and a gentler one (k scales displacement, boost and ring).
    var TOUCH_K = 0.35, touchDown = null;
    function onDown(e) {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        touchDown = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
        return;
      }
      ripples.push({ x: e.clientX, y: e.clientY, t: performance.now(), k: 1 });
    }
    function onUp(e) {
      var d = touchDown;
      if (!d || d.id !== e.pointerId) return;
      touchDown = null;
      var now = performance.now();
      if (now - d.t < 250 && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) {
        ripples.push({ x: e.clientX, y: e.clientY, t: now, k: TOUCH_K });
      }
    }
    function onCancel() { touchDown = null; }   // the browser took the gesture to scroll

    resize(); build();
    global.addEventListener('resize', function () { resize(); });
    global.addEventListener('mousemove', onMove, { passive: true });
    global.addEventListener('pointerdown', onDown, { passive: true });
    global.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', function () { mouseIn = false; });
    global.addEventListener('pointerup', onUp, { passive: true });
    global.addEventListener('pointercancel', onCancel, { passive: true });
    raf = requestAnimationFrame(frame);

    return {
      ripple: function (x, y) { ripples.push({ x: x, y: y, t: performance.now(), k: 1 }); },
      // recolour a live field without rebuilding it — used by the theme toggle
      setPalette: function (opts) {
        if (opts.layers) {
          stars.forEach(function (s) {
            if (opts.layers[s.layer]) s.color = opts.layers[s.layer];
          });
        }
        if (opts.ringColor) rippleCfg.ringColor = opts.ringColor;
        if (opts.ringAlpha != null) rippleCfg.ringAlpha = opts.ringAlpha;
        if (opts.alphaBoost != null) alphaBoost = opts.alphaBoost;
      },
      destroy: function () { cancelAnimationFrame(raf); }
    };
  }

  /* --------------------------------------------------------------------------
     SPOTLIGHT — radial-gradient light that follows the pointer.
     Adapted from the spotlight-cursor component, with pointer smoothing added.
     ----------------------------------------------------------------------- */
  function createSpotlight(canvas, config) {
    config = Object.assign(
      { radius: 260, brightness: 0.1, color: '#ffffff', smoothing: 0.14, blend: 'screen' },
      config || {}
    );
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var tx = -2000, ty = -2000, x = -2000, y = -2000;
    var raf;
    canvas.style.mixBlendMode = config.blend;

    function hexToRgb(hex) {
      var n = parseInt(hex.slice(1), 16);
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }
    var rgb = hexToRgb(config.color);

    function resize() {
      canvas.width = Math.floor(global.innerWidth * dpr);
      canvas.height = Math.floor(global.innerHeight * dpr);
      canvas.style.width = global.innerWidth + 'px';
      canvas.style.height = global.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
      x = lerp(x, tx, config.smoothing);
      y = lerp(y, ty, config.smoothing);
      if (tx > -1000) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, config.radius);
        g.addColorStop(0, 'rgba(' + rgb + ',' + config.brightness + ')');
        g.addColorStop(0.45, 'rgba(' + rgb + ',' + config.brightness * 0.35 + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, global.innerWidth, global.innerHeight);
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    global.addEventListener('resize', resize);
    global.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('mouseleave', function () { tx = -2000; ty = -2000; });
    raf = requestAnimationFrame(draw);
    return {
      setConfig: function (c) {
        if (c.color) { config.color = c.color; rgb = hexToRgb(c.color); }
        if (c.brightness != null) config.brightness = c.brightness;
        if (c.radius != null) config.radius = c.radius;
        // on a light background 'screen' is a no-op; 'multiply' casts a soft shadow
        if (c.blend) { config.blend = c.blend; canvas.style.mixBlendMode = c.blend; }
      },
      destroy: function () { cancelAnimationFrame(raf); }
    };
  }

  /* --------------------------------------------------------------------------
     CURSOR — smoothed reticle/orb that trails the true pointer, with an
     optional comet tail and a magnetic pull toward [data-magnet] elements.
     ----------------------------------------------------------------------- */
  function createCursor(opts) {
    opts = Object.assign(
      { smoothing: 0.18, ringSmoothing: 0.1, trail: 0, trailColor: '255,255,255',
        magnet: true, magnetRadius: 90, ringRotate: true, hoverSelector: 'a,button,[data-hover]' },
      opts || {}
    );
    var root = document.createElement('div');
    root.className = 'cur-root';
    var dot = document.createElement('div'); dot.className = 'cur-dot';
    var ring = document.createElement('div'); ring.className = 'cur-ring';
    root.appendChild(ring); root.appendChild(dot);
    document.body.appendChild(root);

    var trailCanvas = null, tctx = null, history = [];
    if (opts.trail) {
      trailCanvas = document.createElement('canvas');
      trailCanvas.className = 'cur-trail';
      document.body.appendChild(trailCanvas);
      tctx = trailCanvas.getContext('2d');
    }

    var tx = global.innerWidth / 2, ty = global.innerHeight / 2;
    var dx = tx, dy = ty, rx = tx, ry = ty;
    var vel = 0, down = false, hovering = null;
    var dpr = Math.min(global.devicePixelRatio || 1, 2);

    function sizeTrail() {
      if (!trailCanvas) return;
      trailCanvas.width = Math.floor(global.innerWidth * dpr);
      trailCanvas.height = Math.floor(global.innerHeight * dpr);
      trailCanvas.style.width = global.innerWidth + 'px';
      trailCanvas.style.height = global.innerHeight + 'px';
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeTrail();
    global.addEventListener('resize', sizeTrail);

    global.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      var el = e.target instanceof Element ? e.target.closest(opts.hoverSelector) : null;
      if (el !== hovering) {
        hovering = el;
        root.classList.toggle('is-hover', !!el);
        root.dataset.label = (el && el.dataset.hover) || '';
      }
    }, { passive: true });
    global.addEventListener('pointerdown', function () { down = true; root.classList.add('is-down'); });
    global.addEventListener('pointerup', function () { down = false; root.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { root.classList.add('is-out'); });
    document.addEventListener('mouseenter', function () { root.classList.remove('is-out'); });

    function tick() {
      var gx = tx, gy = ty;
      // magnetic snap: the reticle is pulled into the centre of a hovered target
      if (opts.magnet && hovering) {
        var b = hovering.getBoundingClientRect();
        var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var d = Math.hypot(tx - cx, ty - cy);
        var pull = clamp(1 - d / (Math.max(b.width, b.height) / 2 + opts.magnetRadius), 0, 1);
        gx = lerp(tx, cx, pull * 0.55);
        gy = lerp(ty, cy, pull * 0.55);
      }
      var pdx = dx, pdy = dy;
      dx = lerp(dx, gx, opts.smoothing);
      dy = lerp(dy, gy, opts.smoothing);
      rx = lerp(rx, gx, opts.ringSmoothing);
      ry = lerp(ry, gy, opts.ringSmoothing);
      vel = lerp(vel, Math.hypot(dx - pdx, dy - pdy), 0.2);

      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) translate(-50%,-50%)';
      // ring lags and stretches along the direction of travel
      if (opts.ringRotate) {
        var ang = Math.atan2(dy - ry, dx - rx) * 180 / Math.PI;
        var stretch = clamp(1 + vel * 0.022, 1, 1.5);
        ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%) rotate(' + ang + 'deg) scale(' + stretch + ',' + (1 / stretch) + ')';
      } else {
        ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      }
      root.style.setProperty('--vel', vel.toFixed(2));

      if (tctx) {
        history.push({ x: dx, y: dy });
        if (history.length > opts.trail) history.shift();
        tctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
        for (var i = 1; i < history.length; i++) {
          var p = history[i - 1], q = history[i];
          var f = i / history.length;
          tctx.strokeStyle = 'rgba(' + opts.trailColor + ',' + (f * f * 0.5) + ')';
          tctx.lineWidth = f * 2.6;
          tctx.lineCap = 'round';
          tctx.beginPath(); tctx.moveTo(p.x, p.y); tctx.lineTo(q.x, q.y); tctx.stroke();
        }
      }
      requestAnimationFrame(tick);
    }
    tick();

    return { el: root, pos: function () { return { x: dx, y: dy }; } };
  }

  /* --------------------------------------------------------------------------
     CLOCK — live time in a named IANA zone.
     ----------------------------------------------------------------------- */
  function createClock(tz, onTick, interval) {
    var partsFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZoneName: 'short'
    });
    function read() {
      var now = new Date();
      var o = {};
      partsFmt.formatToParts(now).forEach(function (p) { o[p.type] = p.value; });
      if (o.hour === '24') o.hour = '00';
      o.monthLong = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'long' }).format(now);
      o.weekdayLong = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(now);
      o.date = now;
      // fraction of the local day elapsed — handy for orbit/arc visuals
      o.dayFraction = (Number(o.hour) * 3600 + Number(o.minute) * 60 + Number(o.second)) / 86400;
      return o;
    }
    onTick(read());
    var id = setInterval(function () { onTick(read()); }, interval || 250);
    return { stop: function () { clearInterval(id); }, read: read };
  }

  /* --------------------------------------------------------------------------
     PLAYER — playlist over a single <audio>, plus a lazily-built analyser so
     mockups can draw a real spectrum instead of a fake one.
     ----------------------------------------------------------------------- */
  function createPlayer(tracks, handlers) {
    handlers = handlers || {};
    var audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    var index = 0, actx = null, analyser = null, freq = null;

    function emit() {
      handlers.onState && handlers.onState({
        index: index,
        track: tracks[index],
        playing: !audio.paused && !audio.ended,
        current: audio.currentTime || 0,
        duration: isFinite(audio.duration) ? audio.duration : 0,
        buffered: audio.buffered.length ? audio.buffered.end(audio.buffered.length - 1) : 0
      });
    }

    function ensureAnalyser() {
      if (actx) return;
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      try {
        actx = new AC();
        var src = actx.createMediaElementSource(audio);
        analyser = actx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;
        src.connect(analyser);
        analyser.connect(actx.destination);
        freq = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) { /* analyser is a nice-to-have; audio still plays */ }
    }

    function load(i, autoplay) {
      index = (i + tracks.length) % tracks.length;
      audio.src = tracks[index].src;
      audio.load();
      emit();
      if (autoplay) play();
    }

    function play() {
      ensureAnalyser();
      if (actx && actx.state === 'suspended') actx.resume();
      if (!audio.src) load(index, false);
      var p = audio.play();
      if (p && p.catch) p.catch(function () { emit(); });
    }

    audio.addEventListener('timeupdate', emit);
    audio.addEventListener('durationchange', emit);
    audio.addEventListener('play', emit);
    audio.addEventListener('pause', emit);
    audio.addEventListener('progress', emit);
    audio.addEventListener('ended', function () { load(index + 1, true); });

    // prime the first track so the UI shows a real title/duration before play
    load(0, false);

    return {
      audio: audio,
      tracks: tracks,
      get index() { return index; },
      play: play,
      pause: function () { audio.pause(); },
      toggle: function () { audio.paused ? play() : audio.pause(); },
      next: function () { load(index + 1, true); },
      prev: function () { audio.currentTime > 3 ? (audio.currentTime = 0) : load(index - 1, true); },
      select: function (i) { i === index && audio.src ? this.toggle() : load(i, true); },
      seek: function (frac) { if (isFinite(audio.duration)) audio.currentTime = audio.duration * clamp(frac, 0, 1); },
      setVolume: function (v) { audio.volume = clamp(v, 0, 1); },
      spectrum: function () {
        if (!analyser) return null;
        analyser.getByteFrequencyData(freq);
        return freq;
      }
    };
  }

  function fmtTime(s) {
    if (!isFinite(s)) return '0:00';
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  global.SpaceCore = {
    createStarfield: createStarfield,
    createSpotlight: createSpotlight,
    createCursor: createCursor,
    createClock: createClock,
    createPlayer: createPlayer,
    fmtTime: fmtTime,
    lerp: lerp, clamp: clamp, rand: rand
  };
})(window);
