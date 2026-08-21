import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileClock, RefreshCcw, Search } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { fetchAdminAudit, type AdminAuditRow } from "@/lib/adminAudit";
import { timeAgo } from "@/lib/utils";

const FILTERS = ["all", "danger", "warn", "info"] as const;

function csvEscape(value: string | number | null) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv(rows: AdminAuditRow[]) {
  const header = ["id", "actor", "action", "entity_type", "entity_id", "project", "severity", "created_at", "details"];
  const body = rows.map((row) =>
    [
      row.id,
      row.actorName,
      row.action,
      row.entityType,
      row.entityId,
      row.projectName,
      row.severity,
      row.createdAt,
      row.details,
    ]
      .map(csvEscape)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orbitrack-audit-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toneFor(severity: AdminAuditRow["severity"]) {
  if (severity === "danger") return "danger";
  if (severity === "warn") return "warn";
  return "info";
}

export function AdminAuditPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [selected, setSelected] = useState<AdminAuditRow | null>(null);
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => fetchAdminAudit(500),
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSeverity = filter === "all" || row.severity === filter;
      const haystack = `${row.actorName} ${row.action} ${row.entityType} ${row.projectName} ${row.details}`.toLowerCase();
      return matchesSeverity && (!needle || haystack.includes(needle));
    });
  }, [data, filter, query]);

  const metrics = useMemo(
    () => [
      { label: "Events", value: data.length, tone: "neutral" as const },
      { label: "Critical", value: data.filter((row) => row.severity === "danger").length, tone: "danger" as const },
      { label: "Changes", value: data.filter((row) => row.severity === "warn").length, tone: "warn" as const },
      { label: "Actors", value: new Set(data.map((row) => row.actorId).filter(Boolean)).size, tone: "info" as const },
    ],
    [data],
  );

  const columns: DataTableColumn<AdminAuditRow>[] = [
    {
      key: "action",
      header: "Action",
      sortValue: (row) => row.action,
      render: (row) => (
        <button onClick={() => setSelected(row)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={toneFor(row.severity)} />
          <span className="truncate text-text">{row.action}</span>
        </button>
      ),
    },
    { key: "actor", header: "Actor", sortValue: (row) => row.actorName, render: (row) => <span className="text-text-secondary truncate">{row.actorName}</span> },
    { key: "entity", header: "Entity", sortValue: (row) => row.entityType, render: (row) => <span className="text-text-secondary">{row.entityType || "-"}</span> },
    { key: "project", header: "Project", sortValue: (row) => row.projectName, render: (row) => <span className="text-text-muted truncate">{row.projectName}</span> },
    { key: "severity", header: "Severity", sortValue: (row) => row.severity, render: (row) => <span className="text-text-muted">{row.severity}</span> },
    { key: "time", header: "Time", sortValue: (row) => row.createdAt, render: (row) => <span className="text-text-muted tabular-nums">{timeAgo(row.createdAt)}</span> },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <FileClock size={16} />
        </div>
        <div>
          <h1>Audit Log</h1>
          <div className="text-text-muted text-[12px]">Governance</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
          <Download size={13} />
          CSV
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
            <PanelTitle>Events</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audit log" className="pl-7" />
            </div>
            <div className="flex items-center gap-1">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`h-8 px-2 rounded-[var(--radius-sm)] text-[12px] ${filter === item ? "bg-hover text-text" : "text-text-secondary hover:text-text"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </PanelHeader>
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Audit log failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No audit events visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.action ?? "Audit Event"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone={toneFor(selected.severity)} />
                  <span className="font-semibold">{selected.action}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Actor</div>
                    <div className="text-text truncate">{selected.actorName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Project</div>
                    <div className="text-text truncate">{selected.projectName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Entity</div>
                    <div className="text-text">{selected.entityType || "-"}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Entity ID</div>
                    <div className="text-text tabular-nums">{selected.entityId ?? "-"}</div>
                  </div>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Details</PanelTitle>
              </PanelHeader>
              <PanelBody>
                <pre className="m-0 whitespace-pre-wrap break-words text-[12px] text-text-secondary">{selected.details || "-"}</pre>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
