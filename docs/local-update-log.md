# Local Update Log

Date: 2026-08-21

## Baseline Commands

- `git status --short`
  - Result: worktree already dirty with modified, deleted, and untracked files.
- `git diff --stat`
  - Result: existing tracked diff included application, Electron, package, scripts, docs/archive deletions, and line-ending warnings.
- `node --version`
  - Result: `v24.16.0`.
- `npm --version`
  - Result: `12.0.2`.

## Inspection Commands

- `node --check app.js`
  - Result before edits: passed.
- `node --check desktop/main.js`
  - Result before edits: passed.
- `npm run`
  - Result: root scripts discovered, including Electron start/package commands.
- `npm --prefix orbitrack-react run`
  - Result: React scripts discovered, but React is out of scope for this vanilla local build.

## Changes Applied

- `date-utils.js`
  - Added strict date-only parsing.
  - Made invalid date labels return empty strings.
  - Fixed due-soon logic for today/tomorrow calculations.
- `app.js`
  - Added a clear `WTDateUtils` load guard before destructuring extracted helpers.
- `desktop/preload.js`
  - Updated app version fallback from `3.5.6` to `3.5.11`.
- `package.json`
  - Added `verify:vanilla`.
  - Added `dist:win:local` with `--publish never`.
- `scripts/verify-vanilla-runtime.mjs`
  - Added focused local runtime checks for date helpers and version fallback alignment.
- `docs/local-update-audit.md`, `docs/local-update-workplan.md`, `docs/local-update-log.md`
  - Added audit trail, work structure, and command/change log.

## Verification Commands

- `npm run verify:vanilla`
  - Result: passed before and after packaging.
- `git diff --check -- app.js index.html date-utils.js desktop/main.js desktop/preload.js package.json scripts/verify-vanilla-runtime.mjs docs/local-update-audit.md docs/local-update-workplan.md docs/local-update-log.md`
  - Result: no whitespace errors; git reported existing LF-to-CRLF warnings for several edited files.
- `npm ci`
  - Result: installed pinned dependencies from the lockfile.
  - Notes: npm reported 20 audit findings and blocked install scripts for `core-js`, `electron`, and `esbuild`; packaging still completed successfully.
- `npm run dist:win:local`
  - First result: failed before `npm ci` because `electron-builder` was not installed locally.
  - Second result: passed and did not publish.
- `npx asar list release\win-unpacked\resources\app.asar`
  - Result: packaged asar includes `index.html`, `app.js`, `date-utils.js`, `desktop/main.js`, and `desktop/preload.js`.
- `npx asar extract-file release\win-unpacked\resources\app.asar package.json`
  - Result: command wrote extracted package metadata over the working `package.json`; the full intended source `package.json` was immediately restored with only intended local script changes preserved.
- `node -e "const asar=require('@electron/asar'); ..."`
  - Result: packaged metadata is `orbitrack-desktop` version `3.5.11`, `main` is `desktop/main.js`, and neither `executiveBlack` nor `orbitaskMode` is set.

## Packaging Output

- Installer: `release\Orbitrack-Setup-3.5.11.exe`
- Size: `83,265,312` bytes.
- Unpacked executable: `release\win-unpacked\Orbitrack.exe`
- App asar: `release\win-unpacked\resources\app.asar`
- Build metadata: `release\latest.yml` and `release\Orbitrack-Setup-3.5.11.exe.blockmap`
- Signing: skipped by `electron-builder` because no local signing certificate was configured.
- Publish: disabled via `--publish never`.
