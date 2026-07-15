-- Add score privacy toggles for existing Supabase workspaces.
alter table public.wt_users add column if not exists hide_score boolean not null default false;
alter table if exists public.profiles add column if not exists hide_score boolean not null default false;
