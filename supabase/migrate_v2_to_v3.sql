-- WorkTracker v2 -> v3 migration scaffold
-- Run only in staging after:
-- 1. supabase/schema_v3.sql has been applied.
-- 2. A backup bundle exists locally.
-- 3. auth.users have been created for each legacy wt_users row.
--
-- This script expects a temporary mapping table:
--
-- create table public._wt_user_migration_map (
--   legacy_user_id bigint primary key,
--   auth_user_id uuid not null references auth.users(id)
-- );
--
-- The service-role backup/restore tool should populate that mapping after
-- creating Supabase Auth accounts.

insert into public.profiles (
  id, username, display_name, email, role, department, avatar_url, color, bio, last_seen_at, created_at, updated_at
)
select
  m.auth_user_id,
  u.username,
  coalesce(nullif(u.display_name, ''), u.username),
  coalesce(u.email, ''),
  case when u.role in ('admin', 'manager', 'user') then u.role else 'user' end,
  coalesce(u.department, ''),
  '',
  coalesce(nullif(u.color, ''), '#000000'),
  coalesce(u.bio, ''),
  u.last_seen_at,
  u.created_at,
  now()
from public.wt_users u
join public._wt_user_migration_map m on m.legacy_user_id = u.id
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  email = excluded.email,
  role = excluded.role,
  department = excluded.department,
  color = excluded.color,
  bio = excluded.bio,
  last_seen_at = excluded.last_seen_at,
  updated_at = now();

insert into public.workspaces (id, name, created_by, created_at, updated_at)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  'WorkTracker',
  (select auth_user_id from public._wt_user_migration_map m join public.wt_users u on u.id = m.legacy_user_id where u.role = 'admin' order by u.id limit 1),
  now(),
  now()
on conflict (id) do nothing;

insert into public.workspace_members (workspace_id, user_id, role, created_at)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  m.auth_user_id,
  case when u.role = 'admin' then 'admin' else 'member' end,
  coalesce(u.created_at, now())
from public.wt_users u
join public._wt_user_migration_map m on m.legacy_user_id = u.id
on conflict (workspace_id, user_id) do update set role = excluded.role;

create table if not exists public._wt_project_migration_map (
  legacy_project_id bigint primary key,
  project_id uuid not null unique
);

insert into public._wt_project_migration_map (legacy_project_id, project_id)
select id, gen_random_uuid()
from public.wt_projects
on conflict (legacy_project_id) do nothing;

insert into public.projects (
  id, workspace_id, name, description, status, priority, owner_id, department, progress, metadata, created_at, updated_at, completed_at
)
select
  pm.project_id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  coalesce(nullif(p.name, ''), 'Untitled project'),
  coalesce(p.notes, ''),
  case when p.status in ('active', 'paused', 'completed', 'archived') then p.status else 'active' end,
  case when p.priority in ('low', 'medium', 'high', 'urgent') then p.priority else 'medium' end,
  um.auth_user_id,
  coalesce(p.department, ''),
  0,
  jsonb_build_object(
    'legacyId', p.id,
    'type', p.type,
    'workflowTemplate', p.workflow_template,
    'isOngoing', p.is_ongoing,
    'cadence', p.cadence
  ),
  coalesce(p.created_at, now()),
  coalesce(p.updated_at, now()),
  p.completed_at
from public.wt_projects p
join public._wt_project_migration_map pm on pm.legacy_project_id = p.id
join public._wt_user_migration_map um on um.legacy_user_id = p.owner_id
on conflict (id) do nothing;

insert into public.project_members (project_id, user_id, access, created_at)
select distinct
  pm.project_id,
  um.auth_user_id,
  'owner',
  now()
from public.wt_projects p
join public._wt_project_migration_map pm on pm.legacy_project_id = p.id
join public._wt_user_migration_map um on um.legacy_user_id = p.owner_id
on conflict (project_id, user_id) do nothing;

create table if not exists public._wt_task_migration_map (
  legacy_task_id bigint primary key,
  task_id uuid not null unique
);

insert into public._wt_task_migration_map (legacy_task_id, task_id)
select id, gen_random_uuid()
from public.wt_tasks
on conflict (legacy_task_id) do nothing;

insert into public.tasks (
  id, project_id, title, description, status, priority, assignee_id, due_date, sort_order,
  progress, custom_fields, created_at, updated_at, completed_at
)
select
  tm.task_id,
  pm.project_id,
  coalesce(nullif(t.title, ''), 'Untitled task'),
  coalesce(t.notes, ''),
  case when t.status = 'done' then 'done' when t.status = 'doing' then 'doing' else 'todo' end,
  case when t.priority in ('low', 'medium', 'high', 'urgent') then t.priority else 'medium' end,
  assignee.auth_user_id,
  nullif(t.due_date, '')::date,
  coalesce(t.sort_order, 0),
  case when t.status = 'done' then 100 else 0 end,
  coalesce(t.custom_fields, '[]'::jsonb),
  coalesce(t.created_at, now()),
  coalesce(t.updated_at, now()),
  case when t.status = 'done' then t.updated_at else null end
from public.wt_tasks t
join public._wt_task_migration_map tm on tm.legacy_task_id = t.id
join public._wt_project_migration_map pm on pm.legacy_project_id = t.project_id
left join public._wt_user_migration_map assignee on assignee.legacy_user_id = t.assignee_id
on conflict (id) do nothing;

insert into public.project_updates (project_id, user_id, body, created_at)
select
  pm.project_id,
  um.auth_user_id,
  coalesce(u.content, ''),
  coalesce(u.created_at, now())
from public.wt_updates u
join public._wt_project_migration_map pm on pm.legacy_project_id = u.project_id
left join public._wt_user_migration_map um on um.legacy_user_id = u.user_id
where coalesce(u.content, '') <> '';

insert into public.documents (
  project_id, task_id, uploaded_by, file_name, mime_type, document_type, storage_path, created_at
)
select
  pm.project_id,
  tm.task_id,
  um.auth_user_id,
  coalesce(a.file_name, 'file'),
  coalesce(a.mime_type, 'application/octet-stream'),
  coalesce(a.document_type, ''),
  a.storage_path,
  coalesce(a.created_at, now())
from public.wt_attachments a
join public._wt_project_migration_map pm on pm.legacy_project_id = a.project_id
left join public._wt_task_migration_map tm on tm.legacy_task_id = a.task_id
left join public._wt_user_migration_map um on um.legacy_user_id = a.uploaded_by
where coalesce(a.storage_path, '') <> '';

insert into public.notifications (user_id, actor_user_id, type, entity_type, project_id, message, read_at, created_at)
select
  recipient.auth_user_id,
  actor.auth_user_id,
  coalesce(n.type, 'info'),
  n.entity_type,
  pm.project_id,
  coalesce(n.message, ''),
  n.read_at,
  coalesce(n.created_at, now())
from public.wt_notifications n
join public._wt_user_migration_map recipient on recipient.legacy_user_id = n.user_id
left join public._wt_user_migration_map actor on actor.legacy_user_id = n.actor_user_id
left join public._wt_project_migration_map pm on pm.legacy_project_id = n.project_id;

insert into public.activity_log (user_id, project_id, entity_type, action, details, created_at)
select
  um.auth_user_id,
  pm.project_id,
  coalesce(a.entity_type, 'system'),
  coalesce(a.action, 'updated'),
  coalesce(a.details, ''),
  coalesce(a.created_at, now())
from public.wt_activity_log a
left join public._wt_user_migration_map um on um.legacy_user_id = a.user_id
left join public._wt_project_migration_map pm on pm.legacy_project_id = a.project_id;

update public.projects p
set progress = coalesce(calc.progress, 0)
from (
  select
    project_id,
    round((count(*) filter (where status = 'done')::numeric / nullif(count(*), 0)) * 100)::int as progress
  from public.tasks
  group by project_id
) calc
where p.id = calc.project_id;
