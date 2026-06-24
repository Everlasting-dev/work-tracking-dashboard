-- Optional hardening for user deletion.
--
-- Several FKs to wt_users had NO on-delete rule, so leftover rows blocked
-- `delete from wt_users` (wt_activity_log.user_id is the guaranteed blocker —
-- every user has activity rows). The app now clears/reassigns these references
-- before deleting, so deletion works WITHOUT this migration; running it makes the
-- database resilient even if some reference is missed.
--
-- Constraint names below are Postgres' auto-generated defaults (<table>_<col>_fkey).
-- wt_attachments.uploaded_by is NOT NULL (can't SET NULL) and its files belong to
-- the project, so the app reassigns it to the deleting admin rather than cascading.

-- Activity log: remove the deleted user's own entries.
alter table public.wt_activity_log drop constraint if exists wt_activity_log_user_id_fkey;
alter table public.wt_activity_log
  add constraint wt_activity_log_user_id_fkey
  foreign key (user_id) references public.wt_users(id) on delete cascade;

-- Project updates: keep the update, null its author.
alter table public.wt_updates drop constraint if exists wt_updates_user_id_fkey;
alter table public.wt_updates
  add constraint wt_updates_user_id_fkey
  foreign key (user_id) references public.wt_users(id) on delete set null;
