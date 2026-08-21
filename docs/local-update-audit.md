# Local Update Audit

Audit date: 2026-08-21

## Scope

This audit covers the local vanilla Orbitrack Electron app path:

- `index.html`
- `app.js`
- `date-utils.js`
- `desktop/main.js`
- `desktop/preload.js`
- root packaging scripts in `package.json`

The React app, deployed Supabase policy changes, GitHub release publishing, and production database/storage mutations are out of scope for this local executable build.

## Baseline

- The worktree was already dirty before this implementation pass.
- Existing modified, deleted, and untracked files were preserved.
- No git reset, clean, checkout, push, tag, release publish, or destructive cleanup was run.
- Node is available locally: `v24.16.0`.

## Major Findings

1. Production Supabase RLS/storage exposure remains a P0 production risk from `docs/app-audit.md`. It requires a staged database/security remediation, not an unverified local renderer change.
2. The package still contains multiple possible UI modes: vanilla, React, and modular. The standard `dist:win`/`dist:win:local` path must remain vanilla unless explicit React or modular environment/build metadata is supplied.
3. `app.js` remains a 12k-line global-script monolith. Broad rewrites are high risk while the worktree is dirty and automated coverage is thin.
4. Date helper extraction introduced a hard dependency on `date-utils.js` loading before `app.js`. The script order is currently correct, and `app.js` now throws a clear error if the helper bundle is missing.

## Minor Findings Fixed In This Pass

1. `desktop/preload.js` had a stale fallback app version of `3.5.6` while `package.json` is `3.5.11`.
2. `date-utils.js` treated today as not "due soon" after midnight because it compared a date-only due date against the current timestamp instead of the start of the local day.
3. `timeAgo()` could produce poor output or throw for malformed/non-string values.
4. The extracted date helper had no focused verification script.
5. Packaging had no local-only Windows build script that explicitly disabled publishing.

## Remaining Risks

- The vanilla UI still needs manual smoke testing in the packaged Windows app.
- Supabase authorization, React account-linking, and schema compatibility risks remain open and should be handled as separate staged work.
- Existing line-ending churn and many unrelated deleted/untracked files still make review noisy.
- The app has limited automated coverage beyond syntax and focused utility checks.
