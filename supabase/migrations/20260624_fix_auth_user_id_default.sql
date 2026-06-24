-- Fix: createUser failing with
--   duplicate key value violates unique constraint "wt_users_auth_user_id_uniq"
--
-- ROOT CAUSE (confirmed against the live DB): wt_users.auth_user_id has no column
-- default. Instead a BEFORE INSERT trigger `wt_users_set_auth_user_id_trigger`
-- runs `wt_users_set_auth_user_id()`, which did:
--     if NEW.auth_user_id is null then NEW.auth_user_id := auth.uid(); end if;
-- While the client had no Supabase Auth session this set NULL (harmless). Once
-- Drive storage (v3.2.1) gave the admin a live auth session, every NEW user the
-- admin inserts got the ADMIN's auth.uid() stamped on it -> collided with the
-- admin's own row. The app's explicit `auth_user_id: null` couldn't help because
-- the trigger fires precisely when it's null.
--
-- Fix: guard the trigger so it only auto-links a genuine self-signup (an auth
-- user not yet linked to any wt_users row). Admins creating accounts for others
-- no longer re-stamp their own id. Each user still links at their own first login.
-- (This was applied to production on 2026-06-24 via the Management API.)

create or replace function public.wt_users_set_auth_user_id()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $fn$
begin
  if NEW.auth_user_id is null
     and auth.uid() is not null
     and not exists (select 1 from public.wt_users where auth_user_id = auth.uid()) then
    NEW.auth_user_id := auth.uid();
  end if;
  return NEW;
end;
$fn$;
