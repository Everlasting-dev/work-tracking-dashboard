alter table public.wt_users add column if not exists avatar_drive_id text;
alter table public.wt_users add column if not exists avatar_updated_at timestamptz;
alter table public.wt_users add column if not exists tagline text not null default '';
alter table public.wt_users add column if not exists accent_color text not null default '';
alter table public.wt_users add column if not exists cover_color text not null default '';
alter table public.wt_users add column if not exists hide_from_team_map boolean not null default false;
-- Missing in production: the roster select lists hide_score, so its absence made
-- the whole wt_users pull fail with 42703 (see 20260715_score_privacy.sql).
alter table public.wt_users add column if not exists hide_score boolean not null default false;

notify pgrst, 'reload schema';
