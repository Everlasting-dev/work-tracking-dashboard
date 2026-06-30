# Orbitrack — Engineering & Operations Notes

_Living handoff doc. Current version: **v3.3.3** (2026-06-25). App = Orbitrack
(formerly "WorkTracker"/"Orbitask"). Repo: `Everlasting-dev/work-tracking-dashboard`._

---

## 1. What Orbitrack is

A desktop + web project/task/file/team workspace: projects, tasks (list/board/
timeline/map), a brainstorm canvas, rich-text notes, documents, team activity map,
lightweight chat, and an admin panel. Single-page vanilla app (no framework).

**Stack:** vanilla HTML/CSS/JS · Dexie (IndexedDB) · Supabase (Postgres + Auth +
Realtime + Edge Functions) · Google Drive (file bytes) · D3 · Quill · jsPDF ·
SortableJS · tldraw (canvas island) · Electron (desktop).

## 2. Architecture (how data flows)

- **LocalDB (Dexie) is ALWAYS `window.DB`** — the primary store; the app never
  waits on the network (`db-bridge.js`). UI reads/writes LocalDB.
- **SyncEngine (`sync.js`)** intercepts a fixed list of LocalDB write methods
  (`WRITE_OPS`) and replays them to Supabase (`SupabaseDB`, `db-supabase.js`) in
  the background; it also pulls cloud → LocalDB and maps local↔cloud ids.
  - **Gotcha:** only methods in `WRITE_OPS` sync. Direct `db.<table>` writes don't.
  - **Gotcha:** `_patchLocalId` remaps the created row's id but NOT every foreign
    reference (e.g. `userClassrooms.userId`, `taskDependencies`), which has caused
    several bugs (see §6).
- **Supabase client:** ONE shared client created in `sync.js` and injected as
  `window.SupabaseDB._client`. Auth options now explicit: `persistSession:true,
  autoRefreshToken:true`.
- **Files:** stored in **Google Drive** via authenticated Supabase **Edge
  Functions** (`files-upload/content/delete`), fronted by `storage-drive.js`
  (`window.DriveStorage`). Requires `storageProvider:'google_drive'` in the runtime
  config AND a per-user Supabase **Auth** session (see §5).
- **RLS:** permissive `wt_anon_all using(true)` policies (internal-tool trust
  model); the anon key is public by design.

## 3. Release pipeline (how to ship)

GitHub Actions:
- **`auto-version.yml`** (push to main, unless msg has `[skip-release]`/`chore:`):
  creates the `vX.Y.Z` tag from `package.json`.
- **`release-desktop.yml`** (on tag `v*`): generates `config.js` from secrets,
  builds the Windows NSIS installer, publishes a GitHub Release with `latest.yml`
  (electron-updater feed), `make_latest:true`.
- **`deploy-pages.yml`** (push to main): regenerates `config.js` from secrets and
  deploys the web app to GitHub Pages.

**The working release flow used throughout 3.2.x–3.3.x:**
1. Bump version in: `package.json`, `index.html` (all `?v=` cache-busts + splash +
   `WT_APP_VERSION`), `app.js` `getAppVersion()` fallback, `README.md`,
   `CHANGELOG.md`, and the in-app `SUPPORT_CHANGELOG`.
2. Commit with **`[skip-release]`** (so `auto-version` doesn't race), push main →
   **Pages deploys**.
3. **Push the tag yourself** (`git tag -a vX.Y.Z -m … && git push origin vX.Y.Z`) →
   triggers the desktop build (a tag pushed by a user triggers it; a tag created by
   the GITHUB_TOKEN action does not).
4. Verify: `gh release view vX.Y.Z`, build success, Pages success.

**Config generation MUST include `storageProvider:'google_drive'`** in BOTH
`release-desktop.yml` and `deploy-pages.yml` (a 3.2.0 bug omitted it → every file
404'd; fixed in 3.2.1).

## 4. Live-DB / Auth admin tooling (no Docker needed)

- **Run SQL on prod:** Supabase **Management API** `POST
  https://api.supabase.com/v1/projects/<ref>/database/query` with the **CLI access
  token** (stored in Windows Credential Manager target `Supabase CLI:supabase`,
  read via advapi32 `CredReadW`). Project ref: `ewexbdilrhmlpbalmpfj`.
- **Auth admin (GoTrue):** `{SUPABASE_URL}/auth/v1/admin/users` with the
  **service_role key** (in `.env`, `SUPABASE_SERVICE_ROLE_KEY`) in both `apikey`
  and `Authorization: Bearer` headers. Used to set passwords / create users.
- **Auth config:** `GET/PATCH https://api.supabase.com/v1/projects/<ref>/config/auth`.
- Never commit the service_role key or the CLI token.

## 5. Document-storage (Google Drive) auth — the hard-won part

Drive file access needs a per-user **Supabase Auth** session. History of breakage
and the durable fix:

- The Auth "shadow" password used to be derived from the **app password**. But
  `changePassword` (OTP/forced/reset) updated only `wt_users.password_hash`, never
  the Auth password → after any password change the app could never sign that user
  into Auth again → Drive "authorization missing" **forever**, and sign-out/in did
  not help.
- **Durable fix (v3.3.3):** the Auth password is now a **stable per-user value
  independent of the app password** — `drivePassword(uid) = "orbtrk_"+uid+"_"+
  DRIVE_PEPPER`, `DRIVE_PEPPER="Orb1track$Drive$2026$kx9"` in `storage-drive.js`.
  `ensureAuthSession({userId,...})` uses it; `ensureDriveStorageSession` passes
  `userId`. A **one-time admin resync** set every Auth account's password to this
  value and created/linked any missing accounts. **If the pepper changes or users
  are added out-of-band, re-run the resync** (GoTrue admin API, §4).
- Other contributing fixes:
  - **3.3.2:** disabled Supabase Auth **refresh-token rotation** (it invalidated
    sessions when the same account was used on 2 devices / after relaunch).
  - **3.3.1:** **pinned Electron `userData`** to the legacy `%APPDATA%/WorkTracker`
    path in `desktop/main.js` (the rename to productName "Orbitrack" otherwise
    moved everyone to a fresh profile — logged out, local data reset, session
    orphaned). **Never let productName drive userData.**
  - `DriveStorage.recoverSession()` (getSession→refreshSession) runs in the health
    check to silently restore a lapsed session.
- **Diagnostics** (Support → Diagnostics, `renderDiagnosticsPage`) shows storage
  session detail (present/expiry/auth user/link match), an Environment panel, and a
  **Reconnect storage** button.

## 6. Notable bugs fixed along the way (and the lesson)

- **Personal classrooms duplicated / invisible** — were created on the *admin's*
  machine with the new user's *local* id, which didn't survive id-remap. Now
  created on the **user's own first login** (canonical id), idempotent; cloud
  columns `is_personal`/`owner_id` persist it. (`DB.ensurePersonalClassroom` /
  `dedupePersonalClassrooms`.)
- **`createUser` duplicate-key (`wt_users_auth_user_id_uniq`)** — a `BEFORE INSERT`
  trigger `wt_users_set_auth_user_id()` stamped `auth.uid()` (the admin's id) onto
  new rows once Drive gave the admin a session. Guarded the trigger to only
  auto-link genuine self-signups; cloud `createUser` is also idempotent on 23505.
- **User deletion didn't stick** — FK refs (`wt_activity_log`, `wt_updates`,
  `wt_attachments`) with no ON DELETE blocked the delete; the row reappeared on
  sync. `deleteUser` now reassigns/clears those refs (transfers projects/updates/
  files to the **main admin**) before deleting; clear **Delete** button on cards.
- **"Complete blocking tasks first" with no visible blocker** — a ghost
  `taskDependencies` row (local-only) pointed at a deleted/cross-project task.
  `areTaskBlockersDone` now ignores + prunes ghosts and the toast names the blocker.
- **Lesson:** identity-affecting changes (appId/productName/userData, auth password
  derivation, FK on-delete, id-remap) are migration-sensitive — treat them as such.

## 7. Feature summary by release

- **3.2.0** — one-time-password accounts (forced first-login change), classroom
  assignment at creation + private personal spaces, profile customization
  (avatar/tagline/accent/cover), canvas public/private collaboration, in-app user
  guide (`#/guide`), diagnostics tab, PDF preview fix (Electron `plugins:true`).
- **3.2.1–3.2.6** — Drive config fix (404s), new-user sync (auth trigger),
  user-deletion fix + transfer to main admin, personal-space ownership fix, ghost
  task-dependency fix.
- **3.3.0** — **rebrand to Orbitrack**; account-menu trim; Support/About merged into
  one scrollable, curated release-notes page (minor collapse + admin-only notes);
  Notes (Alt+N) / Canvas (Alt+B) shortcuts; canvas **export** (PNG/PDF/SVG) +
  templates; team activity map recolour-by-department + "hide me" toggle; new-user
  modal no outside-close + confirm-on-cancel; welcome note seeded; General chat
  cleared.
- **3.3.1 / 3.3.2 / 3.3.3** — the Drive-auth stabilization chain (§5).

## 8. Supabase migrations (in `supabase/migrations/`)

- `20260624_v3112_adjustments.sql` — must_change_password, profile tagline/accent/
  cover, classroom is_personal/owner_id, canvas purpose/participant_ids.
- `20260624_fix_auth_user_id_default.sql` — guarded `wt_users_set_auth_user_id()` trigger.
- `20260624_user_delete_fk_rules.sql` — ON DELETE rules for user deletion.
- `20260625_v330_team_map_pref.sql` — `hide_from_team_map`.
- Auth password resync (3.3.3) was a GoTrue admin operation, not a SQL migration.

## 9. Where things live (quick map)

- `app.js` (~11k lines): UI, router (hash routes), actions map, modals, all pages.
- `db.js` = LocalDB; `db-supabase.js` = SupabaseDB; `sync.js` = SyncEngine; `db-bridge.js` = bootstrap.
- `storage-drive.js` = Drive/Auth bridge; `canvas.js` + `build-src/orbicanvas.jsx` (tldraw island, rebuild via `npm run build:orbicanvas`); `chat.js`; `notes.js`; `copilot.js/.css`.
- `desktop/main.js` = Electron main (userData pin, updater, window).
- `Update-Orbitrack.bat` = standalone latest-installer downloader.
- Memory (assistant): `.claude/.../memory/*` — release-pipeline, sync-architecture,
  drive-auth-sessions, personal-classroom-sync, etc.
