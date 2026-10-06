/* ============================================================================
   site.js — Andrew Addo portfolio. Telemetry shell, six views, one dashboard
   that never reloads: the chrome stays lit, the centre screen swaps.
   ========================================================================= */
(function () {
  'use strict';
  var S = window.SpaceCore;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------------- field */
  // phones and tablets get the same sky at a calmer pace
  var gentle = window.matchMedia('(pointer:coarse),(max-width:860px)').matches;
  var field = S.createStarfield($('stars'), {
    parallax: 20,
    drift: gentle ? { x: -5, y: 1.2 } : { x: -11, y: 2.6 },
    float: gentle ? { amp: 16, speed: .4 } : { amp: 34, speed: .65 },
    gravity: { radius: 360, pull: 120, swirl: .13 },
    shooting: gentle ? { every: [7000, 14000], speed: 520 } : { every: [3000, 7000], speed: 700 },
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

  var sX = $('scanX'), sY = $('scanY');
  (function scan() {
    var p = cur.pos();
    sX.style.transform = 'translateY(' + p.y + 'px)';
    sY.style.transform = 'translateX(' + p.x + 'px)';
    requestAnimationFrame(scan);
  })();

  /* -------------------------------------------------------------- content */
  /* Descriptions drafted from each repo's README -- correct them freely. */
  var PROJECTS = [
    { t: 'Nhoma Dashboard',
      d: 'Pig farm management app: a herd ledger tracking breeding and 114-day gestation, weight history, market readiness and alerts.',
      stack: ['Next.js', 'TypeScript', 'SQL'], y: '2026',
      url: 'https://github.com/djkcrazh/nhoma' },

    { t: 'Bottle Builders LLC Website',
      d: 'Five-page site for a bottle recycling company, drawn as an architectural blueprint.',
      stack: ['HTML', 'CSS', 'JavaScript'], y: '2026',
      url: 'https://www.bottlebuilders.com/' },

    { t: 'Kairosz',
      d: 'Beat compilation from Summer 2026.',
      stack: ['FL Studio'], y: '2026',
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
      a.dataset.hover = 'OPEN';
      a.innerHTML =
        '<span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span><span class="t">' + p.t + '</span><div class="d">' + p.d + '</div>' +
        '<div class="stack">' + p.stack.map(function (s) { return '<em>' + s + '</em>'; }).join('') + '</div></span>' +
        '<span class="meta">' + p.y + '<span class="ext">&#8599;</span></span>';
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

  /* ----------------------------------------------------------- new tabs ---
     Anything that leaves the dashboard opens in its own tab, so the clock,
     the starfield and whatever is playing all survive the click. In-page
     routing (#about) and OS handoffs (mailto:, tel:) are left alone. */
  function externalise(root) {
    var links = (root || document).querySelectorAll('a[href]');
    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute('href') || '';
      if (href.charAt(0) === '#') return;
      if (/^(mailto|tel|javascript):/i.test(href)) return;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }
  externalise();

  /* -------------------------------------------------------------- routing */
  var VIEWS = ['home', 'about', 'projects', 'skills', 'sound', 'contact'];
  // 'dashboard' is only a page on the narrow layout, where the left column is hidden
  var mobileMQ = window.matchMedia('(max-width:860px)');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#navlist a, #mnav a'));
  var menuBtn = $('menuBtn'), mnav = $('mnav');

  function setMenu(open) {
    mnav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(mnav.hidden); });

  var current = 'home';
  function go(view, push) {
    if (view === 'dashboard' && !mobileMQ.matches) view = 'home';
    else if (view !== 'dashboard' && VIEWS.indexOf(view) === -1) view = 'home';
    current = view;
    setMenu(false);
    document.body.classList.toggle('m-dash', view === 'dashboard');
    VIEWS.forEach(function (v) { $('v-' + v).classList.toggle('on', v === view); });
    navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.view === view); });
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
    if (VIEWS.indexOf(v) === -1 && v !== 'dashboard') return;
    e.preventDefault();
    go(v, true);
  });
  window.addEventListener('popstate', function () { go(location.hash.slice(1), false); });
  go(location.hash.slice(1) || 'home', false);
  /* iOS Chrome/Safari can leave the layout viewport out of step with what is
     actually visible (after the address bar has been focused and the page
     reloaded), so a position:fixed shell pinned to inset:0 slides up under the
     toolbar and the top bar with the hamburger disappears. On the phone layout
     the shell is sized to the visual viewport instead, and re-fitted whenever
     the browser chrome moves. */
  var rootEl = document.documentElement;
  function fitViewport() {
    var v = window.visualViewport;
    if (!v || !mobileMQ.matches || Math.abs(v.scale - 1) > 0.01) {
      // desktop, or the user is pinch-zooming: let CSS inset:0 do its job
      if (!v || !mobileMQ.matches) rootEl.classList.remove('vvfit');
      return;
    }
    rootEl.style.setProperty('--vv-top', Math.max(0, v.offsetTop) + 'px');
    rootEl.style.setProperty('--vv-h', v.height + 'px');
    rootEl.classList.add('vvfit');
  }
  function fitSoon() {
    fitViewport();
    // the toolbar animates for a few hundred ms; keep correcting until it settles
    [120, 400, 900].forEach(function (ms) { setTimeout(fitViewport, ms); });
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitViewport);
    window.visualViewport.addEventListener('scroll', fitViewport);
  }
  window.addEventListener('resize', fitSoon);
  window.addEventListener('orientationchange', fitSoon);
  window.addEventListener('focus', fitSoon);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) fitSoon(); });
  window.addEventListener('pageshow', fitSoon);
  fitSoon();

  // A reload (or a back/forward restore) on a phone must land on a clean top bar:
  // no restored scroll offset, menu closed, and a forced repaint of the bar.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', function () {
    fitViewport();
    window.scrollTo(0, 0);
    setMenu(false);
    var strip = document.querySelector('.strip');
    strip.style.display = 'none';
    void strip.offsetHeight;
    strip.style.display = '';
  });
  // resizing across the breakpoint must not strand you on the dashboard page
  var onBreak = function () { fitViewport(); if (current === 'dashboard' && !mobileMQ.matches) go('home', false); else if (mobileMQ.matches === false) setMenu(false); };
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', onBreak); else mobileMQ.addListener(onBreak);

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
      '<span class="du" data-dur>' + (t.dur ? S.fmtTime(t.dur) : '--:--') + '</span>';
    r.onclick = function () { player.select(i); };
    $('tlist').appendChild(r);

    // duration comes from tracks.js -- see the note there on why we do not probe
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
  /* Formspree via fetch rather than a plain form POST -- a native submit
     navigates away to Formspree's thank-you page, which would drop you out of
     the dashboard. Keeping it in-page also lets errors render in our own type. */
  var cform = $('cform'), cbtn = $('cbtn'), cnote = $('cnote');
  var cbtnHTML = cbtn.innerHTML;

  function note(msg, kind) {
    cnote.textContent = msg || '';
    if (kind) cnote.dataset.kind = kind; else delete cnote.dataset.kind;
  }

  cform.addEventListener('submit', function (e) {
    e.preventDefault();
    if (cform.dataset.busy) return;
    if (cform.reportValidity && !cform.reportValidity()) return;

    cform.dataset.busy = '1';
    cbtn.disabled = true;
    cbtn.innerHTML = 'Transmitting';
    note('Opening channel');

    fetch(cform.action, {
      method: 'POST',
      body: new FormData(cform),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        return res.json()
          .catch(function () { return {}; })
          .then(function (body) { return { ok: res.ok, body: body }; });
      })
      .then(function (r) {
        if (r.ok) {
          cform.reset();
          note('Transmission received - I will reply to that address', 'ok');
        } else {
          var errs = (r.body && r.body.errors) || [];
          note(errs.length
            ? errs.map(function (x) { return x.message; }).join(' / ')
            : 'Transmission failed - try again, or email me directly', 'err');
        }
      })
      .catch(function () {
        note('No signal - check your connection and try again', 'err');
      })
      .then(function () {
        delete cform.dataset.busy;
        cbtn.disabled = false;
        cbtn.innerHTML = cbtnHTML;
      });
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
    if (e.key === 'Escape' && !mnav.hidden) setMenu(false);
    if (typing) return;
    if (e.code === 'ArrowRight') player.next();
    if (e.code === 'ArrowLeft') player.prev();
    if (e.key === 'f' || e.key === 'F') cycleFont();
  });
})();
