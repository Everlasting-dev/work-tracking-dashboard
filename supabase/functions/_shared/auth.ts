// Supabase Auth validation + reuse of the existing Orbitrack membership/role
// model. The Edge Functions use the service-role client to read wt_* and
// re-enforce the same rules as app.js (canEdit / isAdmin / classroom membership).

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthedUser {
  authUid: string;   // auth.users uuid
  userId: number;    // wt_users.id (bigint app id) — the canonical identity
  role: string;      // 'admin' | 'user'
}

export interface ProjectRow {
  id: number;
  owner_id: number;
  editor_ids: number[];
  classroom_id: number | null;
  hidden_from_ids: number[];
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

// Validate the caller's Supabase Auth JWT and map it to the bigint wt_users id.
// Returns null when there is no valid token or no linked app user.
export async function getAuthedUser(req: Request): Promise<AuthedUser | null> {
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return null;
  // Ask Supabase Auth to validate the token and tell us who it is.
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } }, auth: { persistSession: false } },
  );
  const { data: { user }, error } = await anon.auth.getUser();
  if (error || !user) return null;

  const svc = serviceClient();
  const { data: row } = await svc.from("wt_users").select("id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!row) return null;
  return { authUid: user.id, userId: Number(row.id), role: row.role || "user" };
}

export async function loadProject(svc: SupabaseClient, projectId: number): Promise<ProjectRow | null> {
  const { data } = await svc.from("wt_projects")
    .select("id, owner_id, editor_ids, classroom_id, hidden_from_ids")
    .eq("id", projectId).maybeSingle();
  if (!data) return null;
  return {
    id: Number(data.id),
    owner_id: Number(data.owner_id),
    editor_ids: Array.isArray(data.editor_ids) ? data.editor_ids.map(Number) : [],
    classroom_id: data.classroom_id != null ? Number(data.classroom_id) : null,
    hidden_from_ids: Array.isArray(data.hidden_from_ids) ? data.hidden_from_ids.map(Number) : [],
  };
}

// Mirrors the project-visibility rule in app.js.
export async function isMember(svc: SupabaseClient, user: AuthedUser, p: ProjectRow | null): Promise<boolean> {
  if (!p) return false;
  if (user.role === "admin") return true;
  if (p.owner_id === user.userId) return true;
  if (p.editor_ids.includes(user.userId)) return true;
  if (p.classroom_id != null && !p.hidden_from_ids.includes(user.userId)) {
    const { data } = await svc.from("wt_user_classrooms")
      .select("user_id").eq("user_id", user.userId).eq("classroom_id", p.classroom_id).maybeSingle();
    if (data) return true;
  }
  return false;
}

// Mirrors canEdit() in app.js — who may upload.
export function canEdit(user: AuthedUser, p: ProjectRow | null): boolean {
  if (!p) return false;
  if (user.role === "admin") return true;
  if (p.owner_id === user.userId) return true;
  return p.editor_ids.includes(user.userId);
}
