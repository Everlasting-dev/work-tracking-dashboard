# WorkTracker Rebuild Implementation Notes

## What Has Been Implemented

- Local repo backup was created before code changes:
  `C:\Users\Vengeance\Documents\work-tracking-dashboard-backup-20260609-094408`
- Chat is disabled at the UI and form-handler level.
  The dock remains visible, but opening it now shows a monochrome under-construction panel.
- Chat realtime subscriptions for direct messages and Discord messages are disabled.
- Sidebar clock now uses one guarded one-second timer instead of repeatable animation-frame loops.
- Global error reporting was added for runtime errors, unhandled promises, and sync failures.
  It tries the v3 `error_reports` table first and falls back to current bug reports.
- Black Edition token colors are now grayscale, including status color variables.
- Added staged v3 Supabase schema:
  `supabase/schema_v3.sql`
- Added v2-to-v3 migration scaffold:
  `supabase/migrate_v2_to_v3.sql`
- Added local Supabase backup tool:
  `scripts/backup-supabase.ps1`
- Added Windows desktop release workflow:
  `.github/workflows/release-desktop.yml`

## Supabase Backup Command

Run this with a service-role key, not the publishable anon key:

```powershell
.\scripts\backup-supabase.ps1 `
  -SupabaseUrl "https://YOUR_PROJECT.supabase.co" `
  -ServiceRoleKey "YOUR_SERVICE_ROLE_KEY"
```

The tool writes a timestamped bundle under `supabase-backups/` with:

- table JSON files
- storage files
- schema copies
- manifest checksums
- restore notes

## Staged Cutover Flow

1. Run the backup command and verify `manifest.json`.
2. Create a staging Supabase project.
3. Apply `supabase/schema_v3.sql`.
4. Create Supabase Auth accounts for legacy users with a service-role script.
5. Populate `_wt_user_migration_map`.
6. Run `supabase/migrate_v2_to_v3.sql`.
7. Compare old and new row counts, task status counts, document counts, and project progress.
8. Only after staging validation, plan production cutover.

## Remaining Large Work

- Replace the current internal username/password login flow fully with Supabase Auth UI/session handling.
- Update the runtime data adapter to speak directly to v3 table names.
- Build the full redesigned app shell and admin/user-edit interfaces on top of the v3 model.
- Add a service-role restore/import tool that creates Auth users and uploads migrated storage.
- Regenerate `.ico`/`.png` installer icons from the monochrome SVG in a machine with image tooling available.
