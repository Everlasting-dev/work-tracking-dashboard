import { normalizeRole, permissionsForRole, type ExecutiveRole } from "@/lib/permissions";
import { type ExecutiveSession } from "@/lib/sessionTypes";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from "@/lib/supabase";

const SESSION_KEY = "executive-black-session";

interface UserProfileRow {
  id: number;
  username: string;
  display_name?: string | null;
  email?: string | null;
  role?: string | null;
  department?: string | null;
  auth_user_id?: string | null;
  must_change_password?: boolean | null;
}

interface PasswordLoginResponse {
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
  warning?: string;
  mustChangePassword?: boolean;
}

export interface LoginResult {
  session: ExecutiveSession;
  mustChangePassword: boolean;
  authWarning: string;
}

function toSession(user: UserProfileRow, authUserId: string): ExecutiveSession {
  const role = normalizeRole(user.role);
  return {
    id: user.id,
    authUserId,
    username: user.username,
    displayName: user.display_name || user.username,
    email: user.email || "",
    role,
    department: user.department || "",
    permissions: permissionsForRole(role),
    source: "supabase",
  };
}

export function readStoredSession(): ExecutiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExecutiveSession;
    const role: ExecutiveRole = normalizeRole(parsed.role);
    return { ...parsed, role, permissions: permissionsForRole(role) };
  } catch {
    return null;
  }
}

export function writeStoredSession(session: ExecutiveSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function loadProfileForAuthUser(authUserId: string): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from("wt_users")
    .select("id,username,display_name,email,role,department,auth_user_id,must_change_password")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Your account is not linked to an Orbitrack user.");
  return data as UserProfileRow;
}

export async function sessionFromCurrentSupabase(): Promise<ExecutiveSession | null> {
  const { data: authData } = await supabase.auth.getSession();
  const authSession = authData.session;
  if (!authSession?.user?.id) return null;
  const row = await loadProfileForAuthUser(authSession.user.id);
  return toSession(row, authSession.user.id);
}

async function passwordLogin(login: string, password: string): Promise<PasswordLoginResponse> {
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/auth-password-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ login, password }),
  });
  const body = (await response.json().catch(() => ({}))) as PasswordLoginResponse & { error?: string };
  if (!response.ok) {
    throw new Error(body.error || "Username or password is incorrect.");
  }
  return body;
}

async function directEmailLogin(login: string, password: string): Promise<PasswordLoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: login, password });
  if (error || !data.session) throw new Error(error?.message || "Username or password is incorrect.");
  return {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  };
}

async function establishSupabaseSession(login: string, password: string) {
  const normalized = login.trim().toLowerCase();
  try {
    return await passwordLogin(normalized, password);
  } catch (error) {
    if (normalized.includes("@")) return directEmailLogin(normalized, password);
    throw error;
  }
}

async function recordSession(userId: number) {
  const deviceId = localStorage.getItem("executive-device-id") || crypto.randomUUID();
  localStorage.setItem("executive-device-id", deviceId);
  const now = new Date().toISOString();
  await supabase.from("wt_sessions").upsert(
    {
      user_id: userId,
      device_id: deviceId,
      device_label: "Orbitrack Executive",
      user_agent: navigator.userAgent,
      last_seen_at: now,
    },
    { onConflict: "user_id,device_id" },
  );
}

export async function loginWithPassword(usernameOrEmail: string, password: string): Promise<LoginResult> {
  const login = usernameOrEmail.trim();
  if (!login || !password) throw new Error("Enter your username and password.");

  const result = await establishSupabaseSession(login, password);
  const accessToken = result.session?.access_token;
  const refreshToken = result.session?.refresh_token;
  if (!accessToken || !refreshToken) throw new Error("Secure login did not return a session.");

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error || !data.session?.user?.id) throw new Error(error?.message || "Could not establish your session.");

  const row = await loadProfileForAuthUser(data.session.user.id);
  const session = toSession(row, data.session.user.id);
  writeStoredSession(session);
  await recordSession(row.id).catch(() => {});
  try {
    await supabase.from("wt_activity_log").insert({
      user_id: row.id,
      action: "logged_in",
      entity_type: "session",
      details: "Orbitrack Executive login",
    });
  } catch {
    // Login should not fail because activity logging is temporarily unavailable.
  }

  return {
    session,
    mustChangePassword: Boolean(result.mustChangePassword || row.must_change_password),
    authWarning: result.warning || "",
  };
}

export async function logout() {
  clearStoredSession();
  await supabase.auth.signOut().catch(() => {});
}
