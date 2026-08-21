# Supabase Security Runbook

## Goal

Move Orbitrack Executive to least-privilege Supabase access before any public release.

## What Changed Locally

- Browser login no longer verifies `password_hash`/`salt`.
- Browser source no longer embeds a reusable password pepper.
- `auth-password-login` Edge Function resolves username/email and links `auth_user_id` from a service-role boundary.
- `20260821_secure_executive_rls.sql` removes the blanket `wt_anon_all` policy for core tables and denies anonymous private data access.

## Required Secrets

For `auth-password-login`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not place service-role keys in frontend `.env` files.

## Staging Deployment Order

1. Back up database and storage metadata.
2. Deploy `auth-password-login`.
3. Apply `20260821_secure_executive_rls.sql` to staging.
4. Confirm existing users have valid Supabase Auth accounts.
5. Test email login and username login.
6. Verify anonymous requests to `wt_users`, `wt_projects`, `wt_tasks`, `project_files`, `wt_sessions`, and `wt_activity_log` are denied.
7. Verify project owner/editor/admin access still works.
8. Only then schedule production deployment.

## Rollback

Rollback should be a reviewed SQL migration, not a blanket return to `wt_anon_all`. If a production issue blocks users, temporarily route through Edge Functions/service-role guarded endpoints while preserving anonymous denial.

## Release Hold

Do not ship publicly if any browser bundle contains `password_hash`, `salt`, `DRIVE_PEPPER`, deterministic password derivation, or service-role credentials.
