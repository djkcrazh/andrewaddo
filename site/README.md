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

### Press F to re-wire the four font roles

`--display` (your name) is always WorkySpace. The other three move:

| mode | headings/nav | panel labels | copy + numerals |
|---|---|---|---|
| `naru` *(default)* | Naru | Naru | Naru |
| `panels` | WorkySpace | WorkySpace | Naru |
| `worky` | WorkySpace | WorkySpace | WorkySpace |

Set the default via `data-font` on `<html>` in `index.html`.

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
that order. Tune them in the `SKILLS` array at the top of `assets/site.js` and the bars
and readouts follow.

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
