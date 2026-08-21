-- Staging-first RLS hardening for Orbitrack Executive.
--
-- Purpose:
-- - Remove the historical wt_anon_all blanket policy.
-- - Deny anonymous access to private workspace data.
-- - Keep browser clients away from password_hash/salt.
-- - Make project/task/file access depend on auth.uid() + wt_users membership.
--
-- Deploy only to staging first. Back up database/storage metadata before running
-- against production.

alter table public.wt_users add column if not exists auth_user_id uuid references auth.users(id);

create or replace function public.wt_my_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.wt_users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.wt_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.wt_users
    where auth_user_id = auth.uid()
      and role in ('admin', 'super_admin', 'owner')
  );
$$;

create or replace function public.wt_is_project_member(pid bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.wt_is_admin(), false)
    or exists (
      select 1
      from public.wt_projects p
      where p.id = pid
        and (
          p.owner_id = public.wt_my_id()
          or p.editor_ids @> to_jsonb(public.wt_my_id())
          or (
            p.classroom_id is not null
            and exists (
              select 1 from public.wt_user_classrooms uc
              where uc.user_id = public.wt_my_id()
                and uc.classroom_id = p.classroom_id
            )
            and not (p.hidden_from_ids @> to_jsonb(public.wt_my_id()))
          )
        )
    );
$$;

create or replace function public.wt_can_edit_project(pid bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.wt_is_admin(), false)
    or exists (
      select 1
      from public.wt_projects p
      where p.id = pid
        and (
          p.owner_id = public.wt_my_id()
          or p.editor_ids @> to_jsonb(public.wt_my_id())
        )
    );
$$;

grant execute on function public.wt_my_id() to anon, authenticated;
grant execute on function public.wt_is_admin() to anon, authenticated;
grant execute on function public.wt_is_project_member(bigint) to anon, authenticated;
grant execute on function public.wt_can_edit_project(bigint) to anon, authenticated;

do $$ declare t text;
begin
  foreach t in array array[
    'wt_users','wt_classrooms','wt_user_classrooms','wt_settings','wt_departments','wt_projects','wt_tasks','wt_milestones',
    'wt_updates','wt_attachments','wt_activity_log','wt_notifications','wt_webhooks','wt_sessions',
    'wt_project_access_requests','wt_bug_reports','wt_discord_messages','wt_direct_messages',
    'wt_workflow_templates','wt_user_favorites','wt_personal_notes'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists wt_anon_all on public.%I', t);
  end loop;
end $$;

revoke select (password_hash, salt) on public.wt_users from anon, authenticated;

drop policy if exists wt_users_safe_select on public.wt_users;
create policy wt_users_safe_select on public.wt_users
  for select to authenticated
  using (auth_user_id = auth.uid() or public.wt_is_admin());

drop policy if exists wt_users_self_update on public.wt_users;
create policy wt_users_self_update on public.wt_users
  for update to authenticated
  using (auth_user_id = auth.uid() or public.wt_is_admin())
  with check (auth_user_id = auth.uid() or public.wt_is_admin());

drop policy if exists wt_projects_member_select on public.wt_projects;
create policy wt_projects_member_select on public.wt_projects
  for select to authenticated
  using (public.wt_is_project_member(id));

drop policy if exists wt_projects_member_insert on public.wt_projects;
create policy wt_projects_member_insert on public.wt_projects
  for insert to authenticated
  with check (owner_id = public.wt_my_id() or public.wt_is_admin());

drop policy if exists wt_projects_editor_update on public.wt_projects;
create policy wt_projects_editor_update on public.wt_projects
  for update to authenticated
  using (public.wt_can_edit_project(id))
  with check (public.wt_can_edit_project(id));

drop policy if exists wt_projects_editor_delete on public.wt_projects;
create policy wt_projects_editor_delete on public.wt_projects
  for delete to authenticated
  using (public.wt_can_edit_project(id));

drop policy if exists wt_tasks_member_select on public.wt_tasks;
create policy wt_tasks_member_select on public.wt_tasks
  for select to authenticated
  using (public.wt_is_project_member(project_id));

drop policy if exists wt_tasks_editor_insert on public.wt_tasks;
create policy wt_tasks_editor_insert on public.wt_tasks
  for insert to authenticated
  with check (public.wt_can_edit_project(project_id));

drop policy if exists wt_tasks_editor_update on public.wt_tasks;
create policy wt_tasks_editor_update on public.wt_tasks
  for update to authenticated
  using (public.wt_can_edit_project(project_id))
  with check (public.wt_can_edit_project(project_id));

drop policy if exists wt_tasks_editor_delete on public.wt_tasks;
create policy wt_tasks_editor_delete on public.wt_tasks
  for delete to authenticated
  using (public.wt_can_edit_project(project_id));

drop policy if exists project_files_select on public.project_files;
create policy project_files_select on public.project_files
  for select to authenticated
  using (deleted_at is null and public.wt_is_project_member(project_id));

drop policy if exists project_files_block_writes on public.project_files;
create policy project_files_block_writes on public.project_files
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists wt_sessions_self_select on public.wt_sessions;
create policy wt_sessions_self_select on public.wt_sessions
  for select to authenticated
  using (user_id = public.wt_my_id() or public.wt_is_admin());

drop policy if exists wt_sessions_self_write on public.wt_sessions;
create policy wt_sessions_self_write on public.wt_sessions
  for all to authenticated
  using (user_id = public.wt_my_id() or public.wt_is_admin())
  with check (user_id = public.wt_my_id() or public.wt_is_admin());

drop policy if exists wt_activity_member_select on public.wt_activity_log;
create policy wt_activity_member_select on public.wt_activity_log
  for select to authenticated
  using (
    user_id = public.wt_my_id()
    or public.wt_is_admin()
    or (project_id is not null and public.wt_is_project_member(project_id))
  );

drop policy if exists wt_activity_self_insert on public.wt_activity_log;
create policy wt_activity_self_insert on public.wt_activity_log
  for insert to authenticated
  with check (user_id = public.wt_my_id() or public.wt_is_admin());

update storage.buckets
set public = false
where id = 'project-files';

drop policy if exists wt_storage_read on storage.objects;
drop policy if exists wt_storage_write on storage.objects;
drop policy if exists wt_storage_delete on storage.objects;

notify pgrst, 'reload schema';
