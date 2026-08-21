import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Gauge, RefreshCcw, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { fetchAdminWorkload, type WorkloadRow } from "@/lib/adminWorkload";

function statusTone(status: WorkloadRow["status"]): "ok" | "warn" | "danger" | "info" {
  if (status === "overloaded") return "danger";
  if (status === "loaded") return "warn";
  if (status === "spare") return "info";
  return "ok";
}

const EMPTY_ROWS: WorkloadRow[] = [];

export function AdminWorkloadPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WorkloadRow | null>(null);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "workload"],
    queryFn: fetchAdminWorkload,
  });

  const rows = data?.rows ?? EMPTY_ROWS;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => !needle || `${row.name} ${row.department} ${row.status}`.toLowerCase().includes(needle));
  }, [query, rows]);
  const unassignedTone: "warn" | "neutral" = data?.unassigned ? "warn" : "neutral";

  const metrics = useMemo(
    () => [
      { label: "Active work", value: rows.reduce((sum, row) => sum + row.active, 0), tone: "neutral" as const },
      { label: "Overloaded", value: rows.filter((row) => row.status === "overloaded").length, tone: "danger" as const },
      { label: "Spare capacity", value: rows.filter((row) => row.status === "spare").length, tone: "info" as const },
      { label: "Unassigned", value: data?.unassigned ?? 0, tone: unassignedTone },
    ],
    [data?.unassigned, rows, unassignedTone],
  );

  const columns: DataTableColumn<WorkloadRow>[] = [
    {
      key: "user",
      header: "User",
      sortValue: (row) => row.name,
      render: (row) => (
        <button onClick={() => setSelected(row)} className="flex items-center gap-2 text-left min-w-0">
          <StatusDot tone={statusTone(row.status)} />
          <span className="min-w-0">
            <span className="block truncate text-text">{row.name}</span>
            <span className="block truncate text-text-muted text-[12px]">{row.status}</span>
          </span>
        </button>
      ),
    },
    { key: "department", header: "Department", sortValue: (row) => row.department, render: (row) => <span className="text-text-secondary">{row.department || "-"}</span> },
    { key: "active", header: "Active", sortValue: (row) => row.active, render: (row) => <span className="text-text tabular-nums">{row.active}</span> },
    { key: "overdue", header: "Overdue", sortValue: (row) => row.overdue, render: (row) => <span className={row.overdue ? "text-danger tabular-nums" : "text-text-muted tabular-nums"}>{row.overdue}</span> },
    { key: "blocked", header: "Blocked", sortValue: (row) => row.blocked, render: (row) => <span className={row.blocked ? "text-warn tabular-nums" : "text-text-muted tabular-nums"}>{row.blocked}</span> },
    { key: "age", header: "Avg age", sortValue: (row) => row.averageAgeDays, render: (row) => <span className="text-text-muted tabular-nums">{row.averageAgeDays}d</span> },
    { key: "projects", header: "Projects", sortValue: (row) => row.ownedProjects, render: (row) => <span className="text-text-secondary tabular-nums">{row.ownedProjects}</span> },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <Gauge size={16} />
        </div>
        <div>
          <h1>Workload</h1>
          <div className="text-text-muted text-[12px]">Operational</div>
        </div>
        <div className="flex-1" />
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
            <PanelTitle>Capacity</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workload" className="pl-7" />
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
              <div className="p-6 text-danger">Workload failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No workload rows visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Workload"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone={statusTone(selected.status)} />
                  <span className="font-semibold">{selected.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Active</div>
                    <div className="text-text tabular-nums">{selected.active}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Overdue</div>
                    <div className="text-text tabular-nums">{selected.overdue}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Blocked</div>
                    <div className="text-text tabular-nums">{selected.blocked}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Completed</div>
                    <div className="text-text tabular-nums">{selected.completed}</div>
                  </div>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Related Views</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link to="/admin/users">
                    <Users size={13} />
                    Users
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/workspace/projects">
                    <FolderKanban size={13} />
                    Projects
                  </Link>
                </Button>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
