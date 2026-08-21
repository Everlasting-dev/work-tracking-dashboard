import { supabase, avatarSrc } from "@/lib/supabase";
import { normalizeRole, type ExecutiveRole } from "@/lib/permissions";

export interface AdminUserRow {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: ExecutiveRole;
  rawRole: string;
  department: string;
  createdAt: string;
  lastSeenAt: string;
  mustChangePassword: boolean;
  hoursLoggedTotal: number;
  avatarUrl: string;
  ownedProjects: number;
  activeProjects: number;
  sessionCount: number;
}

interface RawUser {
  id: number;
  username?: string | null;
  display_name?: string | null;
  email?: string | null;
  role?: string | null;
  department?: string | null;
  created_at?: string | null;
  last_seen_at?: string | null;
  must_change_password?: boolean | null;
  hours_logged_total?: number | null;
  avatar_drive_id?: string | null;
}

interface RawProject {
  id: number;
  owner_id?: number | null;
  status?: string | null;
}

interface RawSession {
  id: number;
  user_id?: number | null;
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const [usersRes, projectsRes, sessionsRes] = await Promise.all([
    supabase
      .from("wt_users")
      .select("id,username,display_name,email,role,department,created_at,last_seen_at,must_change_password,hours_logged_total,avatar_drive_id")
      .order("id"),
    supabase.from("wt_projects").select("id,owner_id,status"),
    supabase.from("wt_sessions").select("id,user_id"),
  ]);

  if (usersRes.error) throw usersRes.error;

  const projects = ((projectsRes.data ?? []) as RawProject[]).reduce(
    (acc, project) => {
      const ownerId = Number(project.owner_id);
      if (!ownerId) return acc;
      const current = acc.get(ownerId) ?? { total: 0, active: 0 };
      current.total += 1;
      if (project.status === "active") current.active += 1;
      acc.set(ownerId, current);
      return acc;
    },
    new Map<number, { total: number; active: number }>(),
  );

  const sessions = ((sessionsRes.data ?? []) as RawSession[]).reduce((acc, session) => {
    const userId = Number(session.user_id);
    if (!userId) return acc;
    acc.set(userId, (acc.get(userId) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  return ((usersRes.data ?? []) as RawUser[]).map((user) => {
    const owned = projects.get(user.id) ?? { total: 0, active: 0 };
    const rawRole = user.role || "member";
    return {
      id: user.id,
      username: user.username || `user-${user.id}`,
      displayName: user.display_name || user.username || `User ${user.id}`,
      email: user.email || "",
      role: normalizeRole(rawRole),
      rawRole,
      department: user.department || "",
      createdAt: user.created_at || "",
      lastSeenAt: user.last_seen_at || "",
      mustChangePassword: Boolean(user.must_change_password),
      hoursLoggedTotal: Number(user.hours_logged_total || 0),
      avatarUrl: avatarSrc({ avatar_drive_id: user.avatar_drive_id || null }),
      ownedProjects: owned.total,
      activeProjects: owned.active,
      sessionCount: sessions.get(user.id) ?? 0,
    };
  });
}

export async function updateAdminUserRole(userId: number, role: "admin" | "user") {
  const { error } = await supabase.from("wt_users").update({ role }).eq("id", userId);
  if (error) throw error;
}

export async function setAdminUserPasswordReset(userId: number, mustChangePassword: boolean) {
  const { error } = await supabase.from("wt_users").update({ must_change_password: mustChangePassword }).eq("id", userId);
  if (error) throw error;
}

export async function revokeAdminUserSessions(userId: number) {
  const { error } = await supabase.from("wt_sessions").delete().eq("user_id", userId);
  if (error) throw error;
}
