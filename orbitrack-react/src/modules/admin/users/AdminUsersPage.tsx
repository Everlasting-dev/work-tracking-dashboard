import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, KeyRound, LogOut, RefreshCcw, Search, Shield, UserCheck, Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { useAdminAction } from "@/lib/adminActions";
import {
  fetchAdminUsers,
  revokeAdminUserSessions,
  setAdminUserPasswordReset,
  updateAdminUserRole,
  type AdminUserRow,
} from "@/lib/adminUsers";
import { queryKeys } from "@/lib/queryKeys";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { timeAgo } from "@/lib/utils";

const ROLE_FILTERS = ["all", "admin", "member", "auditor"] as const;

function roleLabel(role: string) {
  if (role === "user" || role === "member") return "member";
  return role.replaceAll("_", " ");
}

function roleTone(role: string): "info" | "ok" | "neutral" | "warn" {
  if (role.includes("admin")) return "info";
  if (role === "auditor") return "warn";
  if (role === "member" || role === "user") return "neutral";
  return "ok";
}

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
  });
  const { session } = useExecutiveSession();
  const { runningAction, notice, error: actionError, clearMessages, runAdminAction } = useAdminAction();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((user) => {
      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && user.rawRole.includes("admin")) ||
        user.role === roleFilter ||
        user.rawRole === roleFilter;
      const haystack = `${user.displayName} ${user.username} ${user.email} ${user.department}`.toLowerCase();
      return matchesRole && (!needle || haystack.includes(needle));
    });
  }, [data, query, roleFilter]);

  const metrics = useMemo(
    () => [
      { label: "Total users", value: data.length, tone: "neutral" as const },
      { label: "Admins", value: data.filter((user) => user.rawRole.includes("admin")).length, tone: "info" as const },
      { label: "Forced resets", value: data.filter((user) => user.mustChangePassword).length, tone: "warn" as const },
      { label: "Active projects", value: data.reduce((sum, user) => sum + user.activeProjects, 0), tone: "ok" as const },
    ],
    [data],
  );

  const toggleChecked = (id: number) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const invalidate = [["admin", "users"], queryKeys.adminOverview] as const;

  const exportUsers = (rows: AdminUserRow[]) => {
    const header = ["id", "username", "displayName", "email", "role", "department", "ownedProjects", "sessionCount", "lastSeenAt"];
    const body = rows.map((user) =>
      [user.id, user.username, user.displayName, user.email, user.rawRole, user.department, user.ownedProjects, user.sessionCount, user.lastSeenAt]
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `executive-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setUserRole = async (user: AdminUserRow, role: "admin" | "user") => {
    if (user.id === session?.id && role === "user") return;
    await runAdminAction({
      permission: "users:manage",
      action: "updated",
      entityType: "user",
      entityId: user.id,
      details: { username: user.username, role },
      successMessage: `${user.displayName} role updated.`,
      invalidate: [...invalidate],
      mutation: () => updateAdminUserRole(user.id, role),
    });
    setSelected((current) => (current?.id === user.id ? { ...current, rawRole: role } : current));
  };

  const setPasswordReset = async (user: AdminUserRow, mustChangePassword: boolean) => {
    await runAdminAction({
      permission: "users:manage",
      action: mustChangePassword ? "password_reset_required" : "password_reset_cleared",
      entityType: "user",
      entityId: user.id,
      details: { username: user.username, mustChangePassword },
      successMessage: mustChangePassword ? "Password reset required." : "Password reset flag cleared.",
      invalidate: [...invalidate],
      mutation: () => setAdminUserPasswordReset(user.id, mustChangePassword),
    });
    setSelected((current) => (current?.id === user.id ? { ...current, mustChangePassword } : current));
  };

  const revokeSessions = async (user: AdminUserRow) => {
    if (user.id === session?.id) return;
    await runAdminAction({
      permission: "users:manage",
      action: "sessions_revoked",
      entityType: "user",
      entityId: user.id,
      details: { username: user.username },
      confirmMessage: `Revoke all sessions for ${user.displayName}?`,
      successMessage: "Sessions revoked.",
      invalidate: [...invalidate],
      mutation: () => revokeAdminUserSessions(user.id),
    });
    setSelected((current) => (current?.id === user.id ? { ...current, sessionCount: 0 } : current));
  };

  const bulkRole = async (role: "admin" | "user") => {
    const users = data.filter((user) => checkedIds.has(user.id) && !(user.id === session?.id && role === "user"));
    if (!users.length) return;
    await runAdminAction({
      permission: "users:manage",
      action: "bulk_role_updated",
      entityType: "user",
      details: { count: users.length, role },
      confirmMessage: `Update ${users.length} selected user${users.length === 1 ? "" : "s"} to ${role === "admin" ? "admin" : "member"}?`,
      successMessage: "Selected users updated.",
      invalidate: [...invalidate],
      mutation: async () => {
        await Promise.all(users.map((user) => updateAdminUserRole(user.id, role)));
      },
    });
    setCheckedIds(new Set());
  };

  const bulkReset = async () => {
    const users = data.filter((user) => checkedIds.has(user.id));
    if (!users.length) return;
    await runAdminAction({
      permission: "users:manage",
      action: "bulk_password_reset_required",
      entityType: "user",
      details: { count: users.length },
      confirmMessage: `Require password reset for ${users.length} selected user${users.length === 1 ? "" : "s"}?`,
      successMessage: "Password reset required for selected users.",
      invalidate: [...invalidate],
      mutation: async () => {
        await Promise.all(users.map((user) => setAdminUserPasswordReset(user.id, true)));
      },
    });
    setCheckedIds(new Set());
  };

  const bulkRevokeSessions = async () => {
    const users = data.filter((user) => checkedIds.has(user.id) && user.id !== session?.id);
    if (!users.length) return;
    await runAdminAction({
      permission: "users:manage",
      action: "bulk_sessions_revoked",
      entityType: "user",
      details: { count: users.length },
      confirmMessage: `Revoke sessions for ${users.length} selected user${users.length === 1 ? "" : "s"}?`,
      successMessage: "Selected sessions revoked.",
      invalidate: [...invalidate],
      mutation: async () => {
        await Promise.all(users.map((user) => revokeAdminUserSessions(user.id)));
      },
    });
    setCheckedIds(new Set());
  };

  const columns: DataTableColumn<AdminUserRow>[] = [
    {
      key: "select",
      header: "",
      className: "w-8",
      sortable: false,
      render: (user) => (
        <input
          type="checkbox"
          checked={checkedIds.has(user.id)}
          onChange={() => toggleChecked(user.id)}
          className="h-3.5 w-3.5 accent-white"
          aria-label={`Select ${user.displayName}`}
        />
      ),
    },
    {
      key: "user",
      header: "User",
      sortValue: (user) => user.displayName,
      render: (user) => (
        <button onClick={() => setSelected(user)} className="flex items-center gap-2 min-w-0 text-left">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-[var(--radius-sm)] object-cover border border-border" />
          ) : (
            <span className="h-6 w-6 rounded-[var(--radius-sm)] border border-border bg-raised grid place-items-center text-[11px] text-text-secondary">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-text">{user.displayName}</span>
            <span className="block truncate text-text-muted text-[12px]">@{user.username}</span>
          </span>
        </button>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortValue: (user) => user.rawRole,
      render: (user) => (
        <div className="flex items-center gap-2 text-text-secondary">
          <StatusDot tone={roleTone(user.rawRole)} />
          <span>{roleLabel(user.rawRole)}</span>
        </div>
      ),
    },
    { key: "department", header: "Department", sortValue: (user) => user.department, render: (user) => <span className="text-text-secondary">{user.department || "-"}</span> },
    { key: "projects", header: "Projects", sortValue: (user) => user.ownedProjects, render: (user) => <span className="tabular-nums text-text">{user.ownedProjects}</span> },
    { key: "sessions", header: "Sessions", sortValue: (user) => user.sessionCount, render: (user) => <span className="tabular-nums text-text-secondary">{user.sessionCount}</span> },
    { key: "lastSeen", header: "Last seen", sortValue: (user) => user.lastSeenAt, render: (user) => <span className="tabular-nums text-text-muted">{timeAgo(user.lastSeenAt) || "-"}</span> },
    {
      key: "flags",
      header: "Flags",
      sortValue: (user) => user.mustChangePassword,
      render: (user) => (
        <div className="flex items-center gap-2 text-text-muted">
          {user.mustChangePassword ? <StatusDot tone="warn" /> : <StatusDot tone="neutral" />}
          <span>{user.mustChangePassword ? "reset" : "clear"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full overflow-auto">
      <ActionMessage notice={notice} error={actionError} onClear={clearMessages} />
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <Users size={16} />
        </div>
        <div>
          <h1>Users</h1>
          <div className="text-text-muted text-[12px]">Operational</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => exportUsers(filtered)} disabled={!filtered.length}>
          <Download size={13} />
          Export
        </Button>
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} />
          Refresh
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>

        <Panel>
          <PanelHeader className="gap-3">
            <PanelTitle>User Directory</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-64">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="pl-7" />
            </div>
            <div className="flex items-center gap-1">
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`h-8 px-2 rounded-[var(--radius-sm)] text-[12px] ${roleFilter === role ? "bg-hover text-text" : "text-text-secondary hover:text-text"}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </PanelHeader>

          {checkedIds.size > 0 && (
            <div className="h-10 px-3 border-b border-border bg-raised flex items-center gap-2 text-text-secondary">
              <span className="tabular-nums">{checkedIds.size}</span>
              <span>selected</span>
              <div className="flex-1" />
              <Button variant="ghost" onClick={() => void bulkRole("admin")} disabled={Boolean(runningAction)}>
                <Shield size={13} />
                Admin
              </Button>
              <Button variant="ghost" onClick={() => void bulkRole("user")} disabled={Boolean(runningAction)}>
                <UserCheck size={13} />
                Member
              </Button>
              <Button variant="ghost" onClick={() => void bulkReset()} disabled={Boolean(runningAction)}>
                <KeyRound size={13} />
                Reset
              </Button>
              <Button variant="ghost" onClick={() => void bulkRevokeSessions()} disabled={Boolean(runningAction)}>
                <LogOut size={13} />
                Sessions
              </Button>
              <Button variant="ghost" onClick={() => setCheckedIds(new Set())}>
                Clear
              </Button>
            </div>
          )}

          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Users failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No users visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.displayName ?? "User"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-3">
                  {selected.avatarUrl ? (
                    <img src={selected.avatarUrl} alt="" className="h-12 w-12 rounded-[var(--radius-sm)] object-cover border border-border" />
                  ) : (
                    <div className="h-12 w-12 rounded-[var(--radius-sm)] border border-border bg-raised grid place-items-center text-text-secondary">
                      {selected.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{selected.displayName}</div>
                    <div className="text-text-muted truncate">{selected.email || `@${selected.username}`}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Role</div>
                    <div className="text-text">{roleLabel(selected.rawRole)}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Department</div>
                    <div className="text-text">{selected.department || "-"}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Owned projects</div>
                    <div className="text-text tabular-nums">{selected.ownedProjects}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Sessions</div>
                    <div className="text-text tabular-nums">{selected.sessionCount}</div>
                  </div>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Actions</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={Boolean(runningAction)} onClick={() => void setPasswordReset(selected, !selected.mustChangePassword)}>
                  <KeyRound size={13} />
                  {selected.mustChangePassword ? "Clear Reset" : "Require Reset"}
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.id === session?.id} onClick={() => void revokeSessions(selected)}>
                  <LogOut size={13} />
                  Revoke
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.rawRole === "admin"} onClick={() => void setUserRole(selected, "admin")}>
                  <Shield size={13} />
                  Admin
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.rawRole !== "admin" || selected.id === session?.id} onClick={() => void setUserRole(selected, "user")}>
                  <UserCheck size={13} />
                  Member
                </Button>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
