-- Collaborative brainstorm canvas tables for Orbitrack.
--
-- Run this once in the Supabase SQL editor.
--
-- Design notes:
--  * Canvas rooms are STANDALONE (not tied to a project). A room becomes a
--    project later via the AI Copilot hand-off.
--  * These tables are INTENTIONALLY separate from wt_projects/wt_tasks and are
--    NOT touched by the app's normal sync queue, so the Yjs blob can't collide
--    with the task/project last-write-wins pipeline.
--  * Live collaboration rides Supabase Realtime *broadcast* channels
--    (canvas:room:<id>), so these tables do NOT need to be in the realtime
--    publication — they only persist/load the latest snapshot.
--  * `doc` is the base64-encoded Yjs document update (Y.encodeStateAsUpdate).

-- Room registry --------------------------------------------------------------
create table if not exists public.wt_canvas_rooms (
  id            text primary key,
  name          text not null default 'Untitled canvas',
  owner_id      bigint,
  classroom_id  bigint,
  is_private    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Per-room canvas document ---------------------------------------------------
create table if not exists public.wt_canvas_room_docs (
  room_id     text primary key references public.wt_canvas_rooms(id) on delete cascade,
  doc         text not null,
  updated_at  timestamptz not null default now()
);

alter table public.wt_canvas_rooms     enable row level security;
alter table public.wt_canvas_room_docs enable row level security;

-- Match the access model the app uses for other wt_* tables (publishable/anon
-- key). If your other tables use stricter auth policies, mirror those here.
drop policy if exists wt_canvas_rooms_rw on public.wt_canvas_rooms;
create policy wt_canvas_rooms_rw on public.wt_canvas_rooms for all using (true) with check (true);

drop policy if exists wt_canvas_room_docs_rw on public.wt_canvas_room_docs;
create policy wt_canvas_room_docs_rw on public.wt_canvas_room_docs for all using (true) with check (true);

-- NOTE: the earlier per-project table wt_canvas_documents is no longer used by
-- the app (canvas is now room-based). You may drop it if you created it:
--   drop table if exists public.wt_canvas_documents;
