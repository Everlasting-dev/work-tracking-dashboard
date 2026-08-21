import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Database, FileText, Paperclip, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { fetchAdminOverview, type ActivityEntry, type IncidentEntry } from "@/lib/adminOverview";
import { queryKeys } from "@/lib/queryKeys";
import { timeAgo } from "@/lib/utils";

const activityColumns: DataTableColumn<ActivityEntry>[] = [
  {
    key: "action",
    header: "Action",
    sortValue: (row) => row.action,
    render: (row) => (
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot tone="info" />
        <span className="truncate text-text">{row.action}</span>
      </div>
    ),
  },
  { key: "entity", header: "Entity", sortValue: (row) => row.entityType, render: (row) => <span className="text-text-secondary">{row.entityType || "-"}</span> },
  { key: "actor", header: "Actor", sortValue: (row) => row.userId ?? -1, render: (row) => <span className="text-text-muted tabular-nums">{row.userId ?? "-"}</span> },
  { key: "time", header: "Time", sortValue: (row) => row.createdAt, render: (row) => <span className="text-text-muted tabular-nums">{timeAgo(row.createdAt)}</span> },
];

const incidentColumns: DataTableColumn<IncidentEntry>[] = [
  {
    key: "title",
    header: "Incident",
    sortValue: (row) => row.title,
    render: (row) => (
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot tone={row.status === "open" ? "danger" : "warn"} />
        <span className="truncate text-text">{row.title}</span>
      </div>
    ),
  },
  { key: "severity", header: "Severity", sortValue: (row) => row.severity, render: (row) => <span className="text-text-secondary">{row.severity}</span> },
  { key: "status", header: "Status", sortValue: (row) => row.status, render: (row) => <span className="text-text-muted">{row.status}</span> },
];

export function AdminOverviewPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: fetchAdminOverview,
  });

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <ShieldCheck size={16} />
        </div>
        <div>
          <h1>Admin Overview</h1>
          <div className="text-text-muted text-[12px]">Mission Control</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="p-4 grid grid-cols-2 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-[72px] border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : error || !data ? (
        <div className="p-4">
          <Panel>
            <PanelBody>
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={15} />
                <span>Admin overview failed to load.</span>
              </div>
            </PanelBody>
          </Panel>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {data.metrics.map((metric) => (
              <MetricTile key={metric.key} label={metric.label} value={metric.value} tone={metric.tone} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-3">
            <Panel>
              <PanelHeader>
                <Activity size={15} />
                <PanelTitle>Live Activity</PanelTitle>
              </PanelHeader>
              <PanelBody className="p-0">
                <DataTable rows={data.activity} columns={activityColumns} empty="No activity visible" />
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <Database size={15} />
                <PanelTitle>System Health</PanelTitle>
              </PanelHeader>
              <PanelBody className="space-y-3">
                {data.health.map((check) => (
                  <div key={check.key} className="flex items-start gap-2">
                    <StatusDot tone={check.status === "unknown" ? "unknown" : check.status} className="mt-1.5" />
                    <div className="min-w-0">
                      <div className="text-text">{check.label}</div>
                      <div className="text-text-muted text-[12px] truncate">{check.detail}</div>
                    </div>
                  </div>
                ))}
              </PanelBody>
            </Panel>
          </div>

          <Panel>
            <PanelHeader>
              <PanelTitle>Common Admin Places</PanelTitle>
            </PanelHeader>
            <PanelBody className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Link to="/admin/files" className="h-10 border border-border bg-raised px-3 flex items-center gap-2 hover:bg-hover transition-colors">
                <Paperclip size={14} />
                <span className="text-text">Files & Attachments</span>
              </Link>
              <Link to="/admin/users" className="h-10 border border-border bg-raised px-3 flex items-center gap-2 hover:bg-hover transition-colors">
                <Users size={14} />
                <span className="text-text">Users</span>
              </Link>
              <Link to="/admin/storage" className="h-10 border border-border bg-raised px-3 flex items-center gap-2 hover:bg-hover transition-colors">
                <FileText size={14} />
                <span className="text-text">Raw Data Browser</span>
              </Link>
            </PanelBody>
          </Panel>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-3">
            <Panel>
              <PanelHeader>
                <AlertTriangle size={15} />
                <PanelTitle>Incident Center</PanelTitle>
              </PanelHeader>
              <PanelBody className="p-0">
                <DataTable rows={data.incidents} columns={incidentColumns} empty="No incidents visible" />
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Data Warnings</PanelTitle>
              </PanelHeader>
              <PanelBody className="space-y-2">
                {data.warnings.length ? (
                  data.warnings.slice(0, 8).map((warning) => (
                    <div key={warning} className="flex gap-2 text-text-muted text-[12px]">
                      <StatusDot tone="warn" className="mt-1.5" />
                      <span className="break-words">{warning}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-text-muted">No data warnings visible</div>
                )}
              </PanelBody>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
