-- Hybrid storage migration: file CONTENT lives in Google Drive; METADATA and
-- authorization live in Supabase. IDs are bigint to match the existing
-- Orbitrack schema (wt_users.id, wt_projects.id) — NOT uuid.
--
-- Run once in the Supabase SQL editor (or via `supabase db push`).
-- Idempotent: safe to re-run.

-- ── Membership / role helpers (reuse the existing app authorization model) ──
-- These mirror canEdit()/isAdmin()/classroom-membership from app.js so RLS and
-- the Edge Functions enforce the SAME rules. SECURITY DEFINER so they can read
-- wt_* regardless of the caller's row policies.

create or replace function public.wt_is_project_member(pid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.wt_users u
    where u.auth_user_id = auth.uid()
      and (
        u.role = 'admin'
        or exists (
          select 1 from public.wt_projects p
          where p.id = pid
            and (
              p.owner_id = u.id
              or p.editor_ids @> to_jsonb(u.id)
              or (
                p.classroom_id is not null
                and exists (
                  select 1 from public.wt_user_classrooms uc
                  where uc.user_id = u.id and uc.classroom_id = p.classroom_id
                )
                and not (p.hidden_from_ids @> to_jsonb(u.id))
              )
            )
        )
      )
  );
$$;

create or replace function public.wt_can_edit_project(pid bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.wt_users u
    where u.auth_user_id = auth.uid()
      and (
        u.role = 'admin'
        or exists (
          select 1 from public.wt_projects p
          where p.id = pid and (p.owner_id = u.id or p.editor_ids @> to_jsonb(u.id))
        )
      )
  );
$$;

grant execute on function public.wt_is_project_member(bigint) to anon, authenticated;
grant execute on function public.wt_can_edit_project(bigint) to anon, authenticated;

-- ── Per-project Drive folder IDs ────────────────────────────────────────────
create table if not exists public.project_storage_folders (
  project_id                bigint primary key references public.wt_projects(id) on delete cascade,
  drive_project_folder_id   text,
  drive_images_folder_id    text,
  drive_documents_folder_id text,
  drive_videos_folder_id    text,
  drive_other_folder_id     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── File metadata (one row per uploaded file; content is in Drive) ──────────
create table if not exists public.project_files (
  id              uuid primary key default gen_random_uuid(),
  project_id      bigint not null references public.wt_projects(id) on delete cascade,
  task_id         bigint references public.wt_tasks(id) on delete set null,
  uploaded_by     bigint references public.wt_users(id),
  provider        text not null default 'google_drive',
  drive_file_id   text not null unique,
  drive_folder_id text,
  original_name   text not null,
  stored_name     text,
  mime_type       text,
  size_bytes      bigint,
  file_category   text,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists project_files_project_idx on public.project_files(project_id) where deleted_at is null;
create index if not exists project_files_task_idx    on public.project_files(task_id)    where deleted_at is null;

-- ── Row Level Security ──────────────────────────────────────────────────────
-- SELECT is allowed for project members holding a real Supabase Auth JWT
-- (defense-in-depth). ALL writes are blocked for anon/authenticated clients —
-- only the Edge Functions (service-role key, bypasses RLS) insert/update/delete,
-- and they re-enforce membership/role in code. This satisfies "do not give
-- frontend users unrestricted insert/update/delete that bypasses backend authz".
alter table public.project_files          enable row level security;
alter table public.project_storage_folders enable row level security;

drop policy if exists project_files_select on public.project_files;
create policy project_files_select on public.project_files
  for select using (deleted_at is null and public.wt_is_project_member(project_id));

drop policy if exists project_files_block_writes on public.project_files;
create policy project_files_block_writes on public.project_files
  for all using (false) with check (false);

drop policy if exists psf_select on public.project_storage_folders;
create policy psf_select on public.project_storage_folders
  for select using (public.wt_is_project_member(project_id));

drop policy if exists psf_block_writes on public.project_storage_folders;
create policy psf_block_writes on public.project_storage_folders
  for all using (false) with check (false);

notify pgrst, 'reload schema';
