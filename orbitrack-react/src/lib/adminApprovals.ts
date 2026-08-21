import { supabase } from "@/lib/supabase";

export interface ApprovalRow {
  id: number;
  projectId: number | null;
  projectName: string;
  requesterId: number | null;
  requesterName: string;
  status: string;
  message: string;
  decidedBy: number | null;
  decidedByName: string;
  decidedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalDecision = "approved" | "denied";

interface RawRequest {
  id: number;
  project_id?: number | null;
  requester_id?: number | null;
  message?: string | null;
  status?: string | null;
  decided_by?: number | null;
  decided_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface NamedRow {
  id: number;
  name?: string | null;
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

export async function fetchAdminApprovals(): Promise<ApprovalRow[]> {
  const [requestsRes, usersRes, projectsRes] = await Promise.all([
    supabase
      .from("wt_project_access_requests")
      .select("id,project_id,requester_id,message,status,decided_by,decided_at,created_at,updated_at")
      .order("created_at", { ascending: false }),
    supabase.from("wt_users").select("id,username,display_name"),
    supabase.from("wt_projects").select("id,name"),
  ]);

  if (requestsRes.error) throw requestsRes.error;

  const users = new Map(
    ((usersRes.data ?? []) as NamedRow[]).map((user) => [user.id, user.display_name || user.username || `User ${user.id}`]),
  );
  const projects = new Map(((projectsRes.data ?? []) as NamedRow[]).map((project) => [project.id, project.name || `Project ${project.id}`]));

  return ((requestsRes.data ?? []) as RawRequest[]).map((request) => ({
    id: request.id,
    projectId: request.project_id ?? null,
    projectName: request.project_id ? projects.get(request.project_id) || `Project ${request.project_id}` : "-",
    requesterId: request.requester_id ?? null,
    requesterName: request.requester_id ? users.get(request.requester_id) || `User ${request.requester_id}` : "Unknown",
    status: request.status || "pending",
    message: request.message || "",
    decidedBy: request.decided_by ?? null,
    decidedByName: request.decided_by ? users.get(request.decided_by) || `User ${request.decided_by}` : "-",
    decidedAt: request.decided_at || "",
    createdAt: request.created_at || "",
    updatedAt: request.updated_at || "",
  }));
}

export async function decideProjectAccess(approval: ApprovalRow, decision: ApprovalDecision, actorId: number) {
  const now = new Date().toISOString();
  const { error: requestError } = await supabase
    .from("wt_project_access_requests")
    .update({
      status: decision,
      decided_by: actorId,
      decided_at: now,
      updated_at: now,
    })
    .eq("id", approval.id);
  if (requestError) throw requestError;

  if (decision !== "approved" || !approval.projectId || !approval.requesterId) return;

  const { data: project, error: projectError } = await supabase
    .from("wt_projects")
    .select("editor_ids")
    .eq("id", approval.projectId)
    .maybeSingle();
  if (projectError) throw projectError;

  const editorIds = new Set(parseIds(project?.editor_ids));
  editorIds.add(approval.requesterId);
  const { error: updateError } = await supabase
    .from("wt_projects")
    .update({ editor_ids: [...editorIds], updated_at: now })
    .eq("id", approval.projectId);
  if (updateError) throw updateError;
}
