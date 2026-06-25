-- v3.3.0 — "hide me from the team activity map" per-user preference.
-- The app degrades gracefully without this column (the toggle is kept locally and
-- the update drops the unknown column), so it works locally; apply this so the
-- preference persists and syncs across devices. Applied to production 2026-06-25.

alter table public.wt_users add column if not exists hide_from_team_map boolean default false;

-- (The General chat was also cleared this release as a one-time data operation:
--   delete from public.wt_activity_log where action='sent_message' and entity_type='chat' and project_id is null;
--   delete from public.wt_discord_messages where channel_id='general';
--  The admin "Clear General chat" action on the Support page repeats this on demand.)
