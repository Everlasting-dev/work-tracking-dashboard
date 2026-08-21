import { type QueryClient, type QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { workspaceRepository } from "@/lib/repositories/workspaceRepository";

export interface RealtimeTablePayload {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE" | string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

export const LIVE_TABLES = [
  "wt_tasks",
  "wt_bug_reports",
  "wt_project_access_requests",
] as const;

type LiveTable = (typeof LIVE_TABLES)[number];

const WORKSPACE_TABLES = new Set<LiveTable>([
  "wt_tasks",
]);

const TABLE_INVALIDATIONS: Record<LiveTable, QueryKey[]> = {
  wt_tasks: [
    queryKeys.adminOverview,
    queryKeys.adminProjectsGovernance,
    queryKeys.adminWorkload,
    queryKeys.adminDataStorage,
  ],
  wt_bug_reports: [
    queryKeys.adminOverview,
    queryKeys.adminIncidents,
    queryKeys.adminDataStorage,
  ],
  wt_project_access_requests: [
    queryKeys.adminOverview,
    queryKeys.adminApprovals,
    queryKeys.adminProjectsGovernance,
    queryKeys.adminDataStorage,
  ],
};

function isLiveTable(table: string): table is LiveTable {
  return LIVE_TABLES.includes(table as LiveTable);
}

export class RealtimeCoordinator {
  private workspaceRefreshTimer: ReturnType<typeof window.setTimeout> | null = null;
  private readonly queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  handle(payload: RealtimeTablePayload) {
    if (!isLiveTable(payload.table)) return;

    if (WORKSPACE_TABLES.has(payload.table)) {
      this.scheduleWorkspaceRefresh();
    }

    for (const queryKey of TABLE_INVALIDATIONS[payload.table]) {
      void this.queryClient.invalidateQueries({ queryKey, refetchType: "active" });
    }
  }

  dispose() {
    if (this.workspaceRefreshTimer) {
      window.clearTimeout(this.workspaceRefreshTimer);
      this.workspaceRefreshTimer = null;
    }
  }

  private scheduleWorkspaceRefresh() {
    if (this.workspaceRefreshTimer) window.clearTimeout(this.workspaceRefreshTimer);
    this.workspaceRefreshTimer = window.setTimeout(() => {
      this.workspaceRefreshTimer = null;
      void workspaceRepository.refreshProjects().catch(() => {
        void this.queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll, refetchType: "active" });
      });
    }, 450);
  }
}
