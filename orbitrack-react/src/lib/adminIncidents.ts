import { supabase } from "@/lib/supabase";

export interface AdminIncidentRow {
  id: number;
  userId: number | null;
  reporter: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  appVersion: string;
  githubIssueUrl: string;
  resolutionNote: string;
  screenshotCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdateInput {
  status: string;
  resolutionNote: string;
  githubIssueUrl: string;
}

interface RawIncident {
  id: number;
  user_id?: number | null;
  title?: string | null;
  description?: string | null;
  severity?: string | null;
  status?: string | null;
  app_version?: string | null;
  github_issue_url?: string | null;
  resolution_note?: string | null;
  screenshots?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
}

export async function fetchAdminIncidents(limit = 300): Promise<AdminIncidentRow[]> {
  const [incidentsRes, usersRes] = await Promise.all([
    supabase
      .from("wt_bug_reports")
      .select("id,user_id,title,description,severity,status,app_version,github_issue_url,resolution_note,screenshots,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("wt_users").select("id,username,display_name"),
  ]);

  if (incidentsRes.error) throw incidentsRes.error;

  const users = new Map(
    ((usersRes.data ?? []) as RawUser[]).map((user) => [user.id, user.display_name || user.username || `User ${user.id}`]),
  );

  return ((incidentsRes.data ?? []) as RawIncident[]).map((incident) => {
    const screenshots = Array.isArray(incident.screenshots) ? incident.screenshots : [];
    return {
      id: incident.id,
      userId: incident.user_id ?? null,
      reporter: incident.user_id ? users.get(incident.user_id) || `User ${incident.user_id}` : "Unknown",
      title: incident.title || `Incident ${incident.id}`,
      description: incident.description || "",
      severity: incident.severity || "normal",
      status: incident.status || "open",
      appVersion: incident.app_version || "",
      githubIssueUrl: incident.github_issue_url || "",
      resolutionNote: incident.resolution_note || "",
      screenshotCount: screenshots.length,
      createdAt: incident.created_at || "",
      updatedAt: incident.updated_at || "",
    };
  });
}

export async function updateIncidentResolution(incidentId: number, input: IncidentUpdateInput) {
  const { error } = await supabase
    .from("wt_bug_reports")
    .update({
      status: input.status,
      resolution_note: input.resolutionNote,
      github_issue_url: input.githubIssueUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", incidentId);
  if (error) throw error;
}
