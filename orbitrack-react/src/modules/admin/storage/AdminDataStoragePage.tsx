import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { Database, Download, HardDrive, RefreshCcw, RotateCcw, Search, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { fetchTableInventory, fetchTableRows, type DbBrowserRow, type TableInventoryRow } from "@/lib/adminDataStorage";
import { ADMIN_TABLES } from "@/lib/adminTables";
import { executiveDb, type PendingMutationRecord } from "@/lib/localDb";
import { workspaceRepository } from "@/lib/repositories/workspaceRepository";
import { cn, timeAgo } from "@/lib/utils";

const EMPTY_INVENTORY: TableInventoryRow[] = [];
const EMPTY_ROWS: DbBrowserRow[] = [];
const EMPTY_MUTATIONS: PendingMutationRecord[] = [];

function preview(row: Record<string, unknown>) {
  const preferred = ["name", "title", "username", "display_name", "status", "action"];
  const pieces = preferred
    .filter((key) => row[key] != null && row[key] !== "")
    .map((key) => `${key}: ${String(row[key])}`);
  return pieces.length ? pieces.join(" | ") : JSON.stringify(row).slice(0, 120);
}

function exportJson(tableName: string, rows: DbBrowserRow[]) {
  const blob = new Blob([JSON.stringify(rows.map((row) => row.raw), null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${tableName}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function mutationTone(status: PendingMutationRecord["status"]): "ok" | "warn" | "danger" | "info" {
  if (status === "complete") return "ok";
  if (status === "failed") return "danger";
  if (status === "running") return "info";
  return "warn";
}

export function AdminDataStoragePage() {
  const [tableName, setTableName] = useState(ADMIN_TABLES[0]?.name ?? "wt_users");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DbBrowserRow | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const inventoryQuery = useQuery({ queryKey: ["admin", "data-storage", "inventory"], queryFn: fetchTableInventory });
  const rowsQuery = useQuery({
    queryKey: ["admin", "data-storage", tableName],
    queryFn: () => fetchTableRows(tableName),
  });
  const mutations = useLiveQuery(
    () => executiveDb.pendingMutations.orderBy("updatedAt").reverse().limit(12).toArray(),
    [],
    EMPTY_MUTATIONS,
  );

  const inventory = inventoryQuery.data ?? EMPTY_INVENTORY;
  const rows = rowsQuery.data ?? EMPTY_ROWS;
  const selectedTable = inventory.find((table) => table.name === tableName) ?? inventory[0];

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => JSON.stringify(row.raw).toLowerCase().includes(needle));
  }, [query, rows]);

  const metrics = useMemo(
    () => [
      { label: "Tracked tables", value: inventory.length || ADMIN_TABLES.length, tone: "neutral" as const },
      { label: "Readable", value: inventory.filter((table) => table.status === "ok").length, tone: "ok" as const },
      { label: "Blocked", value: inventory.filter((table) => table.status === "blocked").length, tone: "warn" as const },
      { label: "Visible rows", value: rows.length, tone: "info" as const },
    ],
    [inventory, rows.length],
  );

  const syncMetrics = useMemo(
    () => ({
      pending: mutations.filter((row) => row.status === "pending").length,
      running: mutations.filter((row) => row.status === "running").length,
      failed: mutations.filter((row) => row.status === "failed").length,
      complete: mutations.filter((row) => row.status === "complete").length,
    }),
    [mutations],
  );

  const tableColumns: DataTableColumn<TableInventoryRow>[] = [
    {
      key: "table",
      header: "Table",
      sortValue: (table) => table.label,
      render: (table) => (
        <button onClick={() => setTableName(table.name)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={table.status === "ok" ? "ok" : "warn"} />
          <span className={cn("truncate", table.name === tableName ? "text-text" : "text-text-secondary")}>{table.label}</span>
        </button>
      ),
    },
    { key: "area", header: "Area", sortValue: (table) => table.area, render: (table) => <span className="text-text-muted">{table.area}</span> },
    { key: "rows", header: "Rows", sortValue: (table) => table.count, render: (table) => <span className="text-text tabular-nums">{table.count}</span> },
  ];

  const rowColumns: DataTableColumn<DbBrowserRow>[] = [
    {
      key: "id",
      header: "Key",
      sortValue: (row) => String(row.id),
      render: (row) => (
        <button onClick={() => setSelected(row)} className="text-text tabular-nums">
          {row.id}
        </button>
      ),
    },
    { key: "preview", header: "Preview", sortValue: (row) => preview(row.raw), render: (row) => <span className="text-text-secondary truncate">{preview(row.raw)}</span> },
  ];

  const mutationColumns: DataTableColumn<PendingMutationRecord>[] = [
    {
      key: "operation",
      header: "Operation",
      sortValue: (row) => row.operation,
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot tone={mutationTone(row.status)} />
          <span className="min-w-0">
            <span className="block truncate text-text">{row.operation}</span>
            <span className="block truncate text-text-muted text-[12px]">{row.entityType} / {row.entityId}</span>
          </span>
        </div>
      ),
    },
    { key: "status", header: "Status", sortValue: (row) => row.status, render: (row) => <span className="text-text-secondary">{row.status}</span> },
    { key: "attempts", header: "Tries", sortValue: (row) => row.attempts, render: (row) => <span className="text-text-muted tabular-nums">{row.attempts}</span> },
    { key: "updated", header: "Updated", sortValue: (row) => row.updatedAt, render: (row) => <span className="text-text-muted tabular-nums">{timeAgo(row.updatedAt)}</span> },
  ];

  const retrySync = async () => {
    setSyncBusy(true);
    setSyncMessage("");
    try {
      await workspaceRepository.retryPendingMutations();
      setSyncMessage("Sync retry finished.");
    } catch (caught) {
      setSyncMessage(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSyncBusy(false);
    }
  };

  const clearCompleted = async () => {
    setSyncBusy(true);
    setSyncMessage("");
    try {
      await executiveDb.pendingMutations.where("status").equals("complete").delete();
      setSyncMessage("Completed sync records cleared.");
    } finally {
      setSyncBusy(false);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <HardDrive size={16} />
        </div>
        <div>
          <h1>Storage & Data</h1>
          <div className="text-text-muted text-[12px]">System</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void inventoryQuery.refetch()} disabled={inventoryQuery.isFetching}>
          <RefreshCcw size={13} />
          Inventory
        </Button>
        <Button variant="outline" onClick={() => exportJson(tableName, filteredRows)} disabled={!filteredRows.length}>
          <Download size={13} />
          JSON
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
            <RefreshCcw size={15} />
            <PanelTitle>Local Sync Queue</PanelTitle>
            <div className="flex items-center gap-2 text-[12px] text-text-muted">
              <span>Pending {syncMetrics.pending}</span>
              <span>Running {syncMetrics.running}</span>
              <span>Failed {syncMetrics.failed}</span>
              <span>Done {syncMetrics.complete}</span>
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => void retrySync()} disabled={syncBusy || (!syncMetrics.pending && !syncMetrics.failed)}>
              <RotateCcw size={13} />
              Retry
            </Button>
            <Button variant="outline" onClick={() => void clearCompleted()} disabled={syncBusy || !syncMetrics.complete}>
              <Trash2 size={13} />
              Clear Done
            </Button>
          </PanelHeader>
          {syncMessage && <div className="px-3 py-2 border-b border-border text-text-secondary text-[12px]">{syncMessage}</div>}
          <PanelBody className="p-0">
            <DataTable rows={mutations} columns={mutationColumns} empty="No local sync work queued" />
          </PanelBody>
        </Panel>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-3">
          <Panel>
            <PanelHeader>
              <Database size={15} />
              <PanelTitle>Table Inventory</PanelTitle>
            </PanelHeader>
            <PanelBody className="p-0">
              {inventoryQuery.isLoading ? (
                <div className="p-4 grid gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                  ))}
                </div>
              ) : (
                <DataTable rows={inventory} columns={tableColumns} empty="No tables visible" />
              )}
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader className="gap-3">
              <PanelTitle>{selectedTable?.label ?? tableName}</PanelTitle>
              <div className="flex-1" />
              <div className="relative w-72">
                <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rows" className="pl-7" />
              </div>
              <Button variant="outline" onClick={() => void rowsQuery.refetch()} disabled={rowsQuery.isFetching}>
                <RefreshCcw size={13} />
                Rows
              </Button>
            </PanelHeader>
            {selectedTable?.status === "blocked" && (
              <div className="px-3 py-2 border-b border-border text-warn text-[12px]">{selectedTable.error}</div>
            )}
            <PanelBody className="p-0">
              {rowsQuery.isLoading ? (
                <div className="p-4 grid gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                  ))}
                </div>
              ) : rowsQuery.error ? (
                <div className="p-6 text-danger">Rows failed to load.</div>
              ) : (
                <DataTable rows={filteredRows} columns={rowColumns} empty="No rows visible" />
              )}
            </PanelBody>
          </Panel>
        </div>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected ? `${tableName} / ${selected.id}` : tableName}>
        {selected && (
          <Panel>
            <PanelHeader>
              <PanelTitle>Row Data</PanelTitle>
            </PanelHeader>
            <PanelBody>
              <pre className="m-0 whitespace-pre-wrap break-words text-[12px] text-text-secondary">{JSON.stringify(selected.raw, null, 2)}</pre>
            </PanelBody>
          </Panel>
        )}
      </Inspector>
    </div>
  );
}
