/* ============================================================================
   site.js — Andrew Addo portfolio. Telemetry shell, six views, one dashboard
   that never reloads: the chrome stays lit, the centre screen swaps.
   ========================================================================= */
(function () {
  'use strict';
  var S = window.SpaceCore;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------------- field */
  var field = S.createStarfield($('stars'), {
    parallax: 20,
    drift: { x: -1.1, y: .25 },
    layers: [
      { count: 340, size: [.35, .8], depth: .2,  alpha: [.18, .45], color: '#ffffff' },
      { count: 120, size: [.7, 1.3], depth: .55, alpha: [.3, .7],   color: '#cfe6ff' },
      { count: 26,  size: [1.2, 2.0],depth: 1,   alpha: [.5, .95],  color: '#8ad7ff' }
    ],
    ripple: { speed: 700, width: 38, amplitude: 26, life: 1.6, ringColor: '138,215,255', ringAlpha: .2 }
  });
  var spot = S.createSpotlight($('spot'), { radius: 220, brightness: .07, color: '#8ad7ff', smoothing: .2 });

  var cur = S.createCursor({
    smoothing: .3, ringSmoothing: .16, magnet: false, ringRotate: false,
    hoverSelector: 'a,button,[data-hover],input,textarea,.wave,.bigwave,.trow,.pitem'
  });

  var sX = $('scanX'), sY = $('scanY'), ro = $('readout'), cxy = $('curXY');
  (function scan() {
    var p = cur.pos();
    sX.style.transform = 'translateY(' + p.y + 'px)';
    sY.style.transform = 'translateX(' + p.x + 'px)';
    ro.style.transform = 'translate(' + (p.x + 18) + 'px,' + (p.y + 16) + 'px)';
    var xs = String(Math.round(p.x)).padStart(4, '0'), ys = String(Math.round(p.y)).padStart(4, '0');
    ro.textContent = 'X ' + xs + ' · Y ' + ys;
    cxy.textContent = xs + ' / ' + ys;
    requestAnimationFrame(scan);
  })();

  /* -------------------------------------------------------------- content */
  /* Descriptions drafted from each repo's README -- correct them freely. */
  var PROJECTS = [
    { t: 'Nhoma Dashboard',
      d: 'Pig farm management app: a herd ledger tracking breeding and 114-day gestation, weight history, market readiness and alerts.',
      stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'], y: '2026', s: 'GITHUB',
      url: 'https://github.com/djkcrazh/nhoma' },

    { t: 'Bottle Builders LLC',
      d: 'Five-page site for a bottle recycling company, drawn as an architectural blueprint.',
      stack: ['HTML', 'CSS', 'JavaScript', 'Vercel'], y: '2026', s: 'GITHUB',
      url: 'https://github.com/djkcrazh/Bottle-Builders-LLC' },

    { t: 'Kairosz',
      d: 'Beat compilation from Summer 2026.',
      stack: ['Ableton', 'Sound design'], y: '2026', s: 'SOUNDCLOUD',
      url: 'https://soundcloud.com/djkcrazh/sets/kairosz' }
  ];

  /* Levels are placeholders chosen to honour the order and ties you gave --
     tune the numbers here, the bars and readouts follow. */
  var SKILLS = [
    { section: 'Engineer', panels: [
      { g: 'Languages', items: [
        ['Python', 94], ['Java', 86], ['R', 80],
        ['TypeScript', 74], ['JavaScript', 70], ['SQL', 63], ['MATLAB', 55]
      ]},
      { g: 'Frameworks & Libraries', items: [
        ['React', 88], ['Next.js', 79], ['NumPy', 68], ['Matplotlib', 68]
      ]}
    ]},
    { section: 'Artist', panels: [
      { g: 'Music & Performance', items: [
        ['Music Production', 93], ['Sound Design', 82],
        ['Jazz Piano', 71], ['Classical Piano', 71], ['Percussion', 44]
      ]}
    ]}
  ];

  (function buildProjects() {
    var wrap = $('plist');
    PROJECTS.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'pitem';
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.dataset.hover = p.s;
      a.innerHTML =
        '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span><span class="t">' + p.t + '</span><div class="d">' + p.d + '</div>' +
        '<div class="stack">' + p.stack.map(function (s) { return '<em>' + s + '</em>'; }).join('') + '</div></span>' +
        '<span class="meta"><b>' + p.s + '</b>' + p.y + '<span class="ext">&#8599;</span></span>';
      wrap.appendChild(a);
    });
  })();

  (function buildSkills() {
    var wrap = $('skstack');
    SKILLS.forEach(function (sec, si) {
      var block = document.createElement('div');
      block.className = 'sksec';
      block.innerHTML = '<div class="sksec-h"><span class="sn">' +
        String(si + 1).padStart(2, '0') + '</span><h3>' + sec.section + '</h3><span class="rule"></span></div>';

      sec.panels.forEach(function (pan) {
        var d = document.createElement('div');
        d.className = 'skpanel';
        d.innerHTML = '<h4><span>' + pan.g + '</span><em>' + pan.items.length + '</em></h4>' +
          pan.items.map(function (it) {
            return '<div class="skrow"><span class="nm">' + it[0] + '</span>' +
                   '<span class="mb"><i data-w="' + it[1] + '"></i></span></div>';
          }).join('');
        block.appendChild(d);
      });
      wrap.appendChild(block);
    });
  })();

  /* --------------------------------------------------- name / Aurebesh flash
     Latin for 3s, Aurebesh for 0.5s. The swap is a decode: every letter
     independently scrambles through junk glyphs (flickering between both
     alphabets) and locks into its target, staggered left to right, under a
     chromatic band-slice and a scan sweep. */
  var NAME = 'Andrew Addo';
  var POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var GLITCH_MS = 340;                    // must match the CSS animation length

  var nameEl = $('nameGlyph'), glyphs = $('glyphs');
  var ghosts = [$('ghost1'), $('ghost2')];
  var cells = [], isAure = false, busy = false, onHome = true;

  if (document.fonts && document.fonts.load) document.fonts.load('60px Aurebesh');

  (function buildName() {
    NAME.split('').forEach(function (ch) {
      var b = document.createElement('b');
      var space = ch === ' ';
      if (space) { b.innerHTML = '&nbsp;'; b.dataset.sp = '1'; }
      else b.textContent = ch;
      glyphs.appendChild(b);
      cells.push({ el: b, ch: ch, space: space });
    });
    syncGhosts();
  })();

  // the chromatic ghosts are literal copies — clip-path and blend do the rest
  function syncGhosts() {
    var html = glyphs.innerHTML;
    ghosts[0].innerHTML = html;
    ghosts[1].innerHTML = html;
  }

  function decode(toAure) {
    if (busy) return;
    busy = true;
    nameEl.classList.add('glitching');

    var live = 0;
    cells.forEach(function (c) { if (!c.space) live++; });
    var done = 0;

    cells.forEach(function (c, i) {
      if (c.space) { c.el.className = toAure ? 'aure' : ''; return; }
      setTimeout(function () {
        var n = 0;
        (function step() {
          if (n < 3) {
            // junk glyph, and a coin-flip on which alphabet renders it
            c.el.textContent = POOL[(Math.random() * POOL.length) | 0];
            c.el.className = Math.random() < 0.5 ? 'scram aure' : 'scram';
            n++;
            syncGhosts();
            setTimeout(step, 40);
          } else {
            c.el.textContent = c.ch;
            c.el.className = toAure ? 'aure' : '';
            syncGhosts();
            if (++done === live) {
              setTimeout(function () {
                nameEl.classList.remove('glitching');
                busy = false;
              }, 40);
            }
          }
        })();
      }, i * 16);
    });
  }

  (function holoLoop() {
    setTimeout(function () {
      if (!onHome) { holoLoop(); return; }   // no point animating an off-screen view
      isAure = !isAure;
      decode(isAure);
      holoLoop();
    }, isAure ? 500 + GLITCH_MS : 3000);
  })();

  /* -------------------------------------------------------------- routing */
  var VIEWS = ['home', 'about', 'projects', 'skills', 'sound', 'contact'];
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navlist a'));

  function go(view, push) {
    if (VIEWS.indexOf(view) === -1) view = 'home';
    VIEWS.forEach(function (v) { $('v-' + v).classList.toggle('on', v === view); });
    navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.view === view); });
    $('curView').textContent = view.toUpperCase();
    $('screen').scrollTop = 0;
    onHome = view === 'home';
    $('attitude').style.opacity = onHome ? '1' : '0';
    document.title = view === 'home' ? 'Andrew Addo' : 'Andrew Addo — ' + view[0].toUpperCase() + view.slice(1);
    if (view === 'skills') {
      // let the bars grow in every time the view is entered
      document.querySelectorAll('#skstack .mb i').forEach(function (i) { i.style.width = '0'; });
      setTimeout(function () {
        document.querySelectorAll('#skstack .mb i').forEach(function (i) { i.style.width = i.dataset.w + '%'; });
      }, 60);
    }
    if (push && location.hash !== '#' + view) history.pushState(null, '', '#' + view);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var v = a.getAttribute('href').slice(1);
    if (VIEWS.indexOf(v) === -1) return;
    e.preventDefault();
    go(v, true);
  });
  window.addEventListener('popstate', function () { go(location.hash.slice(1), false); });
  go(location.hash.slice(1) || 'home', false);

  /* ----------------------------------------------------- clock + solar ---- */
  var LAT = 41.7701, LON = -72.3051;
  function solar(date) {
    var start = new Date(date.getFullYear(), 0, 0);
    var doy = Math.floor((date - start) / 864e5);
    var decl = 0.4093 * Math.sin(2 * Math.PI * (doy - 81) / 365);
    var cosH = -Math.tan(LAT * Math.PI / 180) * Math.tan(decl);
    if (cosH > 1 || cosH < -1) return null;
    var H = Math.acos(cosH) * 180 / Math.PI / 15;
    var eot = 9.87 * Math.sin(4 * Math.PI * (doy - 81) / 365)
            - 7.53 * Math.cos(2 * Math.PI * (doy - 81) / 365)
            - 1.5 * Math.sin(2 * Math.PI * (doy - 81) / 365);
    var noon = 12 - LON / 15 - eot / 60;
    return { riseUTC: noon - H, setUTC: noon + H };
  }
  function toLocal(h, off) {
    var v = (h + off + 24) % 24, hh = Math.floor(v), mm = Math.round((v - hh) * 60);
    if (mm === 60) { hh = (hh + 1) % 24; mm = 0; }
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }
  var arc = $('arc'), CIRC = 2 * Math.PI * 42;

  S.createClock('America/New_York', function (c) {
    $('hm').textContent = c.hour + ':' + c.minute;
    $('ss').textContent = c.second;
    $('dstr').textContent = c.weekday + ' · ' + c.month + ' ' + Number(c.day) + ' · ' + c.year;
    $('tz').textContent = c.timeZoneName;
    $('utc').textContent = new Date().toISOString().slice(11, 19);
    $('dayPct').textContent = (c.dayFraction * 100).toFixed(1) + '%';
    arc.setAttribute('stroke-dashoffset', CIRC * (1 - c.dayFraction));

    var now = new Date();
    var utcH = now.getUTCHours() + now.getUTCMinutes() / 60;
    var locH = Number(c.hour) + Number(c.minute) / 60;
    var off = Math.round(locH - utcH);
    if (off > 12) off -= 24; if (off < -12) off += 24;
    var s = solar(now);
    if (s) { $('sunrise').textContent = toLocal(s.riseUTC, off); $('sunset').textContent = toLocal(s.setUTC, off); }
  }, 250);

  /* ------------------------------------------------------------- systems */
  /* Bars are fixed in the markup (Engineer 80 / Creative 75 / Athlete 50) --
     no drift, no readouts. */

  var LOGS = ['field stable', 'awaiting content payload', 'five transmissions cached',
              'chronometer synced · america/new_york', 'parallax within tolerance', 'origin record locked'];
  var li = 2, logEl = $('log');
  setInterval(function () {
    var d = document.createElement('div');
    d.innerHTML = '<span>»</span>' + LOGS[li++ % LOGS.length];
    logEl.appendChild(d);
    while (logEl.children.length > 4) logEl.removeChild(logEl.firstChild);
  }, 5200);

  /* -------------------------------------------------------------- player */
  var PLAY = 'M8 5v14l11-7z', PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';
  var st = { progress: 0, playing: false, index: 0 };

  var player = S.createPlayer(window.TRACKS, { onState: function (s) {
    st.progress = s.duration ? s.current / s.duration : 0;
    st.playing = s.playing; st.index = s.index;

    $('trkTitle').textContent = s.track.title;
    $('trkCode').textContent = s.track.code;
    $('tCur').textContent = S.fmtTime(s.current);
    $('tDur').textContent = S.fmtTime(s.duration);
    $('ppIcon').firstElementChild.setAttribute('d', s.playing ? PAUSE : PLAY);
    $('feedTrk').textContent = s.playing ? s.track.code : 'IDLE';

    $('sNow').textContent = (s.playing ? 'Now playing / ' : 'Cued / ') + s.track.title;
    $('sCur').textContent = S.fmtTime(s.current);
    $('sDur').textContent = S.fmtTime(s.duration);

    Array.prototype.forEach.call($('txlist').children, function (b, i) { b.classList.toggle('on', i === s.index); });
    Array.prototype.forEach.call($('tlist').children, function (b, i) {
      b.classList.toggle('on', i === s.index);
      b.classList.toggle('playing', i === s.index && s.playing);
    });
  }});

  window.TRACKS.forEach(function (t, i) {
    var b = document.createElement('button');
    b.dataset.hover = 'CUE';
    b.innerHTML = '<span class="n">' + String(i + 1).padStart(2, '0') + '</span><span>' + t.title +
                  '</span><span class="d">' + t.code + '</span>';
    b.onclick = function () { player.select(i); };
    $('txlist').appendChild(b);

    var r = document.createElement('button');
    r.className = 'trow'; r.type = 'button'; r.dataset.hover = 'PLAY';
    r.innerHTML =
      '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="pp"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
      '<span class="eq"><i></i><i></i><i></i></span>' +
      '<span class="tt">' + t.title + '</span>' +
      '<span class="cd">' + t.code + '</span>' +
      '<span class="du" data-dur>--:--</span>';
    r.onclick = function () { player.select(i); };
    $('tlist').appendChild(r);

    // read each file's duration once so the Sound list is populated up front
    var probe = new Audio(); probe.preload = 'metadata'; probe.src = t.src;
    probe.addEventListener('loadedmetadata', function () {
      r.querySelector('[data-dur]').textContent = S.fmtTime(probe.duration);
    });
  });

  $('toggle').onclick = function () { player.toggle(); };
  $('next').onclick = function () { player.next(); };
  $('prev').onclick = function () { player.prev(); };

  /* ------------------------------------------------------------ waveforms */
  var WAVE = { on: '', off: '', head: '' };
  var BARS = 72, shape = [];
  for (var i = 0; i < BARS; i++) shape.push(0.18 + Math.abs(Math.sin(i * 0.63)) * 0.5 + Math.random() * 0.3);
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function wireWave(canvas, bars, playheadWidth) {
    var cx = canvas.getContext('2d');
    function size() {
      canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', size);
    canvas.onclick = function (e) {
      var r = canvas.getBoundingClientRect();
      player.seek((e.clientX - r.left) / r.width);
    };
    return { ctx: cx, size: size, bars: bars, ph: playheadWidth };
  }
  var waves = [wireWave($('wave'), BARS, 1), wireWave($('bigwave'), 120, 1.5)];
  setTimeout(function () { waves.forEach(function (w) { w.size(); }); }, 0);

  (function drawWaves() {
    var data = player.spectrum();
    waves.forEach(function (w) {
      var c = w.ctx.canvas, W = c.clientWidth, H = c.clientHeight;
      if (!W || !H) return;
      if (c.width !== Math.round(W * dpr)) w.size();   // view was hidden when we last sized it
      w.ctx.clearRect(0, 0, W, H);
      var n = w.bars, bw = W / n;
      for (var i = 0; i < n; i++) {
        var played = (i / n) < st.progress;
        var v = shape[i % BARS];
        if (data && st.playing) v = v * 0.4 + (data[Math.floor(Math.pow(i / (n - 1), 1.9) * (data.length - 1))] / 255) * 0.9;
        var h = Math.max(1.5, v * H * 0.86);
        w.ctx.fillStyle = played ? WAVE.on : WAVE.off;
        w.ctx.fillRect(i * bw, H / 2 - h / 2, Math.max(1, bw - 1.6), h);
      }
      w.ctx.fillStyle = WAVE.head;
      w.ctx.fillRect(st.progress * W - w.ph / 2, 0, w.ph, H);
    });
    requestAnimationFrame(drawWaves);
  })();

  /* ----------------------------------------------------------- contact -- */
  $('cform').addEventListener('submit', function (e) {
    e.preventDefault();
    // the note element is optional -- make one if the markup does not carry it
    var note = $('cnote');
    if (!note) {
      note = document.createElement('div');
      note.className = 'cnote';
      note.id = 'cnote';
      this.appendChild(note);
    }
    note.textContent = 'No endpoint yet - wire this to a form handler before launch';
    note.style.color = 'var(--amber)';
  });

  /* ----------------------------------------------------------- theme ----
     One lever: --accent-rgb / --void-rgb in CSS, plus the two canvases, which
     paint their own pixels and so cannot inherit a custom property. */
  var THEMES = {
    dark: {
      stars: ['#ffffff', '#cfe6ff', '#8ad7ff'],
      ring: '138,215,255', ringAlpha: .2, alphaBoost: 1,
      spot: { color: '#8ad7ff', brightness: .07, blend: 'screen' },
      wave: { on: 'rgba(138,215,255,.85)', off: 'rgba(138,215,255,.2)', head: 'rgba(251,191,36,.9)' },
      label: 'Light'
    },
    light: {
      // ink specks on paper rather than stars on void
      stars: ['#4a6a84', '#274457', '#0b688c'],
      ring: '11,104,140', ringAlpha: .32, alphaBoost: 1.45,
      spot: { color: '#0b688c', brightness: .1, blend: 'multiply' },
      wave: { on: 'rgba(11,104,140,.85)', off: 'rgba(11,104,140,.22)', head: 'rgba(150,86,10,.9)' },
      label: 'Dark'
    }
  };

  var themeBtn = $('themeBtn'), themeLbl = $('themeLbl');

  function applyTheme(name, persist) {
    var t = THEMES[name] || THEMES.dark;
    if (name === 'light') document.documentElement.dataset.theme = 'light';
    else document.documentElement.removeAttribute('data-theme');

    field.setPalette({ layers: t.stars, ringColor: t.ring, ringAlpha: t.ringAlpha, alphaBoost: t.alphaBoost });
    spot.setConfig(t.spot);
    WAVE.on = t.wave.on; WAVE.off = t.wave.off; WAVE.head = t.wave.head;
    themeLbl.textContent = t.label;
    themeBtn.setAttribute('aria-label', 'Switch to ' + t.label.toLowerCase() + ' mode');
    if (persist) { try { localStorage.setItem('addo-theme', name); } catch (e) {} }
  }

  var savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('addo-theme') || 'dark'; } catch (e) {}
  applyTheme(savedTheme, false);

  themeBtn.addEventListener('click', function () {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
  });

  /* ------------------------------------------------------- font modes ---
     WorkySpace is a brush face: gorgeous large, ambiguous at 10px. These three
     modes let you judge how far to push it. */
  var FONT_MODES = [
    ['naru',   'WorkySpace headings · Naru copy'],
    ['panels', 'WorkySpace headings + panel labels'],
    ['worky',  'WorkySpace everywhere']
  ];
  var fi = 0, toast = $('toast'), toastT;
  function cycleFont() {
    fi = (fi + 1) % FONT_MODES.length;
    document.documentElement.dataset.font = FONT_MODES[fi][0];
    toast.textContent = FONT_MODES[fi][1];
    toast.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('on'); }, 1800);
  }

  /* -------------------------------------------------------- keyboard ---- */
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
    if (e.code === 'Space' && !typing) { e.preventDefault(); player.toggle(); }
    if (typing) return;
    if (e.code === 'ArrowRight') player.next();
    if (e.code === 'ArrowLeft') player.prev();
    if (e.key === 'f' || e.key === 'F') cycleFont();
  });
})();
