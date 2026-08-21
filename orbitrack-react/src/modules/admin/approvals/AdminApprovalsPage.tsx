import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ClipboardCheck, RefreshCcw, Search, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { decideProjectAccess, fetchAdminApprovals, type ApprovalDecision, type ApprovalRow } from "@/lib/adminApprovals";
import { useAdminAction } from "@/lib/adminActions";
import { timeAgo } from "@/lib/utils";

const STATUS_FILTERS = ["all", "pending", "approved", "denied"] as const;

function statusTone(status: string): "ok" | "warn" | "danger" | "neutral" {
  if (status === "approved") return "ok";
  if (status === "pending") return "warn";
  if (status === "denied" || status === "rejected") return "danger";
  return "neutral";
}

export function AdminApprovalsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [selected, setSelected] = useState<ApprovalRow | null>(null);
  const { runningAction, notice, error: actionError, clearMessages, runAdminAction } = useAdminAction();
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "approvals"],
    queryFn: fetchAdminApprovals,
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((approval) => {
      const matchesStatus = status === "all" || approval.status === status;
      const haystack = `${approval.projectName} ${approval.requesterName} ${approval.status} ${approval.message}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [data, query, status]);

  const metrics = useMemo(
    () => [
      { label: "Requests", value: data.length, tone: "neutral" as const },
      { label: "Pending", value: data.filter((approval) => approval.status === "pending").length, tone: "warn" as const },
      { label: "Approved", value: data.filter((approval) => approval.status === "approved").length, tone: "ok" as const },
      { label: "Denied", value: data.filter((approval) => approval.status === "denied" || approval.status === "rejected").length, tone: "danger" as const },
    ],
    [data],
  );

  const columns: DataTableColumn<ApprovalRow>[] = [
    {
      key: "project",
      header: "Project",
      sortValue: (approval) => approval.projectName,
      render: (approval) => (
        <button onClick={() => setSelected(approval)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={statusTone(approval.status)} />
          <span className="truncate text-text">{approval.projectName}</span>
        </button>
      ),
    },
    { key: "requester", header: "Requester", sortValue: (approval) => approval.requesterName, render: (approval) => <span className="text-text-secondary truncate">{approval.requesterName}</span> },
    { key: "status", header: "Status", sortValue: (approval) => approval.status, render: (approval) => <span className="text-text-secondary">{approval.status}</span> },
    { key: "decider", header: "Decider", sortValue: (approval) => approval.decidedByName, render: (approval) => <span className="text-text-muted truncate">{approval.decidedByName}</span> },
    { key: "created", header: "Created", sortValue: (approval) => approval.createdAt, render: (approval) => <span className="text-text-muted tabular-nums">{timeAgo(approval.createdAt)}</span> },
  ];

  const decide = async (approval: ApprovalRow, decision: ApprovalDecision) => {
    const result = await runAdminAction({
      permission: "approvals:manage",
      action: decision === "approved" ? "approved_project_access" : "denied_project_access",
      entityType: "project_access_request",
      entityId: approval.id,
      projectId: approval.projectId,
      details: {
        requesterId: approval.requesterId,
        requesterName: approval.requesterName,
        projectName: approval.projectName,
        decision,
      },
      confirmMessage: `${decision === "approved" ? "Approve" : "Deny"} access for ${approval.requesterName}?`,
      successMessage: `Access ${decision}.`,
      invalidate: [["admin", "approvals"], ["admin", "projects", "governance"], ["admin", "overview"], ["admin", "audit"]],
      mutation: (actorId) => decideProjectAccess(approval, decision, actorId),
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
          <ClipboardCheck size={16} />
        </div>
        <div>
          <h1>Approvals</h1>
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
            <PanelTitle>Requests</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search approvals" className="pl-7" />
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
              <div className="p-6 text-danger">Approvals failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No approvals visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.projectName ?? "Approval"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone={statusTone(selected.status)} />
                  <span className="font-semibold">{selected.projectName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Requester</div>
                    <div className="text-text truncate">{selected.requesterName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Status</div>
                    <div className="text-text">{selected.status}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Decider</div>
                    <div className="text-text truncate">{selected.decidedByName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Decided</div>
                    <div className="text-text tabular-nums">{timeAgo(selected.decidedAt) || "-"}</div>
                  </div>
                </div>
                <div className="text-text-secondary text-[12px] whitespace-pre-wrap">{selected.message || "-"}</div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Decision</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  disabled={Boolean(runningAction) || selected.status !== "pending"}
                  onClick={() => void decide(selected, "approved")}
                >
                  <Check size={13} />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  disabled={Boolean(runningAction) || selected.status !== "pending"}
                  onClick={() => void decide(selected, "denied")}
                >
                  <X size={13} />
                  Deny
                </Button>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
