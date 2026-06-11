-- WorkTracker v3 staged schema
-- Apply this to a staging Supabase project/schema first. Do not run against
-- production until the backup bundle and restore validation pass.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  username text not null unique,
  email text not null default '',
  role text not null default 'user' check (role in ('admin', 'manager', 'user')),
  department text not null default '',
  avatar_url text not null default '',
  color text not null default '#000000',
  bio text not null default '',
  birth_date date,
  gender text not null default '',
  phone text not null default '',
  address text not null default '',
  hours_logged_total numeric(10,2) not null default 0,
  metadata jsonb not null default '{}',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'WorkTracker',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  department text not null default '',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  access text not null default 'editor' check (access in ('viewer', 'editor', 'owner')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  sort_order int not null default 0,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  custom_fields jsonb not null default '[]',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  document_type text not null default '',
  storage_path text not null,
  size_bytes bigint not null default 0,
  checksum_sha256 text not null default '',
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  delete_reason text not null default '',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

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

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  type text not null default 'info',
  entity_type text,
  entity_id uuid,
  project_id uuid references public.projects(id) on delete cascade,
  message text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  kind text not null default 'client_error',
  message text not null default '',
  stack text not null default '',
  route text not null default '',
  app_version text not null default '',
  user_agent text not null default '',
  context jsonb not null default '{}',
  status text not null default 'open' check (status in ('open', 'triaged', 'resolved', 'ignored')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  entity_type text not null default 'system',
  entity_id uuid,
  action text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists projects_workspace_idx on public.projects(workspace_id, updated_at desc);
create index if not exists tasks_project_idx on public.tasks(project_id, sort_order, updated_at desc);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id, updated_at desc);
create index if not exists documents_project_idx on public.documents(project_id, created_at desc);
create index if not exists documents_hidden_idx on public.documents(project_id, is_hidden, deleted_at);
create index if not exists task_templates_workspace_idx on public.task_templates(workspace_id, name);
create index if not exists notifications_user_idx on public.notifications(user_id, read_at, created_at desc);
create index if not exists error_reports_status_idx on public.error_reports(status, created_at desc);
create index if not exists activity_project_idx on public.activity_log(project_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.can_access_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_uuid and p.owner_id = auth.uid())
    or exists (select 1 from public.project_members pm where pm.project_id = project_uuid and pm.user_id = auth.uid())
    or exists (select 1 from public.tasks t where t.project_id = project_uuid and t.assignee_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.project_updates enable row level security;
alter table public.documents enable row level security;
alter table public.task_templates enable row level security;
alter table public.notifications enable row level security;
alter table public.error_reports enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists admin_all_workspaces on public.workspaces;
create policy admin_all_workspaces on public.workspaces for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists member_read_workspaces on public.workspaces;
create policy member_read_workspaces on public.workspaces for select to authenticated using (
  exists (select 1 from public.workspace_members wm where wm.workspace_id = id and wm.user_id = auth.uid())
);

drop policy if exists workspace_members_visible on public.workspace_members;
create policy workspace_members_visible on public.workspace_members for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists workspace_members_admin on public.workspace_members;
create policy workspace_members_admin on public.workspace_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_access on public.projects;
create policy projects_access on public.projects for select to authenticated using (public.can_access_project(id));
drop policy if exists projects_write on public.projects;
create policy projects_write on public.projects for all to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists project_members_access on public.project_members;
create policy project_members_access on public.project_members for select to authenticated using (public.can_access_project(project_id));
drop policy if exists project_members_write on public.project_members;
create policy project_members_write on public.project_members for all to authenticated using (
  public.is_admin() or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

drop policy if exists tasks_access on public.tasks;
create policy tasks_access on public.tasks for select to authenticated using (public.can_access_project(project_id));
drop policy if exists tasks_write on public.tasks;
create policy tasks_write on public.tasks for all to authenticated using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

drop policy if exists updates_access on public.project_updates;
create policy updates_access on public.project_updates for select to authenticated using (public.can_access_project(project_id));
drop policy if exists updates_write on public.project_updates;
create policy updates_write on public.project_updates for insert to authenticated with check (public.can_access_project(project_id));

drop policy if exists documents_access on public.documents;
create policy documents_access on public.documents for select to authenticated using (
  public.can_access_project(project_id) and (not is_hidden or public.is_admin())
);
drop policy if exists documents_write on public.documents;
create policy documents_write on public.documents for all to authenticated using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

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

drop policy if exists task_templates_read on public.task_templates;
create policy task_templates_read on public.task_templates for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = task_templates.workspace_id and wm.user_id = auth.uid()
  )
);
drop policy if exists task_templates_admin on public.task_templates;
create policy task_templates_admin on public.task_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists notifications_write on public.notifications;
create policy notifications_write on public.notifications for all to authenticated using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid());

drop policy if exists error_reports_insert on public.error_reports;
create policy error_reports_insert on public.error_reports for insert to authenticated with check (user_id = auth.uid() or user_id is null);
drop policy if exists error_reports_admin on public.error_reports;
create policy error_reports_admin on public.error_reports for select to authenticated using (public.is_admin() or user_id = auth.uid());

drop policy if exists activity_access on public.activity_log;
create policy activity_access on public.activity_log for select to authenticated using (public.is_admin() or project_id is null or public.can_access_project(project_id));
drop policy if exists activity_write on public.activity_log;
create policy activity_write on public.activity_log for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public)
values ('worktracker-documents', 'worktracker-documents', false)
on conflict (id) do nothing;

drop policy if exists documents_storage_read on storage.objects;
create policy documents_storage_read on storage.objects for select to authenticated using (
  bucket_id = 'worktracker-documents'
);
drop policy if exists documents_storage_write on storage.objects;
create policy documents_storage_write on storage.objects for insert to authenticated with check (
  bucket_id = 'worktracker-documents'
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  visibility text not null default 'team',
  classroom_id uuid,
  related_project_id uuid references public.projects(id) on delete set null,
  related_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_activity_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  active_minutes int not null default 0,
  action_count int not null default 0,
  unique (user_id, date)
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  from_task_id uuid not null references public.tasks(id) on delete cascade,
  to_task_id uuid not null references public.tasks(id) on delete cascade,
  type text not null default 'blocks',
  created_at timestamptz not null default now(),
  unique (project_id, from_task_id, to_task_id)
);

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
