import { supabase } from "@/lib/supabase";

export interface WorkloadRow {
  id: number;
  userId: number;
  name: string;
  department: string;
  assigned: number;
  active: number;
  overdue: number;
  blocked: number;
  completed: number;
  ownedProjects: number;
  averageAgeDays: number;
  status: "spare" | "steady" | "loaded" | "overloaded";
}

export interface WorkloadSummary {
  rows: WorkloadRow[];
  unassigned: number;
  overdueUnassigned: number;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
  department?: string | null;
}

interface RawTask {
  id: number;
  assignee_id?: number | null;
  status?: string | null;
  due_date?: string | null;
  created_at?: string | null;
}

interface RawProject {
  id: number;
  owner_id?: number | null;
  status?: string | null;
}

function statusFor(active: number, overdue: number, blocked: number): WorkloadRow["status"] {
  if (overdue >= 5 || blocked >= 3 || active >= 14) return "overloaded";
  if (overdue >= 2 || active >= 9) return "loaded";
  if (active <= 2) return "spare";
  return "steady";
}

export async function fetchAdminWorkload(): Promise<WorkloadSummary> {
  const [usersRes, tasksRes, projectsRes] = await Promise.all([
    supabase.from("wt_users").select("id,username,display_name,department").order("id"),
    supabase.from("wt_tasks").select("id,assignee_id,status,due_date,created_at"),
    supabase.from("wt_projects").select("id,owner_id,status"),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (tasksRes.error) throw tasksRes.error;

  const today = new Date().toISOString().slice(0, 10);
  const tasks = (tasksRes.data ?? []) as RawTask[];
  const projects = (projectsRes.data ?? []) as RawProject[];
  let unassigned = 0;
  let overdueUnassigned = 0;

  const ownedProjects = projects.reduce((acc, project) => {
    const ownerId = Number(project.owner_id);
    if (!ownerId || project.status === "archived") return acc;
    acc.set(ownerId, (acc.get(ownerId) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  const rows = ((usersRes.data ?? []) as RawUser[]).map((user) => {
    const userTasks = tasks.filter((task) => Number(task.assignee_id) === user.id);
    const active = userTasks.filter((task) => task.status !== "done").length;
    const overdue = userTasks.filter((task) => task.due_date && task.due_date < today && task.status !== "done").length;
    const blocked = userTasks.filter((task) => task.status === "blocked").length;
    const completed = userTasks.filter((task) => task.status === "done").length;
    const ages = userTasks
      .filter((task) => task.status !== "done" && task.created_at)
      .map((task) => Math.max(0, Math.floor((Date.now() - new Date(task.created_at || "").getTime()) / 86400_000)));
    const averageAgeDays = ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
    return {
      id: user.id,
      userId: user.id,
      name: user.display_name || user.username || `User ${user.id}`,
      department: user.department || "",
      assigned: userTasks.length,
      active,
      overdue,
      blocked,
      completed,
      ownedProjects: ownedProjects.get(user.id) ?? 0,
      averageAgeDays,
      status: statusFor(active, overdue, blocked),
    };
  });

  for (const task of tasks) {
    if (task.assignee_id) continue;
    unassigned += 1;
    if (task.due_date && task.due_date < today && task.status !== "done") overdueUnassigned += 1;
  }

  return { rows, unassigned, overdueUnassigned };
}
