import { supabase } from "@/lib/supabase";

export interface AdminProjectRow {
  id: number;
  name: string;
  status: string;
  ownerId: number | null;
  ownerName: string;
  department: string;
  classroomId: number | null;
  editorCount: number;
  hiddenCount: number;
  taskCount: number;
  doneCount: number;
  overdueCount: number;
  blockedCount: number;
  progress: number;
  risk: "clear" | "stale" | "ownerless" | "overdue" | "blocked";
  createdAt: string;
  updatedAt: string;
}

interface RawProject {
  id: number;
  name?: string | null;
  status?: string | null;
  owner_id?: number | null;
  classroom_id?: number | null;
  department?: string | null;
  editor_ids?: number[] | string | null;
  hidden_from_ids?: number[] | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RawTask {
  id: number;
  project_id?: number | null;
  status?: string | null;
  due_date?: string | null;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
}

function parseIds(value: number[] | string | null | undefined): number[] {
  if (Array.isArray(value)) return value.map(Number).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function riskFor(project: RawProject, stats: { overdue: number; blocked: number }) {
  if (!project.owner_id) return "ownerless";
  if (stats.blocked > 0) return "blocked";
  if (stats.overdue > 0) return "overdue";
  const updated = project.updated_at ? new Date(project.updated_at).getTime() : 0;
  if (updated && Date.now() - updated > 30 * 86400_000) return "stale";
  return "clear";
}

export async function fetchAdminProjects(): Promise<AdminProjectRow[]> {
  const [projectsRes, tasksRes, usersRes] = await Promise.all([
    supabase
      .from("wt_projects")
      .select("id,name,status,owner_id,classroom_id,department,editor_ids,hidden_from_ids,created_at,updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("wt_tasks").select("id,project_id,status,due_date"),
    supabase.from("wt_users").select("id,username,display_name"),
  ]);

  if (projectsRes.error) throw projectsRes.error;

  const today = new Date().toISOString().slice(0, 10);
  const users = new Map(
    ((usersRes.data ?? []) as RawUser[]).map((user) => [user.id, user.display_name || user.username || `User ${user.id}`]),
  );
  const taskStats = ((tasksRes.data ?? []) as RawTask[]).reduce((acc, task) => {
    const projectId = Number(task.project_id);
    if (!projectId) return acc;
    const current = acc.get(projectId) ?? { total: 0, done: 0, overdue: 0, blocked: 0 };
    current.total += 1;
    if (task.status === "done") current.done += 1;
    if (task.status === "blocked") current.blocked += 1;
    if (task.due_date && task.due_date < today && task.status !== "done") current.overdue += 1;
    acc.set(projectId, current);
    return acc;
  }, new Map<number, { total: number; done: number; overdue: number; blocked: number }>());

  return ((projectsRes.data ?? []) as RawProject[]).map((project) => {
    const stats = taskStats.get(project.id) ?? { total: 0, done: 0, overdue: 0, blocked: 0 };
    const editorCount = parseIds(project.editor_ids).length;
    const hiddenCount = parseIds(project.hidden_from_ids).length;
    return {
      id: project.id,
      name: project.name || `Project ${project.id}`,
      status: project.status || "active",
      ownerId: project.owner_id ?? null,
      ownerName: project.owner_id ? users.get(project.owner_id) || `User ${project.owner_id}` : "Unassigned",
      department: project.department || "",
      classroomId: project.classroom_id ?? null,
      editorCount,
      hiddenCount,
      taskCount: stats.total,
      doneCount: stats.done,
      overdueCount: stats.overdue,
      blockedCount: stats.blocked,
      progress: stats.total ? Math.round((stats.done / stats.total) * 100) : 0,
      risk: riskFor(project, stats),
      createdAt: project.created_at || "",
      updatedAt: project.updated_at || "",
    };
  });
}
