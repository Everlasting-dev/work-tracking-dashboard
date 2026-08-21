import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive, CheckCircle2, PauseCircle, PlayCircle, RefreshCcw, Search, ShieldAlert } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { useAdminAction } from "@/lib/adminActions";
import { fetchAdminProjects, type AdminProjectRow } from "@/lib/adminProjects";
import { queryKeys } from "@/lib/queryKeys";
import { cn, timeAgo } from "@/lib/utils";
import { updateWorkspaceProjectStatus } from "@/lib/workspaceProjects";

const STATUS_FILTERS = ["all", "active", "completed", "archived"] as const;

function riskTone(risk: AdminProjectRow["risk"]): "ok" | "warn" | "danger" | "neutral" {
  if (risk === "clear") return "ok";
  if (risk === "stale") return "warn";
  if (risk === "ownerless" || risk === "overdue" || risk === "blocked") return "danger";
  return "neutral";
}

export function AdminProjectsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [selected, setSelected] = useState<AdminProjectRow | null>(null);
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "projects", "governance"],
    queryFn: fetchAdminProjects,
  });
  const { runningAction, notice, error: actionError, clearMessages, runAdminAction } = useAdminAction();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((project) => {
      const matchesStatus = status === "all" || project.status === status;
      const haystack = `${project.name} ${project.ownerName} ${project.department} ${project.risk}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [data, query, status]);

  const metrics = useMemo(
    () => [
      { label: "Projects", value: data.length, tone: "neutral" as const },
      { label: "Ownerless", value: data.filter((project) => project.risk === "ownerless").length, tone: "danger" as const },
      { label: "Overdue", value: data.filter((project) => project.overdueCount > 0).length, tone: "warn" as const },
      { label: "Blocked", value: data.filter((project) => project.blockedCount > 0).length, tone: "danger" as const },
      { label: "Archived", value: data.filter((project) => project.status === "archived").length, tone: "neutral" as const },
    ],
    [data],
  );

  const columns: DataTableColumn<AdminProjectRow>[] = [
    {
      key: "project",
      header: "Project",
      sortValue: (project) => project.name,
      render: (project) => (
        <button onClick={() => setSelected(project)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={riskTone(project.risk)} />
          <span className="min-w-0">
            <span className="block truncate text-text">{project.name}</span>
            <span className="block truncate text-text-muted text-[12px]">{project.risk}</span>
          </span>
        </button>
      ),
    },
    { key: "owner", header: "Owner", sortValue: (project) => project.ownerName, render: (project) => <span className="text-text-secondary truncate">{project.ownerName}</span> },
    { key: "status", header: "Status", sortValue: (project) => project.status, render: (project) => <span className="text-text-secondary">{project.status}</span> },
    {
      key: "progress",
      header: "Progress",
      sortValue: (project) => project.progress,
      render: (project) => (
        <div className="flex items-center gap-2 w-32">
          <div className="h-1 flex-1 bg-hover overflow-hidden">
            <div className="h-full bg-text-secondary" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="w-8 text-right text-text-muted tabular-nums">{project.progress}%</span>
        </div>
      ),
    },
    { key: "tasks", header: "Tasks", sortValue: (project) => project.taskCount, render: (project) => <span className="text-text tabular-nums">{project.doneCount}/{project.taskCount}</span> },
    { key: "overdue", header: "Overdue", sortValue: (project) => project.overdueCount, render: (project) => <span className={cn("tabular-nums", project.overdueCount ? "text-danger" : "text-text-muted")}>{project.overdueCount}</span> },
    { key: "visibility", header: "Hidden", sortValue: (project) => project.hiddenCount, render: (project) => <span className="text-text-muted tabular-nums">{project.hiddenCount}</span> },
    { key: "updated", header: "Updated", sortValue: (project) => project.updatedAt, render: (project) => <span className="text-text-muted tabular-nums">{timeAgo(project.updatedAt)}</span> },
  ];

  const setProjectStatus = async (project: AdminProjectRow, nextStatus: string) => {
    await runAdminAction({
      permission: "projects:govern",
      action: "updated",
      entityType: "project",
      entityId: project.id,
      projectId: project.id,
      details: { name: project.name, status: nextStatus },
      successMessage: `Project set to ${nextStatus}.`,
      invalidate: [["admin", "projects", "governance"], queryKeys.adminOverview, queryKeys.projectsAll],
      mutation: () => updateWorkspaceProjectStatus(project.id, nextStatus, null),
    });
  };

  return (
    <div className="h-full overflow-auto">
      <ActionMessage notice={notice} error={actionError} onClear={clearMessages} />
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <ShieldAlert size={16} />
        </div>
        <div>
          <h1>Projects</h1>
          <div className="text-text-muted text-[12px]">Governance</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} />
          Refresh
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {metrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>

        <Panel>
          <PanelHeader className="gap-3">
            <PanelTitle>Project Registry</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-64">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="pl-7" />
            </div>
            <div className="flex items-center gap-1">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setStatus(item)}
                  className={`h-8 px-2 rounded-[var(--radius-sm)] text-[12px] ${status === item ? "bg-hover text-text" : "text-text-secondary hover:text-text"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </PanelHeader>
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Projects failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No projects visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Project"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-start gap-2">
                  <StatusDot tone={riskTone(selected.risk)} className="mt-1.5" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{selected.name}</div>
                    <div className="text-text-muted">{selected.risk}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Owner</div>
                    <div className="text-text truncate">{selected.ownerName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Status</div>
                    <div className="text-text">{selected.status}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Editors</div>
                    <div className="text-text tabular-nums">{selected.editorCount}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Hidden from</div>
                    <div className="text-text tabular-nums">{selected.hiddenCount}</div>
                  </div>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Governance Actions</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={Boolean(runningAction) || selected.status === "active"} onClick={() => void setProjectStatus(selected, "active")}>
                  <PlayCircle size={13} />
                  Active
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.status === "on-hold"} onClick={() => void setProjectStatus(selected, "on-hold")}>
                  <PauseCircle size={13} />
                  Hold
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.status === "completed"} onClick={() => void setProjectStatus(selected, "completed")}>
                  <CheckCircle2 size={13} />
                  Complete
                </Button>
                <Button variant="outline" disabled={Boolean(runningAction) || selected.status === "archived"} onClick={() => void setProjectStatus(selected, "archived")}>
                  <Archive size={13} />
                  Archive
                </Button>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
