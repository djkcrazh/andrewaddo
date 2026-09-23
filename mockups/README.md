# Portfolio mockups — three space directions

Three complete, interactive art directions for the portfolio. All static HTML/CSS/JS,
no build step. Each is one file plus the shared engine in `assets/`.

## Run them

```bash
python3 -m http.server 8742 --directory mockups
open http://localhost:8742/
```

A server is required (not `file://`) — the Web Audio analyser needs same-origin audio.

## The three

| # | Name | Character |
|---|------|-----------|
| 01 | **Observation Deck** (`01-observation-deck.html`) | Ship-HUD. Glass pills, corner brackets, centred name, right-rail nav, full cassette player with queue. Crosshair reticle cursor that snaps to targets. Space Grotesk + Space Mono, cyan/amber. |
| 02 | **Orbit** (`02-orbit.html`) | The abstract one. Nav sections are planets in a tilted orrery around a burning core; nebula wash behind the stars. Comet-tail cursor. Instrument Serif + JetBrains Mono, violet/gold. |
| 03 | **Telemetry** (`03-telemetry.html`) | Flight computer. Panel grid: chronometer with day arc and solar times, origin record, navigation, waveform transmission deck, drifting systems meters. Full-screen scanning crosshair with live X/Y. IBM Plex, phosphor green. |

## What is real, not faked

- **Clock** — live `America/New_York` via `Intl.DateTimeFormat`, so it tracks Coventry
  including the EDT/EST switch. Ticks 4x/sec.
- **Audio** — a real `<audio>` playlist over your five files. Play/pause, prev/next,
  seek, per-track cueing, keyboard (`space`, `←`, `→`). 02 and 03 draw a real FFT
  spectrum from a Web Audio `AnalyserNode`, not a canned animation.
- **Starfield** — parallax layers that lean with the pointer, twinkle, slow drift,
  shooting stars in 01. A click pushes a travelling shockwave through the field: stars
  in the ring band get displaced outward and brightened, then settle.
- **Cursor** — the spotlight canvas from your reference prompt, plus a smoothed
  reticle that lags the true pointer, stretches along its direction of travel, and is
  magnetically pulled into hover targets.
- **Solar times** (03) — computed from lat/long with the short NOAA formula.
  Approximate to a few minutes; swap for an exact library if it matters.

## Placeholders to replace

- Name, roles, nav labels, "Coventry" panel facts (elevation, founded), systems meters
  and log lines.
- Track titles are derived from filenames — edit `assets/tracks.js`.
- No images yet. 01 and 03 have obvious slots (the disc, the centre viewport);
  02 would take a portrait behind the core.
- Desktop only so far. Below ~1100px these layouts need a real mobile pass.

## Assets

`assets/audio/` is symlinked to `/Users/andrewaddo/Projects/portfolio` and gitignored,
so the repo stays small.

**Before shipping:** the four `.wav` files are 23–35 MB each, ~115 MB total. Convert to
MP3 (~192kbps) or Opus — roughly 3 MB per track, a 10x cut with no audible loss for
web playback.

```bash
brew install ffmpeg
ffmpeg -i in.wav -codec:a libmp3lame -b:a 192k out.mp3
```

## Shared engine — `assets/core.js`

`SpaceCore.createStarfield` · `createSpotlight` · `createCursor` · `createClock` ·
`createPlayer`. Each takes a config object; the art direction lives entirely in each
mockup's own CSS. Porting the winner to React/Tailwind means wrapping these five
factories in `useEffect` hooks.
