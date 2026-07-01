# Sprite sheets

Drop sprite-sheet PNGs here and call them via `window.OrbiSprites` (see `sprites.js`).

Each sheet is a grid of equal-size frames. Pass its metadata when spawning:

```js
OrbiSprites.spawnCharacter({
  sheet: 'assets/sprites/mascot-wave.png',
  frameW: 64, frameH: 64,   // one frame's pixel size
  frames: 8,                 // total frames
  cols: 8,                   // frames per row (rows inferred)
  fps: 12,                   // playback speed
  side: 'bottom',            // 'left' | 'right' | 'bottom' (default random)
  life: 4000,                // ms on screen before it leaves
});
```

- Until real sheets exist, everything runs on **emoji placeholders**, so the pop-up
  characters and `OrbiSprites.celebrate()` already work.
- A trophy unlock (`orbi-trophies-changed`) triggers a small character cameo.
- `OrbiSprites.startAmbient({ minMs, maxMs })` schedules occasional pop-ups;
  `stopAmbient()` stops them. Honors `prefers-reduced-motion` and `window.__orbiSpritesOff`.
- `OrbiSprites.playSprite(el, {...})` animates a sheet inside any element.
