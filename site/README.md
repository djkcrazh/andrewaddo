# Andrew Addo — portfolio

Telemetry direction, built out. A flight-computer dashboard that never reloads:
the chrome stays lit and the centre screen swaps between six views.

## Run

```bash
python3 -m http.server 8743 --directory site
open http://localhost:8743/
```

A server is required (not `file://`) — the Web Audio analyser needs same-origin audio.

## Views

`#home` · `#about` · `#projects` · `#skills` · `#sound` · `#contact`

Hash-routed, with real browser history. The Origin panel's "Coventry, Connecticut"
link routes to About. All six share one dashboard — the clock never resets and
music keeps playing across navigation.

## Fonts

Three faces, three jobs:

| face | where | licence |
|---|---|---|
| **WorkySpace** (brush display) | the name, view titles, and all side/top panel chrome | freeware, non-commercial |
| **Naru Mono** | everything on the centre screen, plus every numeric readout | **demo** — personal use only |
| **Aurebesh** | the name's glitch state only | freeware, non-commercial |

All three are personal-use. Fine for a portfolio; licence proper versions before this
becomes a business asset. Licences live beside the files in `assets/fonts/`.

### Naru Mono is a DEMO build — watch the punctuation

The demo substitutes a **"LTS" watermark box** for characters it does not ship:

    —  (em dash)    –  (en dash)    ’  “  ”  (curly quotes)    …  (ellipsis)

All copy currently uses `--`, straight quotes and `·` instead. Keep doing that, or buy
the full family (link in `assets/fonts/NaruMono-README.txt`). Arrows (→ ← ↑ ↓), `·`,
`°`, `%`, `»`, `«` all render fine.

### Press F to re-wire the font roles

`--display` (your name) and `--title` (headings, nav, the Origin panel name, the
Transmission track titles) are always WorkySpace. The rest moves:

| mode | panel labels | copy + numerals |
|---|---|---|
| `naru` *(default)* | Naru | Naru |
| `panels` | WorkySpace | Naru |
| `worky` | WorkySpace | WorkySpace |

**WorkySpace currently holds:** the name; every view title (About, Projects, Skills,
Sound, Contact); the Skills section headers (Engineer, Artist); all six nav labels;
"Coventry, Connecticut"; and the track titles in the Transmission panel.

**Naru holds:** body copy, panel micro-labels, skill names, project descriptions,
contact rows, form fields, and every numeral.

Widen WorkySpace's reach by moving an element's `font-family` from `var(--prose)` to
`var(--title)` in `index.html`. The obvious next candidates are project titles
(`.pitem .t`), the Sound track rows (`.trow .tt`), and the contact values
(`.chan a .v`). Set the default mode via `data-font` on `<html>`.

### The name glitch

Latin holds 3s, Aurebesh holds 0.5s, and the swap between them is a 340ms decode:

- every letter scrambles through junk glyphs, coin-flipping between both alphabets,
  then locks into its target — staggered 16ms apart, left to right
- two chromatic ghost copies (red/cyan, `mix-blend-mode: screen`) slice into
  horizontal bands and jump sideways
- a bright scan line sweeps top to bottom
- the whole block jitters on a stepped keyframe

Aurebesh runs 1.43x wider than WorkySpace at the same size, so it renders at `.70em`
to keep the swap from shoving the layout. Honours `prefers-reduced-motion`, and the
loop idles while Home is off-screen. Tuning lives at the top of the name block in
`assets/site.js` (`NAME`, `POOL`, `GLITCH_MS`) and in the `g*` keyframes in `index.html`.

## Contact form

Posts to Formspree (`https://formspree.io/f/mbglkpgj`) with `fetch`, not a native form
submit -- a native POST navigates away to Formspree's thank-you page, which would drop
the visitor out of the dashboard. Doing it in-page also keeps the success and error
copy in our own type.

- Fields are `name`, `email`, `message`, plus a hidden `_subject` and a `_gotcha`
  honeypot that bots fill and humans never see.
- All three visible fields are `required`; the browser validates before anything sends.
- While in flight the button disables and reads "Transmitting".
- On success the form clears. **On failure it does not** -- whatever was typed stays
  put so it can be retried.
- Status renders in `#cnote`: blue for success, amber for failure.

The `action` attribute is the single source of truth for the endpoint; `site.js` reads
it off the form. To swap providers, change the attribute.

## Links

`externalise()` in `assets/site.js` runs once at boot and sets
`target="_blank" rel="noopener noreferrer"` on every `<a>` **except**:

- `href="#..."` -- the dashboard's own routing (nav, the Origin panel's
  "Coventry, Connecticut / Explore"). These stay in-tab.
- `mailto:` and `tel:` -- these hand off to the OS, and a new tab would just
  leave an empty one behind.

So anything that leaves the site opens beside it and the clock, starfield and
whatever is playing all survive the click. Add a link anywhere and it is covered
automatically; no need to remember the attribute.

## Text contrast

Every text style clears WCAG AA (4.5:1) in both themes, measured against the
composited panel background rather than the raw `--void`. Lowest are the 9px
codes at ~5:1. The two greys that do the work:

| | dark | light |
|---|---|---|
| `--dim` (labels, ledes, footer) | `#8797aa` | `#3f5568` |
| `--body-ink` (prose) | `#ccd7e3` | `#22394b` |

If you darken either, re-check: at the previous values the page intro, log lines
and strip labels all sat near 4:1, and the 9px track codes were at 2.5:1.

## Light mode

The sun/moon button at the right of the header strip. Sun = you are in dark, click for
light; moon = the reverse. The choice persists in `localStorage` under `addo-theme`.

One lever does the whole theme: `--accent-rgb` and `--void-rgb` in `index.html`, since
every border, tint, track, glow and hairline is derived from them. The two `<canvas>`
layers paint their own pixels and cannot read a CSS variable, so `applyTheme()` in
`assets/site.js` hands them a palette: in light mode the starfield inverts to ink
specks on paper and the cursor spotlight switches from `screen` to `multiply`, casting
a soft shadow instead of a glow.

## Skills

Two sections, three panels, stacked vertically in the scrolling screen:

- **Engineer** -> Languages (7), Frameworks & Libraries (4)
- **Artist** -> Music & Performance (5)

Order and ties come from you; the **percentages are placeholders** picked to honour
that order. Tune them in the `SKILLS` array at the top of `assets/site.js`. The numbers
are not shown anywhere -- they only set bar length.

The Systems panel bars are fixed in `index.html` (Engineer 80 / Creative 75 /
Athlete 50). Edit the inline `style="width:N%"` to change them.

## Editing the text

Everything is in `site/`. Three files hold every word on the page. (`mockups/` is the
frozen exploration archive -- nothing there is live.)

### `index.html` -- all page copy

| what | where |
|---|---|
| Top strip label `ADDO//PORTFOLIO` | line ~467 |
| Panel titles (Chronometer, Origin, Systems, Navigation, Transmission) | `<h2>` inside each `.panel` |
| Coventry facts (Zone, Elevation, Founded, Signal) | just under `<h2>Origin` |
| Home eyebrow `Deep field / observation` and the `Engineer * Artist` tagline | `<section id="v-home">` |
| Each view's kicker, title and intro line | the `.vwhead` block at the top of every `<section class="vw">` |
| About paragraphs + the Born/Based/Pronouns table | `<section id="v-about">` |
| Contact channel labels, the `--` handles, form placeholders | `<section id="v-contact">` |
| Resume caption | `.resume` inside `<section id="v-skills">` |
| Footer hints | `<div class="foot">` at the bottom |

Search for the section id (`v-about`, `v-projects`, `v-skills`, `v-sound`, `v-contact`)
to jump to a view.

### `assets/site.js` -- the list-shaped content

Four arrays near the top, all plain data:

| array | what |
|---|---|
| `PROJECTS` | title, one-liner, stack tags, year, status, `url` (rows open in a new tab; no status label) |
| `SKILLS` | sections -> panels -> `['Name', percent]` |
| `NAME` | the glitching name (`'Andrew Addo'`) |
| `LOGS` | the scrolling lines in the Systems panel |

### `assets/tracks.js` -- track titles and codes

Five lines. Change `title` freely; leave `src` alone unless the filenames change.

### Two rules when you write

1. **No em dashes, en dashes, curly quotes or ellipses.** Naru Mono is a demo build and
   draws a "LTS" watermark box for all of them. Use `--`, straight quotes `"` `'`, and
   `...`. Watch out for word processors, which auto-curl quotes on paste -- type
   directly into the file or paste through a plain-text editor.
2. **`&middot;` is the interpunct** (`·`) used as a separator throughout, and
   `&rarr;` is the arrow. Both render fine.

After editing, just reload the browser. There is no build step.

## Placeholders

- Projects and skills are dummy data in `assets/site.js` (`PROJECTS`, `SKILLS`).
- Contact handles are `—`; the form has no endpoint and says so on submit.
- Portrait slot on About, resume at `assets/resume.pdf` — neither file exists yet.
- Coventry facts (elevation, founded) are unverified.
- Track titles come from filenames — edit `assets/tracks.js`.
- Desktop only. Below ~1100px this needs a real mobile pass.

## Before shipping

- **Audio weight.** Four `.wav` files at 23–35 MB each, ~115 MB total. Convert:
  `ffmpeg -i in.wav -codec:a libmp3lame -b:a 192k out.mp3` — roughly 3 MB per track.
- **Font weight.** `WorkySpace.otf` is 394 KB, `NaruMono.ttf` 188 KB, `Aurebesh.otf`
  80 KB -- 660 KB of fonts. Convert to woff2 (~40% of that) and subset to Latin.
- **Solar times** use the short NOAA formula — accurate to a few minutes.

## Vercel

The repo is deploy-ready. Push to the connected branch and it builds.

### How it is wired

`vercel.json` at the **repo root** sets `outputDirectory: "site"`, so leave the
project's Root Directory at the default `./`. There is no build step -- Vercel
just serves `site/`. `mockups/` never ships.

If you would rather set Root Directory to `site` in the dashboard, move
`vercel.json` into `site/` and delete the `outputDirectory` line, or the path
resolves twice and the deploy 404s.

### Fix these two URLs before you share the link

`index.html` has `canonical`, `og:url` and `og:image` hardcoded to
`https://andrewaddo.vercel.app/`. **That is a guess.** Once you know the real
domain, search-replace it. Wrong values mean the social preview silently breaks
on every share, with no error anywhere.

`assets/images/og.png` is a 1200x630 shot of the home screen. Regenerate it if
the design changes.

### Audio

The WAV masters are 116 MB -- too big for git and pointless to ship. They are
transcoded to 192k AAC (`.m4a`, 16 MB total) and committed. Masters stay in
`~/Projects/portfolio/Music/`. To replace a track:

```bash
afconvert -f m4af -d aac -b 192000 -q 127 -s 2 master.wav site/assets/audio/name.m4a
afinfo site/assets/audio/name.m4a | grep duration    # put the seconds in tracks.js
```

`vercel.json` pins `.m4a` to `Content-Type: audio/mp4`. Some servers map it to
`audio/mp4a-latm`, which browsers refuse to decode -- the file downloads fine
and simply never plays, with no console error.

### Local preview

```bash
python3 serve.py          # http://localhost:8743
```

Use this rather than `python3 -m http.server`. On macOS Python reads Apache's
mime.types and serves `.m4a` as the unplayable `audio/mp4a-latm`; `serve.py`
pins the same types Vercel does, so local matches production.

### Caching

Fonts, audio and images are `immutable` for a year. JS is `must-revalidate`
because the filenames are not content-hashed -- if you ever add hashing, switch
JS to immutable too.

## Known gaps

- **Fonts ship uncompressed**: 660 KB across three OTF/TTF files. woff2 would cut
  that ~60%, but needs `fonttools`, which is not installed. `pip install fonttools
  brotli` then `pyftsubset` to subset Latin and convert.
- Desktop only. Below ~1100px the dashboard needs a real mobile pass.
- The contact form has no spam rate-limit beyond the `_gotcha` honeypot.
