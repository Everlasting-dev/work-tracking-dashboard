# Hybrid Storage: Supabase metadata + Google Drive content

## Architecture summary

Supabase keeps everything it already owns — auth, users, projects, membership/roles,
tasks, comments, activity, notifications, realtime, and now **file metadata +
access control**. Google Drive (one dedicated Orbitrack storage account) holds the
**actual file bytes**.

```
Browser/Electron (no secrets)
   │  Supabase Auth JWT (Bearer)
   ▼
Supabase Edge Functions (Deno) ── service-role key + Google refresh token (secrets)
   ├─ files-upload    POST   validate JWT → check membership/role → Drive upload → insert project_files
   ├─ files-content   GET    validate JWT → load row → check membership → stream from Drive (Range/ETag)
   └─ files-delete    POST   validate JWT → load row → uploader/editor/admin → trash Drive + soft-delete
        │
        ▼
   Google Drive  Orbitrack Storage / project_<id> / {images,documents,videos,other}
```

**Why Edge Functions:** already hosted by Supabase (no new infra), already used
(`report-bug`) with the service-role key as a secret. The Google refresh token,
client secret, and service-role key live **only** as Edge Function secrets — never
in the distributed Electron/renderer code.

**Identity:** Orbitrack login is custom (bigint `wt_users.id` + anon key). The
backend needs a trustworthy identity, so on login the app also establishes a
**Supabase Auth session** under the hood (`DriveStorage.ensureAuthSession`,
reusing `wt_users.auth_user_id` + `wt_my_id()`). The login UI is unchanged. The
functions validate that JWT and map `auth.uid()` → `wt_users.id`, then re-check
the existing membership/role model (`canEdit`, classroom membership) in code.

**IDs:** the spec assumed uuid; Orbitrack uses **bigint** project/user ids, so
`project_files.project_id/uploaded_by` and `project_storage_folders.project_id`
are bigint (file `id` is uuid). Folder names use the unique project id
(`project_<id>`) so identical names never collide.

**Safety / rollout:** the frontend Drive path is **flag-gated**
(`WT_CONFIG.storageProvider === 'google_drive'`). Until you flip it, the existing
Supabase Storage path keeps working and old files are untouched.

## Files created / modified

**Backend (new):**
- `supabase/migrations/20260618_project_files_drive_storage.sql` — tables + RLS + membership helpers
- `supabase/functions/_shared/{cors,validation,auth,drive}.ts` — CORS/logging, allowlist/sanitize, JWT+membership, Drive REST service
- `supabase/functions/{files-upload,files-content,files-delete}/index.ts` — endpoints
- `supabase/functions/tests/{validation,auth}_test.ts` — unit tests

**Tooling (new):**
- `scripts/google-drive-oauth-bootstrap.mjs` — one-time refresh-token + root folder
- `scripts/migrate-storage-to-drive.mjs` — idempotent Storage→Drive migration + report
- `.env.example` — placeholders; `.gitignore` — ignore secrets/tokens/reports

**Frontend (new + wiring):**
- `storage-drive.js` (new) — `window.DriveStorage` client (upload/objectUrl/remove/list/ensureAuthSession); loaded in `index.html`
- **Remaining wiring (apply + test against the deployed backend):**
  - `db-supabase.js` login: call `DriveStorage.ensureAuthSession({username,email,password})` so a Supabase Auth JWT exists.
  - `db.js` attachment methods (`addAttachment`/`getAttachment`/`getAttachmentUrl`/`deleteAttachment`): when `DriveStorage.enabled()`, route to `DriveStorage.upload/objectUrl/remove/list` instead of Supabase Storage. Keep the current path as the fallback.
  - `app.js`: in `openFilePreview` use `DriveStorage.objectUrl(row.id)` for Drive rows (already revokes object URLs); lazy-load images (`loading="lazy"`, fetch full content only on open); add an in-flight guard on the upload handlers to prevent double-submit.

## Supabase migration SQL

Run `supabase/migrations/20260618_project_files_drive_storage.sql` in the SQL
editor (or `supabase db push`). It creates `project_files`, `project_storage_folders`,
the `wt_is_project_member()` / `wt_can_edit_project()` helpers, and RLS (members
may SELECT; all client writes blocked — only the service-role functions write).

## Required environment variables (Edge Function secrets)

```
GOOGLE_CLIENT_ID=            GOOGLE_REFRESH_TOKEN=
GOOGLE_CLIENT_SECRET=        GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_REDIRECT_URI=         FILE_MAX_BYTES=104857600  (optional)
```
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected into
Edge Functions automatically. Set the Google ones:
```
supabase secrets set GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… \
  GOOGLE_REFRESH_TOKEN=… GOOGLE_DRIVE_ROOT_FOLDER_ID=…
```

## Google Cloud setup

1. Google Cloud Console → create/select a project.
2. Enable the **Google Drive API**.
3. OAuth consent screen: External, add the dedicated storage account as a test
   user (or publish). Scope: `https://www.googleapis.com/auth/drive.file` only.
4. Create an **OAuth client ID** (type: Web application). Authorized redirect URI:
   `http://localhost:53682/oauth2callback`.
5. Put client id/secret + redirect in `.env`, then run, signed in as the storage
   account: `node scripts/google-drive-oauth-bootstrap.mjs`. Copy the printed
   `GOOGLE_REFRESH_TOKEN` and `GOOGLE_DRIVE_ROOT_FOLDER_ID` into Supabase secrets.

## Local testing

- Unit tests: `deno test --allow-env supabase/functions/tests/`
- Serve functions locally: `supabase functions serve --no-verify-jwt=false`
- Smoke upload (needs a real user JWT):
  `curl -X POST "$SUPABASE_URL/functions/v1/files-upload" -H "Authorization: Bearer $JWT" -H "apikey: $ANON" -F projectId=1 -F file=@photo.png`

## Production deployment

```
supabase db push                       # apply the migration
supabase functions deploy files-upload files-content files-delete
supabase secrets set GOOGLE_CLIENT_ID=… …   # (see above)
```
Then set `window.WT_CONFIG.storageProvider = 'google_drive'` in `config.js`,
run `node scripts/migrate-storage-to-drive.mjs` (verify `drive-migration-report.json`),
and only after verification remove the old Supabase Storage objects.

## Integration test matrix (run against a deployed function)

| Case | Expect |
|---|---|
| Upload with no/invalid JWT | 401 |
| Upload by non-member | 403 |
| Upload by editor/owner/admin | 201 + `project_files` row |
| Oversized / unsupported MIME / blocked ext | 422 |
| Drive upload fails | 500, **no** metadata row |
| Metadata insert fails after Drive upload | 500 + Drive file trashed (orphan cleanup) |
| Download by non-member / cross-project id swap | 403 / 404 (project derived from row, not client) |
| Delete by non-uploader non-editor | 403 |
| Expired access token | silently refreshed via refresh token |
| Revoked Google auth | 502 "storage authorization error" (DriveAuthRevokedError) |
| Duplicate upload retry (<2 min, same file) | returns existing row, no duplicate |

## Remaining risks / limitations

- **Auth session prerequisite:** every user must have a Supabase Auth account
  (auto-created/linked on first login via `ensureAuthSession`). Existing users get
  linked on next login; this needs an email (synthesized `username@orbitrack.local`
  when absent). Confirm that fits your Supabase Auth settings (email confirmations
  should be off, or use a real email domain).
- **Edge Function limits:** large video streaming through a function has CPU/time
  limits. Range is forwarded and works for moderate files; for very large videos
  consider a hosted FastAPI streamer or short-lived signed strategy later.
- **Authenticated `<video>`/`<img>` streaming:** browsers can't add the JWT header
  to a bare media `src`, so the client fetches content into object URLs (revoke
  after use). True ranged `<video>` needs a signed-URL/service-worker layer (future).
- **Single shared Drive account quota** (15 GB free; Workspace for more) is a global
  cap across all projects — monitor usage.
- **`drive.file` scope** only sees files the app created; the root folder must be
  created by the bootstrap (it is) so the app can manage everything beneath it.
- The frontend DB/UI wiring and `ensureAuthSession` login hook are intentionally
  **not yet committed into the live app** — apply and test them against the
  deployed functions before flipping `storageProvider`.
```
