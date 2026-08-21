# Public Release Checklist

## Required Gates

- React Executive: `npm --prefix orbitrack-react run verify`
- Tauri: `npm --prefix orbitrack-react run tauri:build`
- Supabase: staging migration applied and RLS matrix verified.
- Auth: no browser source reads `password_hash`, `salt`, or embeds a reusable password pepper.
- Files: upload, download, preview, and delete require a valid Supabase Auth session.
- Packaging: Windows installer is signed and manually smoke tested.
- Privacy: terms, privacy policy, support route, and data-export path are ready.

## Manual Smoke Test

- Launch installed app.
- Sign in and sign out.
- Open Dashboard, Projects, Tasks, Calendar, Files, Team, Reports, and Settings.
- Open the command palette and navigate to a project/task/user.
- Validate empty, loading, error, offline, and permission-denied states.
- Upload and preview a file with an authorized user.
- Confirm unauthorized users cannot read hidden projects or files.

## Release Hold Conditions

- Any anonymous Supabase table access to private workspace records.
- Any unsigned public Windows installer.
- Any production build that defaults to legacy `app.js` or experimental admin-only routes.
