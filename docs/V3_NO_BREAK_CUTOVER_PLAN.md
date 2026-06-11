# WorkTracker v3 No-Break Cutover Plan

## Goal

Get WorkTracker running on the new v3 Supabase schema without breaking live users or losing data. Production users stay on the current working app and `wt_*` tables until the staging build proves that login, projects, tasks, documents, realtime updates, and error reporting work end to end.

## Guiding Rule

Do not drop, rename, or overwrite production `wt_*` tables until the v3 app has passed staging validation and a rollback package exists.

## Recommended Path

### Track 1: Keep Live Users Stable

- Keep production pointed at the existing Supabase project and current `wt_*` tables.
- Do not publish a v3 installer to live users yet.
- Do not run destructive SQL against production.
- Keep the current installer/release available as the rollback build.
- Rotate service-role keys after migration work is complete.

### Track 2: Build v3 in Staging

- Use the staging Supabase project for all v3 work.
- Validate the staging import from `supabase-backups/20260609-102436`.
- Update the app runtime to read/write v3 tables:
  - `profiles`
  - `workspaces`
  - `workspace_members`
  - `projects`
  - `project_members`
  - `tasks`
  - `project_updates`
  - `documents`
  - `notifications`
  - `activity_log`
  - `error_reports`
- Keep the existing UI mostly intact for the first working v3 build.
- Disable active chat behavior and keep the under-construction panel.
- Use Supabase Auth sessions and v3 RLS-safe queries.
- Subscribe to realtime for work-tracking tables only.

## One-Day Recovery Priority

The first working v3 build should prioritize:

1. Admin login works.
2. Normal user login works.
3. Project list loads.
4. Project detail loads.
5. Task list loads.
6. Task create/update/delete works.
7. Task description is preserved and editable.
8. Documents list and upload/download work.
9. Notifications load.
10. Realtime project/task/document changes appear without page refresh.
11. Chat opens to the under-construction panel only.
12. Client errors insert into `error_reports`.
13. Installer can be built and installed on Windows.

Visual polish, redesigned screens, and deeper admin improvements come after these items are stable.

## Staging Validation

Expected imported staging counts:

| Table | Expected Count |
| --- | ---: |
| `profiles` | 6 |
| `workspaces` | 1 |
| `workspace_members` | 6 |
| `projects` | 16 |
| `project_members` | 22 |
| `tasks` | 80 |
| `project_updates` | 1 |
| `documents` | 25 |
| `notifications` | 21 |
| `activity_log` | 560 |

Storage validation:

- Every `documents.storage_path` should have a matching file in the `worktracker-documents` bucket.
- Missing files should be logged before production cutover.

## Production Cutover

Only after the staging installer passes validation:

1. Announce a maintenance window.
2. Stop publishing app updates temporarily.
3. Create a final production Supabase backup.
4. Save the current installer/release as rollback.
5. Apply the v3 schema to production.
6. Run the final production restore/migration.
7. Validate production row counts and storage.
8. Publish the v3 installer/update.
9. Verify login, projects, tasks, documents, realtime, and error reporting from a clean installed app.
10. Monitor `error_reports` and admin notifications.

## Rollback Plan

If critical issues appear during cutover:

- Stop the v3 release rollout.
- Reinstall or republish the previous stable installer.
- Keep users on the old `wt_*` tables.
- Restore production from the final backup only if the v3 process changed production data in a way that blocks live usage.
- Do not delete the v3 staging project; use it to fix and retry.

## Build Order

1. Add a v3 runtime mode that can point to staging.
2. Replace old `wt_*` table calls in the active app adapter with v3 equivalents.
3. Map v3 rows back to the current UI model so the UI keeps working.
4. Wire Supabase Auth login/session handling.
5. Replace realtime subscriptions with v3 tables.
6. Keep chat disabled.
7. Run staging validation.
8. Build a staging Windows installer.
9. Test on a clean machine/profile.
10. Prepare production cutover package.

## Current Build Notes

- Production remains on `supabaseSchemaVersion: 'v2'` in `config.js`.
- A staging-only v3 bridge has been added in `sync-v3.js`.
- To test staging, copy `config.v3-staging.example.js` values into `config.js`, using the staging Supabase URL and anon/publishable key.
- The v3 bridge signs in with Supabase Auth and then hydrates LocalDB from v3 tables.
- The current UI still uses local numeric IDs; `sync-v3.js` maps v3 UUIDs to stable local IDs.
- Realtime v3 subscriptions trigger a debounced v3 pull for work-tracking tables.
- Run `scripts/validate-v3-staging.ps1` before app testing to confirm staging counts and document storage references.
- Black Edition is now the active visual direction: app tokens, status badges, user avatars, chat-disabled art, splash/logo surfaces, favicon, and installer icon assets should remain black/white/grayscale.
- The admin user edit flow now uses the Black Edition editor with avatar preview, role cards, account activity stats, permission preview, reset/cancel/save actions, and no visible color picker.
