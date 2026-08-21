import { type ExecutiveRole, type Permission } from "@/lib/permissions";

export interface ExecutiveSession {
  id: number | null;
  authUserId: string | null;
  username: string;
  displayName: string;
  email: string;
  role: ExecutiveRole;
  department: string;
  permissions: Permission[];
  source: "supabase" | "legacy" | "local-owner";
}

export interface LoginResponse {
  ok: boolean;
  error: string;
  warning: string;
  mustChangePassword: boolean;
}

export interface SessionContextValue {
  session: ExecutiveSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}
