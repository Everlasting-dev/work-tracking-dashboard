import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bug, ExternalLink, RefreshCcw, Search, ShieldCheck } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { fetchAdminIncidents, updateIncidentResolution, type AdminIncidentRow, type IncidentUpdateInput } from "@/lib/adminIncidents";
import { useAdminAction } from "@/lib/adminActions";
import { openExternalUrl } from "@/lib/desktopBridge";
import { timeAgo } from "@/lib/utils";

const STATUS_FILTERS = ["all", "open", "in_progress", "fixed", "closed"] as const;
const INCIDENT_STATUSES = ["open", "in_progress", "sent", "fixed", "closed", "wont_fix"] as const;

function severityTone(severity: string): "danger" | "warn" | "info" | "neutral" {
  const text = severity.toLowerCase();
  if (text.includes("critical") || text.includes("high")) return "danger";
  if (text.includes("normal") || text.includes("medium")) return "warn";
  if (text.includes("low")) return "info";
  return "neutral";
}

export function AdminIncidentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [selected, setSelected] = useState<AdminIncidentRow | null>(null);
  const [draft, setDraft] = useState<IncidentUpdateInput>({ status: "open", resolutionNote: "", githubIssueUrl: "" });
  const { runningAction, notice, error: actionError, clearMessages, runAdminAction } = useAdminAction();
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "incidents"],
    queryFn: () => fetchAdminIncidents(300),
  });

  useEffect(() => {
    if (!selected) return;
    setDraft({
      status: selected.status,
      resolutionNote: selected.resolutionNote,
      githubIssueUrl: selected.githubIssueUrl,
    });
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((incident) => {
      const matchesStatus = status === "all" || incident.status === status;
      const haystack = `${incident.title} ${incident.description} ${incident.reporter} ${incident.severity} ${incident.status}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [data, query, status]);

  const metrics = useMemo(
    () => [
      { label: "Reports", value: data.length, tone: "neutral" as const },
      { label: "Open", value: data.filter((incident) => incident.status === "open").length, tone: "danger" as const },
      { label: "In progress", value: data.filter((incident) => incident.status === "in_progress").length, tone: "warn" as const },
      { label: "With issue", value: data.filter((incident) => incident.githubIssueUrl).length, tone: "info" as const },
    ],
    [data],
  );

  const columns: DataTableColumn<AdminIncidentRow>[] = [
    {
      key: "title",
      header: "Incident",
      sortValue: (incident) => incident.title,
      render: (incident) => (
        <button onClick={() => setSelected(incident)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={severityTone(incident.severity)} />
          <span className="min-w-0">
            <span className="block truncate text-text">{incident.title}</span>
            <span className="block truncate text-text-muted text-[12px]">{incident.description || "-"}</span>
          </span>
        </button>
      ),
    },
    { key: "reporter", header: "Reporter", sortValue: (incident) => incident.reporter, render: (incident) => <span className="text-text-secondary truncate">{incident.reporter}</span> },
    { key: "severity", header: "Severity", sortValue: (incident) => incident.severity, render: (incident) => <span className="text-text-secondary">{incident.severity}</span> },
    { key: "status", header: "Status", sortValue: (incident) => incident.status, render: (incident) => <span className="text-text-muted">{incident.status}</span> },
    { key: "screens", header: "Shots", sortValue: (incident) => incident.screenshotCount, render: (incident) => <span className="text-text-muted tabular-nums">{incident.screenshotCount}</span> },
    { key: "created", header: "Created", sortValue: (incident) => incident.createdAt, render: (incident) => <span className="text-text-muted tabular-nums">{timeAgo(incident.createdAt)}</span> },
  ];

  const saveIncident = async (incident: AdminIncidentRow) => {
    const result = await runAdminAction({
      permission: "incidents:manage",
      action: "updated_incident_resolution",
      entityType: "bug_report",
      entityId: incident.id,
      details: {
        title: incident.title,
        previousStatus: incident.status,
        nextStatus: draft.status,
        hasResolutionNote: Boolean(draft.resolutionNote.trim()),
        hasGithubIssueUrl: Boolean(draft.githubIssueUrl.trim()),
      },
      confirmMessage: `Update incident "${incident.title}"?`,
      successMessage: "Incident updated.",
      invalidate: [["admin", "incidents"], ["admin", "overview"], ["admin", "audit"]],
      mutation: () => updateIncidentResolution(incident.id, draft),
    });
    if (result !== null) {
      setSelected(null);
      await refetch();
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <Bug size={16} />
        </div>
        <div>
          <h1>Incident Center</h1>
          <div className="text-text-muted text-[12px]">System</div>
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
            <PanelTitle>Reports</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incidents" className="pl-7" />
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
          <ActionMessage notice={notice} error={actionError} onClear={clearMessages} />
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Incidents failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No incidents visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.title ?? "Incident"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone={severityTone(selected.severity)} />
                  <span className="font-semibold">{selected.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Reporter</div>
                    <div className="text-text truncate">{selected.reporter}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Status</div>
                    <div className="text-text">{selected.status}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Severity</div>
                    <div className="text-text">{selected.severity}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Version</div>
                    <div className="text-text">{selected.appVersion || "-"}</div>
                  </div>
                </div>
                <div className="text-text-secondary text-[12px] whitespace-pre-wrap">{selected.description || "-"}</div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Resolution</PanelTitle>
              </PanelHeader>
              <PanelBody className="space-y-2">
                <label className="block space-y-1">
                  <span className="text-text-muted text-[12px]">Status</span>
                  <select
                    value={draft.status}
                    onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                    className="h-8 w-full rounded-[var(--radius-sm)] border border-border bg-raised px-2 text-text outline-none focus:border-border-strong"
                  >
                    {INCIDENT_STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-text-muted text-[12px]">GitHub issue URL</span>
                  <input
                    value={draft.githubIssueUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, githubIssueUrl: event.target.value }))}
                    className="h-8 w-full rounded-[var(--radius-sm)] border border-border bg-raised px-2 text-text outline-none focus:border-border-strong"
                    placeholder="https://github.com/..."
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-text-muted text-[12px]">Resolution note</span>
                  <textarea
                    value={draft.resolutionNote}
                    onChange={(event) => setDraft((current) => ({ ...current, resolutionNote: event.target.value }))}
                    className="min-h-24 w-full resize-y rounded-[var(--radius-sm)] border border-border bg-raised p-2 text-text outline-none focus:border-border-strong"
                    placeholder="What happened, who owns it, and what changed"
                  />
                </label>
                {selected.githubIssueUrl && (
                  <button
                    type="button"
                    onClick={() => void openExternalUrl(selected.githubIssueUrl)}
                    className="inline-flex items-center gap-1.5 text-info"
                  >
                    <ExternalLink size={13} />
                    Issue
                  </button>
                )}
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button variant="default" disabled={Boolean(runningAction)} onClick={() => void saveIncident(selected)}>
                    <ShieldCheck size={13} />
                    Save
                  </Button>
                </div>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
