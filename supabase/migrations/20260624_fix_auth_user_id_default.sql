-- Fix: createUser failing with
--   duplicate key value violates unique constraint "wt_users_auth_user_id_uniq"
--
-- The live wt_users.auth_user_id column was given a DEFAULT of auth.uid() (added
-- out-of-band with the auth integration). While the client had no Supabase Auth
-- session this defaulted to NULL and was harmless; once Google Drive storage was
-- enabled (v3.2.1) every request carries the admin's auth session, so each NEW
-- user row defaulted auth_user_id to the *admin's* uid and collided with the
-- admin's own row.
--
-- auth_user_id must be linked at the user's OWN first login, never defaulted to
-- whoever inserts the row. Drop the default. (The app also now inserts an
-- explicit NULL as a belt-and-suspenders, so this is the proper backend cleanup.)

alter table public.wt_users alter column auth_user_id drop default;

-- If a BEFORE INSERT trigger (rather than a column default) is forcing
-- auth_user_id = auth.uid(), drop it too. Uncomment after confirming the name:
--   select tgname from pg_trigger where tgrelid = 'public.wt_users'::regclass and not tgisinternal;
-- alter table public.wt_users disable trigger <trigger_name>;
-- drop trigger <trigger_name> on public.wt_users;
