# Supabase Security Runbook

## Goal

Move Orbitrack Executive to least-privilege Supabase access before any public release.

## What Changed Locally

- Browser login no longer verifies `password_hash`/`salt`.
- Browser source no longer embeds a reusable password pepper.
- `auth-password-login` Edge Function resolves username/email and links `auth_user_id` from a service-role boundary.
- Existing vanilla users can sign in with the same username/password through a
  server-side PBKDF2 compatibility bridge. On the first successful legacy
  credential check, the function creates or updates the Supabase Auth account
  and links it to `wt_users.auth_user_id`.
- `20260821_secure_executive_rls.sql` removes the blanket `wt_anon_all` policy for core tables and denies anonymous private data access.

## Required Secrets

For `auth-password-login`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not place service-role keys in frontend `.env` files.

## Staging Deployment Order

1. Back up database and storage metadata.
2. Deploy `auth-password-login` without JWT preverification because login callers
   do not have a session yet:
   `supabase functions deploy auth-password-login --project-ref <project-ref> --no-verify-jwt`.
3. Apply `20260821_secure_executive_rls.sql` to staging.
4. Test username login for an existing vanilla user that does not yet have `auth_user_id`; it should link on first successful login.
5. Test email login and username login for an already-linked user.
6. Verify anonymous requests to `wt_users`, `wt_projects`, `wt_tasks`, `project_files`, `wt_sessions`, and `wt_activity_log` are denied.
7. Verify project owner/editor/admin access still works.
8. Only then schedule production deployment.

## Rollback

Rollback should be a reviewed SQL migration, not a blanket return to `wt_anon_all`. If a production issue blocks users, temporarily route through Edge Functions/service-role guarded endpoints while preserving anonymous denial.

## Release Hold

Do not ship publicly if any browser bundle contains `password_hash`, `salt`, `DRIVE_PEPPER`, deterministic password derivation, or service-role credentials.

## Local Function Checks

- `deno check supabase/functions/auth-password-login/index.ts`
- `deno test --allow-env supabase/functions/tests/`
