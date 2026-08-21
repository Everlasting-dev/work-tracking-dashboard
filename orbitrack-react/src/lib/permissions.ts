export const PERMISSIONS = [
  "admin:read",
  "admin:write",
  "users:manage",
  "roles:manage",
  "projects:govern",
  "workload:manage",
  "approvals:manage",
  "audit:read",
  "incidents:manage",
  "health:read",
  "storage:manage",
  "integrations:manage",
  "security:manage",
  "flags:manage",
  "data:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type ExecutiveRole =
  | "super_admin"
  | "operations_admin"
  | "team_admin"
  | "security_admin"
  | "storage_admin"
  | "auditor"
  | "member";

const ROLE_PERMISSIONS: Record<ExecutiveRole, Permission[]> = {
  super_admin: [...PERMISSIONS],
  operations_admin: ["admin:read", "users:manage", "projects:govern", "workload:manage", "approvals:manage", "audit:read"],
  team_admin: ["admin:read", "users:manage", "projects:govern", "workload:manage"],
  security_admin: ["admin:read", "audit:read", "incidents:manage", "health:read", "security:manage"],
  storage_admin: ["admin:read", "storage:manage", "data:manage", "integrations:manage"],
  auditor: ["admin:read", "audit:read", "health:read"],
  member: [],
};

export function normalizeRole(role?: string | null): ExecutiveRole {
  if (role === "admin") return "super_admin";
  if (role && role in ROLE_PERMISSIONS) return role as ExecutiveRole;
  return "member";
}

export function permissionsForRole(role: ExecutiveRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function can(permission: Permission, permissions: Permission[]) {
  return permissions.includes(permission);
}
