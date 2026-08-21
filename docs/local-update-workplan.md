# Local Update Workplan

Date: 2026-08-21

## Goal

Produce a local-only vanilla Orbitrack Windows installer for manual verification, with a clear trail of findings, changes, checks, and remaining risks. Do not push or publish anything.

## Work Structure

1. Preserve workspace state.
   - Record `git status --short` and `git diff --stat`.
   - Leave unrelated user-owned changes untouched.
2. Stabilize vanilla runtime.
   - Keep `index.html` loading `date-utils.js` immediately before `app.js`.
   - Keep the standard packaged app on the vanilla entrypoint.
   - Fix small confirmed runtime bugs only.
3. Add lightweight verification.
   - Add `npm run verify:vanilla`.
   - Check syntax for Electron and vanilla app entrypoints.
   - Verify date helper behavior and preload fallback version alignment.
4. Build locally.
   - Use `npm run dist:win:local`.
   - Do not use `publish:win`.
   - Record the output installer path in `docs/local-update-log.md`.

## Applied Local Fixes

- Hardened `date-utils.js` date-only parsing and invalid-input handling.
- Corrected due-soon calculations to compare against the start of the local day.
- Added a clear `WTDateUtils` load guard in `app.js`.
- Updated the Electron preload fallback version to `3.5.11`.
- Added `scripts/verify-vanilla-runtime.mjs`.
- Added `verify:vanilla` and `dist:win:local` package scripts.

## Rollback Notes

- Revert this local update by reverting changes to `date-utils.js`, `app.js`, `desktop/preload.js`, `package.json`, `scripts/verify-vanilla-runtime.mjs`, and the three `docs/local-update-*` files.
- Do not use destructive git commands while unrelated user-owned work is present.
- The generated `release/` output is ignored by git and can be removed manually after verification if no longer needed.

## Follow-Up Work

- Create a separate Supabase RLS/security remediation branch and staging migration.
- Add broader tests for auth, sync, project/task workflows, and Electron launch modes.
- Continue extracting `app.js` one bounded domain at a time after characterization tests exist.
