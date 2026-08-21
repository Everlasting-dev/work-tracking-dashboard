# Tauri Executive Migration Plan

## Summary

Orbitrack Executive migrates from Electron to Tauri by using the existing `orbitrack-react` app as the product UI and treating legacy `app.js` as maintenance-only. Electron remains available as rollback until Tauri builds, security migration, and test gates pass.

## Phases

1. Shell foundation: add `orbitrack-react/src-tauri`, minimal Tauri permissions, local scripts, and a runbook.
2. Security foundation: move password verification and account linking out of browser source; deploy least-privilege Supabase RLS in staging first.
3. Product UI: standardize the left-nav modules, shared design primitives, state messaging, onboarding, and command palette behavior.
4. Test gate: add fast tests around auth, project access, task state, file permissions, sync queue behavior, and reporting calculations.
5. Release gate: require React build/lint/test, Supabase tests, Tauri build, signed installer validation, and manual smoke testing before public launch.

## Non-Negotiables

- Do not port the 12k-line vanilla `app.js` into Tauri.
- Do not ship browser-side password peppers, hash reads, or client-controlled `auth_user_id` linking.
- Do not deploy Supabase policy changes directly to production without staging verification and rollback notes.
- Do not remove Electron until a signed Tauri installer has passed manual smoke testing.

## Acceptance Criteria

- Tauri config exists with a minimal permission allowlist.
- React Executive builds independently from Electron.
- Browser clients no longer read `password_hash` or `salt`.
- Core Supabase tables deny anonymous access.
- Tests exist for auth, projects, tasks, files, sync, and reporting.
- Public UI routes are stable: Dashboard, Projects, Tasks, Calendar, Files, Team, Reports, Settings.
