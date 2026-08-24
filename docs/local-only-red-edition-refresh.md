# Local-Only Orbitrack Red Edition Refresh

Date: 2026-08-22

## Goal

Refresh the vanilla, local-first Orbitrack app without uploading, publishing, pushing, or releasing anything externally. The work focused on making the running Electron app feel cleaner, faster, safer, and easier to test locally.

## What We Wanted To Do

- Keep the vanilla app as the main tested app.
- Build only local Windows artifacts with `npm run dist:win:local`.
- Improve the splash/loading screen while keeping the old Lite-style minimal composition.
- Restore the normal/native top window frame.
- Stop search inputs from dropping or reordering letters during fast typing.
- Clean up Notes search and reduce focus jumps.
- Add local health diagnostics and security status visibility.
- Add theme token direction for a future React version.
- Fix theme-toggle layout drift so Black/Normal modes repaint without moving the UI.
- Remove unwanted dashboard clutter from the Projects landing page.
- Replace the confusing density/performance range line with clear labeled choices.

## Files Modified

### `app.js`

- Added splash hold/dismiss behavior so the splash can remain open and dismiss with `Esc` once ready.
- Added safer forced splash dismissal for boot fallback paths.
- Added cached project attachment counts to avoid repeated attachment lookups while rendering cards.
- Added debounced Projects and Tasks search rendering.
- Preserved live input values and caret positions during delayed re-renders.
- Added Local Health diagnostics covering cache, local storage, sync queue, issue log, and desktop security state.
- Added diagnostics copy/report support that includes the Local Health snapshot.
- Added project metric strip rendering on the Projects page.
- Removed the project metric strip again after review because the counts were redundant with the status pills and made the Projects header feel heavy.
- Replaced the old density/performance range handling with explicit option actions.
- Disabled the custom desktop chrome initializer so the app keeps the native title bar.

### `bootstrap.js`

- Updated the 12 second splash failsafe to call `hideSplash({ force: true })`, so a stuck startup can still dismiss cleanly.

### `desktop/main.js`

- Restored native Electron window framing with `frame: true`.
- Added desktop security status IPC reporting.
- Added window state IPC helpers for minimize, maximize/restore, close, and state reporting.
- Kept the local packaging flow compatible with the normal native top bar.

### `desktop/preload.js`

- Exposed `getSecurityStatus()` to the renderer.
- Exposed guarded `windowControls` APIs for the renderer bridge.

### `index.html`

- Replaced the old Lite splash core markup with a local Red Edition GIF asset.
- Changed the splash label to `ORBITRACK RED EDITION`.
- Kept the splash status/version text structure for the Lite-style loading presentation.

### `assets/red-edition-loader.gif`

- Added the provided Red Edition particle GIF as a local app asset.
- This keeps the packaged app self-contained and avoids loading the GIF from Downloads.

### `splash-sphere.js`

- Converted the canvas splash animation into a Red Edition dark fallback.
- The visible splash currently uses the GIF on black; the canvas is hidden by CSS but remains available as fallback code.

### `notes.js`

- Added debounced Notes search rendering.
- Preserved search input value and caret position during Notes panel rerenders.
- Prevented the editor from stealing focus while typing in the Notes search field.
- Added `Enter` handling to flush the pending Notes search immediately.

### `styles.css`

- Added Motorsport/Red Edition visual styling for the vanilla app.
- Added Notes drawer cleanup sizing and spacing.
- Added diagnostics styling for Local Health panels.
- Restored native top bar behavior by hiding custom titlebar styles and removing desktop-shell offsets.
- Refined the splash back to a plain black Lite-style composition.
- Removed GIF blend/glow/drop-shadow effects so the GIF blends into the black background.
- Added project card geometry locks so theme changes do not resize cards.
- Added final theme-invariant page chrome rules so Black/Normal toggles share the same sidebar, content padding, sticky header spacing, title sizing, and collapsed rail dimensions.
- Removed the Black-mode-only decorative title stripe that made page headers shift compared with Normal mode.
- Removed the Projects metric strip styling and responsive rules.
- Replaced the old S/L range-line settings control with labeled option cards for density and performance.
- Added a Full-performance visual layer with slightly more translucent panels and sticky headers while Balanced/Low Power stay flatter.

### `orbitrack-react/src/index.css`

- Added React-side Motorsport/Red Edition token direction for the future React version.
- Added denser app shell, page header, sidebar, project search, card, and dashboard styling tokens.

## Local Artifacts

Generated locally with `npm run dist:win:local`, which runs Electron Builder with `--publish never`.

- `release/Orbitrack-Setup-3.5.11.exe`
- `release/win-unpacked/Orbitrack.exe`

## Verification Run

- `git diff --check`
- `npm run verify:vanilla`
- `npm --prefix orbitrack-react run build`
- `npm run dist:win:local`

Notes:

- No upload, publish, push, cloud deploy, or release workflow was run.
- `git diff --check` reported only existing LF-to-CRLF warnings.
- The packaged `app.asar` includes `assets/red-edition-loader.gif`.

## Current Follow-Up Focus

- Manually compare Black and Normal mode screenshots after the final theme-invariant layout patch.
- Confirm the top native title bar stays normal and does not introduce app-layout offsets.
- Confirm project cards, search row, status pills, and sidebar rail remain aligned during theme toggles.
