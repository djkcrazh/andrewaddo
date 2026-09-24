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

WorkySpace (brush display) and Aurebesh (Star Wars glyphs) are both **freeware,
non-commercial**. Fine for a personal site; licence a commercial equivalent before
this becomes a business asset. Licences are kept alongside the files in
`assets/fonts/`.

WorkySpace is gorgeous at display sizes and ambiguous at 10px — `LAT` reads as `CAT`,
`0`/`O` and `1`/`l` are hard to tell apart. **Press `F`** to cycle three modes:

| mode | numerals | micro-labels | notes |
|------|----------|--------------|-------|
| `hybrid` *(default)* | IBM Plex Mono | WorkySpace | closest to "across the board" while the clock stays readable |
| `all` | WorkySpace | WorkySpace | fully across the board |
| `labels` | IBM Plex Mono | IBM Plex Mono | WorkySpace for content only — most legible |

Set the default by changing `data-font` on `<html>` in `index.html`.

**Aurebesh flash:** the name holds Latin for 3s, stutters, holds Aurebesh for 0.5s,
stutters back. Aurebesh runs 1.43x wider at the same size, so it renders at 0.70em to
keep the swap from jumping. Pauses automatically when Home is off-screen.

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
- **Font weight.** `WorkySpace.otf` is 394 KB. Convert to woff2 (~40% of that) and
  subset to Latin.
- **Solar times** use the short NOAA formula — accurate to a few minutes.

## Vercel

This deploys as a plain static site — no server needed. The clock, the starfield and
the audio all run in the browser, so a static host serves them fine; there is nothing
to render server-side. `vercel deploy` from the repo root with `site/` as the output
directory is enough.

If you want the React/Tailwind port later, the five factories in `assets/core.js`
(`createStarfield`, `createSpotlight`, `createCursor`, `createClock`, `createPlayer`)
each wrap into one `useEffect`, and the six views become routes.
