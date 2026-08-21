import { supabase } from "@/lib/supabase";

export interface AdminAuditRow {
  id: number;
  actorId: number | null;
  actorName: string;
  projectId: number | null;
  projectName: string;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string;
  createdAt: string;
  severity: "info" | "warn" | "danger";
}

interface RawActivity {
  id: number;
  user_id?: number | null;
  project_id?: number | null;
  action?: string | null;
  entity_type?: string | null;
  entity_id?: number | null;
  details?: string | null;
  created_at?: string | null;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
}

interface RawProject {
  id: number;
  name?: string | null;
}

function severityFor(action: string, entityType: string): AdminAuditRow["severity"] {
  const text = `${action} ${entityType}`.toLowerCase();
  if (text.includes("delete") || text.includes("reset") || text.includes("password")) return "danger";
  if (text.includes("update") || text.includes("edit") || text.includes("archive") || text.includes("role")) return "warn";
  return "info";
}

export async function fetchAdminAudit(limit = 500): Promise<AdminAuditRow[]> {
  const [activityRes, usersRes, projectsRes] = await Promise.all([
    supabase
      .from("wt_activity_log")
      .select("id,user_id,project_id,action,entity_type,entity_id,details,created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("wt_users").select("id,username,display_name"),
    supabase.from("wt_projects").select("id,name"),
  ]);

  if (activityRes.error) throw activityRes.error;

  const users = new Map(
    ((usersRes.data ?? []) as RawUser[]).map((user) => [user.id, user.display_name || user.username || `User ${user.id}`]),
  );
  const projects = new Map(((projectsRes.data ?? []) as RawProject[]).map((project) => [project.id, project.name || `Project ${project.id}`]));

  return ((activityRes.data ?? []) as RawActivity[]).map((row) => {
    const action = row.action || "event";
    const entityType = row.entity_type || "";
    return {
      id: row.id,
      actorId: row.user_id ?? null,
      actorName: row.user_id ? users.get(row.user_id) || `User ${row.user_id}` : "System",
      projectId: row.project_id ?? null,
      projectName: row.project_id ? projects.get(row.project_id) || `Project ${row.project_id}` : "-",
      action,
      entityType,
      entityId: row.entity_id ?? null,
      details: row.details || "",
      createdAt: row.created_at || "",
      severity: severityFor(action, entityType),
    };
  });
}
