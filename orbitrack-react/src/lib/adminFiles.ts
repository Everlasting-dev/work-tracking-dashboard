import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from "@/lib/supabase";

export type AttachmentSource = "drive" | "legacy";

export interface AttachmentRow {
  id: string;
  source: AttachmentSource;
  projectId: number | null;
  projectName: string;
  taskId: number | null;
  taskTitle: string;
  uploadedBy: number | null;
  uploadedByName: string;
  name: string;
  mimeType: string;
  category: string;
  sizeBytes: number | null;
  storageRef: string;
  driveFileId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentData {
  rows: AttachmentRow[];
  warnings: string[];
}

export interface LoadedAttachment {
  url: string;
  name: string;
  mimeType: string;
}

interface ProjectRow {
  id: number;
  name?: string | null;
}

interface UserRow {
  id: number;
  username?: string | null;
  display_name?: string | null;
}

interface TaskRow {
  id: number;
  title?: string | null;
}

interface DriveFileRow {
  id: string;
  project_id?: number | null;
  task_id?: number | null;
  uploaded_by?: number | null;
  provider?: string | null;
  drive_file_id?: string | null;
  original_name?: string | null;
  stored_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  file_category?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

interface LegacyAttachmentRow {
  id: number;
  project_id?: number | null;
  task_id?: number | null;
  uploaded_by?: number | null;
  file_name?: string | null;
  mime_type?: string | null;
  document_type?: string | null;
  storage_path?: string | null;
  created_at?: string | null;
}

async function safeSelect<T>(table: string, select: string) {
  const { data, error } = await supabase.from(table).select(select);
  if (error) return { data: [] as T[], warning: `${table}: ${error.message}` };
  return { data: (data ?? []) as T[], warning: "" };
}

export async function fetchAttachments(): Promise<AttachmentData> {
  const [drive, legacy, projectsRes, usersRes, tasksRes] = await Promise.all([
    safeSelect<DriveFileRow>(
      "project_files",
      "id,project_id,task_id,uploaded_by,provider,drive_file_id,original_name,stored_name,mime_type,size_bytes,file_category,description,created_at,updated_at,deleted_at",
    ),
    safeSelect<LegacyAttachmentRow>("wt_attachments", "id,project_id,task_id,uploaded_by,file_name,mime_type,document_type,storage_path,created_at"),
    safeSelect<ProjectRow>("wt_projects", "id,name"),
    safeSelect<UserRow>("wt_users", "id,username,display_name"),
    safeSelect<TaskRow>("wt_tasks", "id,title"),
  ]);

  const projects = new Map(projectsRes.data.map((project) => [project.id, project.name || `Project ${project.id}`]));
  const users = new Map(usersRes.data.map((user) => [user.id, user.display_name || user.username || `User ${user.id}`]));
  const tasks = new Map(tasksRes.data.map((task) => [task.id, task.title || `Task ${task.id}`]));

  const driveRows: AttachmentRow[] = drive.data.map((file) => ({
    id: String(file.id),
    source: "drive",
    projectId: file.project_id ?? null,
    projectName: file.project_id ? projects.get(file.project_id) || `Project ${file.project_id}` : "-",
    taskId: file.task_id ?? null,
    taskTitle: file.task_id ? tasks.get(file.task_id) || `Task ${file.task_id}` : "-",
    uploadedBy: file.uploaded_by ?? null,
    uploadedByName: file.uploaded_by ? users.get(file.uploaded_by) || `User ${file.uploaded_by}` : "-",
    name: file.original_name || file.stored_name || `Drive file ${file.id}`,
    mimeType: file.mime_type || "",
    category: file.file_category || "file",
    sizeBytes: file.size_bytes ?? null,
    storageRef: file.stored_name || "",
    driveFileId: file.drive_file_id || "",
    deletedAt: file.deleted_at || "",
    createdAt: file.created_at || "",
    updatedAt: file.updated_at || "",
  }));

  const legacyRows: AttachmentRow[] = legacy.data.map((file) => ({
    id: String(file.id),
    source: "legacy",
    projectId: file.project_id ?? null,
    projectName: file.project_id ? projects.get(file.project_id) || `Project ${file.project_id}` : "-",
    taskId: file.task_id ?? null,
    taskTitle: file.task_id ? tasks.get(file.task_id) || `Task ${file.task_id}` : "-",
    uploadedBy: file.uploaded_by ?? null,
    uploadedByName: file.uploaded_by ? users.get(file.uploaded_by) || `User ${file.uploaded_by}` : "-",
    name: file.file_name || `Legacy attachment ${file.id}`,
    mimeType: file.mime_type || "",
    category: file.document_type || "legacy",
    sizeBytes: null,
    storageRef: file.storage_path || "",
    driveFileId: "",
    deletedAt: "",
    createdAt: file.created_at || "",
    updatedAt: file.created_at || "",
  }));

  const warnings = [drive.warning, legacy.warning, projectsRes.warning, usersRes.warning, tasksRes.warning].filter(Boolean);
  return {
    rows: [...driveRows, ...legacyRows].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    warnings,
  };
}

export async function loadDriveFile(fileId: string): Promise<LoadedAttachment> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Drive preview needs a Supabase Auth session. Log in with a real user before opening files.");

  const params = new URLSearchParams({ id: fileId });
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/files-content?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!response.ok) throw new Error(`Could not open file (${response.status}).`);
  const blob = await response.blob();
  return {
    url: URL.createObjectURL(blob),
    name: fileNameFromDisposition(response.headers.get("content-disposition")) || "attachment",
    mimeType: blob.type || response.headers.get("content-type") || "application/octet-stream",
  };
}

export async function downloadDriveFile(fileId: string, fileName: string) {
  const loaded = await loadDriveFile(fileId);
  const link = document.createElement("a");
  link.href = loaded.url;
  link.download = fileName || loaded.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(loaded.url), 60_000);
}

function fileNameFromDisposition(disposition: string | null) {
  if (!disposition) return "";
  const match = /filename="([^"]+)"/i.exec(disposition);
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function driveWebUrl(driveFileId: string) {
  return driveFileId ? `https://drive.google.com/file/d/${encodeURIComponent(driveFileId)}/view` : "";
}

export function formatBytes(bytes: number | null) {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}
