-- WorkTracker v3 patch: auth/theme/admin rebuild support.
-- Apply to the staging v3 Supabase project that already has schema_v3.sql.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists gender text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists address text not null default '',
  add column if not exists hours_logged_total numeric(10,2) not null default 0,
  add column if not exists metadata jsonb not null default '{}';

alter table public.documents
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null,
  add column if not exists delete_reason text not null default '',
  add column if not exists is_hidden boolean not null default false;

create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  steps jsonb not null default '[]',
  fields jsonb not null default '[]',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_hidden_idx on public.documents(project_id, is_hidden, deleted_at);
create index if not exists task_templates_workspace_idx on public.task_templates(workspace_id, name);

alter table public.task_templates enable row level security;

drop policy if exists documents_access on public.documents;
create policy documents_access on public.documents for select to authenticated using (
  public.can_access_project(project_id) and (not is_hidden or public.is_admin())
);

drop policy if exists task_templates_read on public.task_templates;
create policy task_templates_read on public.task_templates for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = task_templates.workspace_id and wm.user_id = auth.uid()
  )
);

drop policy if exists task_templates_admin on public.task_templates;
create policy task_templates_admin on public.task_templates for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.notify_admin_document_hidden()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_hidden = true and coalesce(old.is_hidden, false) = false then
    insert into public.notifications (user_id, actor_user_id, type, entity_type, entity_id, project_id, message)
    select p.id, new.deleted_by, 'document_hidden', 'document', new.id, new.project_id,
      coalesce(actor.display_name, actor.username, 'A user') || ' removed "' || new.file_name || '" from project view.'
    from public.profiles p
    left join public.profiles actor on actor.id = new.deleted_by
    where p.role = 'admin';

    insert into public.activity_log (user_id, project_id, entity_type, entity_id, action, details)
    values (new.deleted_by, new.project_id, 'document', new.id, 'deleted', new.file_name);
  end if;
  return new;
end;
$$;

drop trigger if exists documents_hidden_notify_admins on public.documents;
create trigger documents_hidden_notify_admins
after update of is_hidden on public.documents
for each row execute function public.notify_admin_document_hidden();

do $$ declare t text;
begin
  foreach t in array array[
    'profiles','projects','tasks','project_updates','documents',
    'notifications','error_reports','activity_log','project_members','task_templates'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      null;
    end;
  end loop;
end $$;
