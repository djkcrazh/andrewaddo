/* The five tracks. WAV masters were transcoded to 192k AAC for the web
   (116 MB -> 16 MB); the originals live in ~/Projects/portfolio/Music. */
/* `dur` is seconds, read off the masters with afinfo. Keeping it here lets the
   Sound list render instantly instead of opening five extra connections on
   every page load just to read metadata. Update it if you replace a file. */
window.TRACKS = [
  { title: 'Spread Joy',       code: 'TRX-01', dur: 166.3, src: 'assets/audio/spread_joy.mp3' },
  { title: 'Ecclesiastes 3',   code: 'TRX-02', dur: 186.7, src: 'assets/audio/ecclesiastes_3.m4a' },
  { title: '247 Lifestyle',    code: 'TRX-03', dur: 197.3, src: 'assets/audio/247_lifestyle.m4a' },
  { title: 'Antoine Griezmann',code: 'TRX-04', dur: 137.1, src: 'assets/audio/antoine_griezmann.m4a' },
  { title: 'Den',              code: 'TRX-05', dur: 132.4, src: 'assets/audio/den.m4a' }
];
