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
| `PROJECTS` | title, one-liner, stack tags, year, status, `url` (rows open in a new tab) |
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

This deploys as a plain static site — no server needed. The clock, the starfield and
the audio all run in the browser, so a static host serves them fine; there is nothing
to render server-side. `vercel deploy` from the repo root with `site/` as the output
directory is enough.

If you want the React/Tailwind port later, the five factories in `assets/core.js`
(`createStarfield`, `createSpotlight`, `createCursor`, `createClock`, `createPlayer`)
each wrap into one `useEffect`, and the six views become routes.
