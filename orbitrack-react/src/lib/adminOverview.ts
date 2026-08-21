import { supabase } from "@/lib/supabase";
import { ADMIN_TABLES } from "@/lib/adminTables";

export interface OverviewMetric {
  key: string;
  label: string;
  value: number | string;
  tone: "neutral" | "ok" | "warn" | "danger" | "info";
}

export interface ActivityEntry {
  id: number | string;
  action: string;
  entityType: string;
  entityId: number | null;
  projectId: number | null;
  userId: number | null;
  details: string;
  createdAt: string;
}

export interface IncidentEntry {
  id: number | string;
  title: string;
  severity: string;
  status: string;
  userId: number | null;
  createdAt: string;
}

export interface HealthCheck {
  key: string;
  label: string;
  status: "ok" | "warn" | "danger" | "unknown";
  detail: string;
}

export interface AdminOverviewData {
  metrics: OverviewMetric[];
  activity: ActivityEntry[];
  incidents: IncidentEntry[];
  health: HealthCheck[];
  warnings: string[];
}

interface CountResult {
  value: number;
  ok: boolean;
  warning?: string;
}

async function countRows(table: string, apply?: (query: any) => any): Promise<CountResult> {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (apply) query = apply(query);
    const { count, error } = await query;
    if (error) throw error;
    return { value: count ?? 0, ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { value: 0, ok: false, warning: `${table}: ${message}` };
  }
}

async function fetchActivity(): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("wt_activity_log")
    .select("id,action,entity_type,entity_id,project_id,user_id,details,created_at")
    .order("created_at", { ascending: false })
    .limit(14);
  if (error) return [];
  return (data ?? []).map((row: any) => ({
    id: row.id,
    action: row.action ?? "event",
    entityType: row.entity_type ?? "",
    entityId: row.entity_id ?? null,
    projectId: row.project_id ?? null,
    userId: row.user_id ?? null,
    details: row.details ?? "",
    createdAt: row.created_at ?? "",
  }));
}

async function fetchIncidents(): Promise<IncidentEntry[]> {
  const { data, error } = await supabase
    .from("wt_bug_reports")
    .select("id,title,severity,status,user_id,created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) return [];
  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title || "Untitled incident",
    severity: row.severity || "normal",
    status: row.status || "open",
    userId: row.user_id ?? null,
    createdAt: row.created_at ?? "",
  }));
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const dueDate = now.toISOString().slice(0, 10);

  const [
    users,
    activeUsers,
    projects,
    projectsToday,
    completedTasks,
    overdueTasks,
    blockedTasks,
    openIncidents,
    files,
    sessions,
    activity,
    incidents,
  ] = await Promise.all([
    countRows("wt_users"),
    countRows("wt_users", (query) => query.gte("last_seen_at", new Date(now.getTime() - 7 * 86400_000).toISOString())),
    countRows("wt_projects"),
    countRows("wt_projects", (query) => query.gte("created_at", today)),
    countRows("wt_tasks", (query) => query.eq("status", "done")),
    countRows("wt_tasks", (query) => query.lt("due_date", dueDate).neq("status", "done")),
    countRows("wt_tasks", (query) => query.eq("status", "blocked")),
    countRows("wt_bug_reports", (query) => query.not("status", "in", "(fixed,closed,wont_fix)")),
    countRows("wt_project_files"),
    countRows("wt_sessions"),
    fetchActivity(),
    fetchIncidents(),
  ]);

  const counts = [users, activeUsers, projects, projectsToday, completedTasks, overdueTasks, blockedTasks, openIncidents, files, sessions];
  const warnings = counts.flatMap((result) => (result.warning ? [result.warning] : []));
  const databaseOk = [users, projects, completedTasks].every((result) => result.ok);

  return {
    metrics: [
      { key: "active-users", label: "Active users", value: activeUsers.value, tone: activeUsers.ok ? "ok" : "warn" },
      { key: "total-users", label: "Total users", value: users.value, tone: "neutral" },
      { key: "projects-today", label: "Projects today", value: projectsToday.value, tone: "info" },
      { key: "completed-tasks", label: "Completed tasks", value: completedTasks.value, tone: "ok" },
      { key: "overdue-tasks", label: "Overdue tasks", value: overdueTasks.value, tone: overdueTasks.value ? "danger" : "neutral" },
      { key: "blocked-work", label: "Blocked work", value: blockedTasks.value, tone: blockedTasks.value ? "warn" : "neutral" },
      { key: "open-incidents", label: "Open incidents", value: openIncidents.value, tone: openIncidents.value ? "danger" : "ok" },
      { key: "files-indexed", label: "Files indexed", value: files.value, tone: files.ok ? "neutral" : "warn" },
      { key: "sessions", label: "Known sessions", value: sessions.value, tone: sessions.ok ? "info" : "warn" },
      { key: "tables", label: "Tables tracked", value: ADMIN_TABLES.length, tone: "neutral" },
    ],
    activity,
    incidents,
    warnings,
    health: [
      {
        key: "database",
        label: "Database",
        status: databaseOk ? "ok" : "danger",
        detail: databaseOk ? "Core tables responding" : "One or more core tables failed",
      },
      {
        key: "auth",
        label: "Authentication",
        status: sessions.ok ? "ok" : "warn",
        detail: sessions.ok ? `${sessions.value} session records visible` : "Session table unavailable",
      },
      {
        key: "storage",
        label: "Drive storage",
        status: files.ok ? "ok" : "unknown",
        detail: files.ok ? `${files.value} indexed file records` : "File index unavailable",
      },
      {
        key: "incidents",
        label: "Incident intake",
        status: openIncidents.value ? "warn" : "ok",
        detail: openIncidents.value ? `${openIncidents.value} unresolved reports` : "No unresolved reports visible",
      },
    ],
  };
}
