-- wt_canvas_documents — per-project collaborative canvas (tldraw + Yjs) state.
--
-- Run this once in the Supabase SQL editor for the Orbitrack project.
--
-- Notes:
--  * This table is INTENTIONALLY separate from wt_projects/wt_tasks and is NOT
--    touched by the app's normal sync queue, so the Yjs blob can't collide with
--    the task/project last-write-wins pipeline.
--  * Live collaboration rides Supabase Realtime *broadcast* channels
--    (canvas:project:<id>), so this table does NOT need to be added to the
--    realtime publication — it is only used to persist/load the latest snapshot.
--  * `doc` is the base64-encoded Yjs document update (Y.encodeStateAsUpdate).

create table if not exists public.wt_canvas_documents (
  project_id  bigint primary key references public.wt_projects(id) on delete cascade,
  doc         text not null,
  updated_at  timestamptz not null default now()
);

alter table public.wt_canvas_documents enable row level security;

-- Match the access model the app uses for other wt_* tables (publishable/anon
-- key). If your other tables use stricter auth policies, mirror those here
-- instead of these permissive ones.
drop policy if exists wt_canvas_documents_rw on public.wt_canvas_documents;
create policy wt_canvas_documents_rw
  on public.wt_canvas_documents
  for all
  using (true)
  with check (true);
