import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from "@/lib/supabase";
import {
  type CreateProjectInput,
  type UpdateWorkspaceTaskBoardInput,
  type UploadWorkspaceFileInput,
  type UserSummary,
  type WorkspaceFile,
  type WorkspaceProjectData,
  type WorkspaceTask,
} from "@/lib/workspaceTypes";

interface RawProject {
  id: number;
  name?: string | null;
  notes?: string | null;
  type?: string | null;
  status?: string | null;
  priority?: string | null;
  owner_id?: number | null;
  classroom_id?: number | null;
  department?: string | null;
  workflow_template?: string | null;
  editor_ids?: number[] | string | null;
  hidden_from_ids?: number[] | string | null;
  completed_at?: string | null;
  is_ongoing?: boolean | null;
  cadence?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RawTask {
  id: number;
  project_id?: number | null;
  title?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  assignee_id?: number | null;
  notes?: string | null;
  sort_order?: number | null;
  updated_at?: string | null;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
  email?: string | null;
  department?: string | null;
  color?: string | null;
  avatar_drive_id?: string | null;
  role?: string | null;
  last_seen_at?: string | null;
}

interface RawDriveFile {
  id: string;
  project_id?: number | null;
  task_id?: number | null;
  original_name?: string | null;
  stored_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  description?: string | null;
  drive_file_id?: string | null;
  created_at?: string | null;
  deleted_at?: string | null;
}

interface RawLegacyAttachment {
  id: number;
  project_id?: number | null;
  task_id?: number | null;
  file_name?: string | null;
  mime_type?: string | null;
  document_type?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
}

function parseIds(value: number[] | string | null | undefined): number[] {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function userName(user?: UserSummary | null) {
  return user?.displayName || user?.username || "Unknown";
}

function userInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "?";
}

function mapUser(row: RawUser): UserSummary {
  const displayName = row.display_name || row.username || `User ${row.id}`;
  return {
    id: row.id,
    username: row.username || displayName,
    displayName,
    email: row.email || "",
    department: row.department || "",
    color: row.color || "",
    avatarDriveId: row.avatar_drive_id || "",
    role: row.role || "",
    lastSeenAt: row.last_seen_at || "",
  };
}

function mapTask(row: RawTask): WorkspaceTask {
  return {
    id: row.id,
    projectId: Number(row.project_id),
    title: row.title || "Untitled task",
    status: row.status || "todo",
    priority: row.priority || "medium",
    dueDate: row.due_date || "",
    assigneeId: row.assignee_id ?? null,
    notes: row.notes || "",
    sortOrder: Number(row.sort_order || 0),
    updatedAt: row.updated_at || "",
  };
}

async function safeSelect<T>(table: string, columns: string) {
  const { data, error } = await supabase.from(table).select(columns);
  if (error) return [] as T[];
  return (data ?? []) as T[];
}

async function ignoreAudit(write: () => PromiseLike<unknown>) {
  try {
    await write();
  } catch {
    // Workspace writes should still complete when activity logging is unavailable.
  }
}

export async function fetchWorkspaceProjectsFromSupabase(): Promise<WorkspaceProjectData> {
  const [projectsRes, tasksRes, usersRes, driveFiles, legacyFiles] = await Promise.all([
    supabase
      .from("wt_projects")
      .select("id,name,notes,type,status,priority,owner_id,classroom_id,department,workflow_template,editor_ids,hidden_from_ids,completed_at,is_ongoing,cadence,created_at,updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("wt_tasks").select("id,project_id,title,status,priority,due_date,assignee_id,notes,sort_order,updated_at").order("sort_order").order("updated_at", { ascending: false }),
    supabase.from("wt_users").select("id,username,display_name,email,department,color,avatar_drive_id,role,last_seen_at"),
    safeSelect<RawDriveFile>("project_files", "id,project_id,task_id,original_name,stored_name,mime_type,size_bytes,description,drive_file_id,created_at,deleted_at"),
    safeSelect<RawLegacyAttachment>("wt_attachments", "id,project_id,task_id,file_name,mime_type,document_type,storage_path,created_at"),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (tasksRes.error) throw tasksRes.error;
  if (usersRes.error) throw usersRes.error;

  const users = ((usersRes.data ?? []) as RawUser[]).map(mapUser);
  const userMap = new Map(users.map((user) => [user.id, user]));
  const tasksByProject = new Map<number, WorkspaceTask[]>();
  for (const task of ((tasksRes.data ?? []) as RawTask[]).map(mapTask)) {
    if (!Number.isFinite(task.projectId)) continue;
    const rows = tasksByProject.get(task.projectId) ?? [];
    rows.push(task);
    tasksByProject.set(task.projectId, rows);
  }

  const filesByProject = new Map<number, WorkspaceFile[]>();
  for (const file of driveFiles) {
    if (!file.project_id || file.deleted_at) continue;
    const rows = filesByProject.get(file.project_id) ?? [];
    rows.push({
      id: file.id,
      projectId: file.project_id,
      taskId: file.task_id ?? null,
      fileName: file.original_name || "Drive file",
      source: "drive",
      mimeType: file.mime_type || "",
      sizeBytes: file.size_bytes ?? null,
      description: file.description || "",
      storageRef: file.stored_name || "",
      driveFileId: file.drive_file_id || "",
      createdAt: file.created_at || "",
      deletedAt: file.deleted_at ?? null,
    });
    filesByProject.set(file.project_id, rows);
  }
  for (const file of legacyFiles) {
    if (!file.project_id) continue;
    const rows = filesByProject.get(file.project_id) ?? [];
    rows.push({
      id: String(file.id),
      projectId: file.project_id,
      taskId: file.task_id ?? null,
      fileName: file.file_name || "Attachment",
      source: "legacy",
      mimeType: file.mime_type || "",
      sizeBytes: null,
      description: file.document_type || "",
      storageRef: file.storage_path || "",
      driveFileId: "",
      createdAt: file.created_at || "",
      deletedAt: null,
    });
    filesByProject.set(file.project_id, rows);
  }

  const today = new Date().toISOString().slice(0, 10);
  const projects = ((projectsRes.data ?? []) as RawProject[]).map((project) => {
    const tasks = [...(tasksByProject.get(project.id) ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || b.updatedAt.localeCompare(a.updatedAt) || a.id - b.id);
    const files = filesByProject.get(project.id) ?? [];
    const doneCount = tasks.filter((task) => task.status === "done").length;
    const doingCount = tasks.filter((task) => task.status === "doing").length;
    const overdueCount = tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "done").length;
    const currentTask = tasks.find((task) => task.status === "doing") ?? tasks.find((task) => task.status === "todo") ?? null;
    const owner = project.owner_id ? userMap.get(project.owner_id) : null;
    const ownerLabel = userName(owner);
    const editorIds = parseIds(project.editor_ids);

    return {
      id: project.id,
      name: project.name || `Project ${project.id}`,
      notes: project.notes || "",
      type: project.type || "project",
      status: project.status || "active",
      priority: project.priority || "medium",
      ownerId: project.owner_id ?? null,
      classroomId: project.classroom_id ?? null,
      department: project.department || owner?.department || "",
      workflowTemplate: project.workflow_template || "",
      isOngoing: Boolean(project.is_ongoing),
      cadence: project.cadence || "",
      editorIds,
      hiddenFromIds: parseIds(project.hidden_from_ids),
      completedAt: project.completed_at || "",
      createdAt: project.created_at || "",
      updatedAt: project.updated_at || "",
      ownerName: ownerLabel,
      ownerInitial: userInitial(ownerLabel),
      memberUsers: editorIds.map((id) => userMap.get(id)).filter(Boolean) as UserSummary[],
      tasks,
      files,
      taskCount: tasks.length,
      doneCount,
      doingCount,
      overdueCount,
      progress: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0,
      currentTask,
    };
  });

  return { projects, users };
}

export async function createWorkspaceProjectInSupabase(input: CreateProjectInput) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("wt_projects")
    .insert({
      name: input.name.trim(),
      notes: input.notes.trim(),
      type: input.type,
      priority: input.priority,
      status: "active",
      department: input.department.trim(),
      owner_id: input.ownerId,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (error) throw error;

  await ignoreAudit(() =>
    supabase.from("wt_activity_log").insert({
      user_id: input.ownerId,
      project_id: data.id,
      action: "created",
      entity_type: "project",
      entity_id: data.id,
      details: input.name.trim(),
    }),
  );

  return Number(data.id);
}

export async function addWorkspaceTaskInSupabase(projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) {
  const now = new Date().toISOString();
  const { count } = await supabase
    .from("wt_tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  const { data, error } = await supabase
    .from("wt_tasks")
    .insert({
      project_id: projectId,
      title: title.trim(),
      notes: notes.trim(),
      status: "todo",
      priority: "medium",
      assignee_id: assigneeId,
      sort_order: count ?? 0,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("wt_projects").update({ updated_at: now }).eq("id", projectId);
  if (actorId) {
    await ignoreAudit(() =>
      supabase.from("wt_activity_log").insert({
        user_id: actorId,
        project_id: projectId,
        action: "created",
        entity_type: "task",
        entity_id: data.id,
        details: title.trim(),
      }),
    );
  }

  return Number(data.id);
}

export async function updateWorkspaceProjectStatusInSupabase(projectId: number, status: string, actorId: number | null) {
  const now = new Date().toISOString();
  const patch: Record<string, string | null> = {
    status,
    updated_at: now,
    completed_at: status === "completed" ? now : null,
  };
  const { error } = await supabase.from("wt_projects").update(patch).eq("id", projectId);
  if (error) throw error;

  if (actorId) {
    await ignoreAudit(() =>
      supabase.from("wt_activity_log").insert({
        user_id: actorId,
        project_id: projectId,
        action: "updated",
        entity_type: "project",
        entity_id: projectId,
        details: `status:${status}`,
      }),
    );
  }
}

export async function updateWorkspaceTaskStatusInSupabase(taskId: number, projectId: number, status: string, actorId: number | null) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("wt_tasks").update({ status, updated_at: now }).eq("id", taskId);
  if (error) throw error;

  await supabase.from("wt_projects").update({ updated_at: now }).eq("id", projectId);
  if (actorId) {
    await ignoreAudit(() =>
      supabase.from("wt_activity_log").insert({
        user_id: actorId,
        project_id: projectId,
        action: "updated",
        entity_type: "task",
        entity_id: taskId,
        details: `status:${status}`,
      }),
    );
  }
}

export async function updateWorkspaceTaskBoardInSupabase({ taskId, projectId, status, orderedIds, actorId }: UpdateWorkspaceTaskBoardInput) {
  const now = new Date().toISOString();
  const updates = orderedIds.map((id, index) =>
    supabase.from("wt_tasks").update({ sort_order: index, updated_at: now, ...(id === taskId ? { status } : {}) }).eq("id", id),
  );
  if (!orderedIds.includes(taskId)) {
    updates.push(supabase.from("wt_tasks").update({ status, updated_at: now }).eq("id", taskId));
  }
  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;

  await supabase.from("wt_projects").update({ updated_at: now }).eq("id", projectId);
  if (actorId) {
    await ignoreAudit(() =>
      supabase.from("wt_activity_log").insert({
        user_id: actorId,
        project_id: projectId,
        action: "reordered",
        entity_type: "task",
        entity_id: taskId,
        details: `status:${status}`,
      }),
    );
  }
}

export async function uploadWorkspaceFileToSupabase({ projectId, taskId = null, description = "", file }: UploadWorkspaceFileInput): Promise<unknown> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Upload needs a Supabase Auth session. Sign in again if this session was restored locally.");

  const form = new FormData();
  form.set("projectId", String(projectId));
  if (taskId) form.set("taskId", String(taskId));
  if (description) form.set("description", description);
  form.set("file", file);

  const url = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/files-upload`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
    body: form,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Upload failed (${response.status}).`);
  }
  return response.json() as Promise<unknown>;
}
