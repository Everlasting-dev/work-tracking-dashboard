-- Prevent tasks from being written into projects the signed-in WorkTracker user
-- cannot edit. Reads remain permissive for the legacy v2 client bootstrap.

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
      and role = 'admin'
  );
$$;

create or replace function public.wt_can_write_project(project_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select public.wt_my_id() as id
  )
  select coalesce(public.wt_is_admin(), false)
    or exists (
      select 1
      from public.wt_projects p
      cross join me
      where p.id = project_id
        and me.id is not null
        and (
          p.owner_id = me.id
          or exists (
            select 1
            from jsonb_array_elements_text(coalesce(p.editor_ids, '[]'::jsonb)) editor(value)
            where editor.value ~ '^[0-9]+$'
              and editor.value::bigint = me.id
          )
        )
    );
$$;

grant execute on function public.wt_is_admin() to anon, authenticated;
grant execute on function public.wt_can_write_project(bigint) to anon, authenticated;

drop policy if exists wt_anon_all on public.wt_tasks;
drop policy if exists wt_tasks_read_all on public.wt_tasks;
drop policy if exists wt_tasks_insert_project_access on public.wt_tasks;
drop policy if exists wt_tasks_update_project_access on public.wt_tasks;
drop policy if exists wt_tasks_delete_project_access on public.wt_tasks;

create policy wt_tasks_read_all
  on public.wt_tasks
  for select
  to anon, authenticated
  using (true);

create policy wt_tasks_insert_project_access
  on public.wt_tasks
  for insert
  to authenticated
  with check (public.wt_can_write_project(project_id));

create policy wt_tasks_update_project_access
  on public.wt_tasks
  for update
  to authenticated
  using (public.wt_can_write_project(project_id))
  with check (public.wt_can_write_project(project_id));

create policy wt_tasks_delete_project_access
  on public.wt_tasks
  for delete
  to authenticated
  using (public.wt_can_write_project(project_id));
