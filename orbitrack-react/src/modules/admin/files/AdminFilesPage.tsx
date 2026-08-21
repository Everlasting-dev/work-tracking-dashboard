import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, FolderKanban, HardDrive, Paperclip, RefreshCcw, Search } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data-table/DataTable";
import { Inspector } from "@/components/inspector/Inspector";
import { ActionMessage } from "@/components/ui/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import {
  downloadDriveFile,
  driveWebUrl,
  fetchAttachments,
  formatBytes,
  loadDriveFile,
  type AttachmentRow,
  type AttachmentSource,
  type LoadedAttachment,
} from "@/lib/adminFiles";
import { openExternalUrl } from "@/lib/desktopBridge";
import { timeAgo } from "@/lib/utils";

const SOURCE_FILTERS: Array<"all" | AttachmentSource> = ["all", "drive", "legacy"];
const EMPTY_ROWS: AttachmentRow[] = [];

function sourceTone(source: AttachmentSource): "info" | "neutral" {
  return source === "drive" ? "info" : "neutral";
}

function kindFromMime(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "sheet";
  if (mime.includes("word") || mime.includes("document")) return "doc";
  return "file";
}

export function AdminFilesPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | AttachmentSource>("all");
  const [selected, setSelected] = useState<AttachmentRow | null>(null);
  const [preview, setPreview] = useState<LoadedAttachment | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "files"],
    queryFn: fetchAttachments,
  });

  const rows = data?.rows ?? EMPTY_ROWS;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSource = source === "all" || row.source === source;
      const haystack = `${row.name} ${row.projectName} ${row.taskTitle} ${row.uploadedByName} ${row.mimeType} ${row.category}`.toLowerCase();
      return matchesSource && (!needle || haystack.includes(needle));
    });
  }, [query, rows, source]);

  const metrics = useMemo(
    () => [
      { label: "All files", value: rows.length, tone: "neutral" as const },
      { label: "Drive files", value: rows.filter((row) => row.source === "drive").length, tone: "info" as const },
      { label: "Legacy files", value: rows.filter((row) => row.source === "legacy").length, tone: "neutral" as const },
      { label: "Deleted/hidden", value: rows.filter((row) => row.deletedAt).length, tone: "warn" as const },
      { label: "Projects", value: new Set(rows.map((row) => row.projectId).filter(Boolean)).size, tone: "ok" as const },
    ],
    [rows],
  );

  useEffect(() => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, [selected?.id]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const openSelected = async (row: AttachmentRow) => {
    setNotice("");
    setActionError("");
    try {
      if (row.source !== "drive") {
        setActionError("Legacy attachments expose metadata here. Open them from the original project file panel until legacy preview is ported.");
        return;
      }
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
      const loaded = await loadDriveFile(row.id);
      setPreview({ ...loaded, name: row.name || loaded.name, mimeType: row.mimeType || loaded.mimeType });
      setNotice("Preview loaded.");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const downloadSelected = async (row: AttachmentRow) => {
    setNotice("");
    setActionError("");
    try {
      if (row.source !== "drive") {
        setActionError("Legacy attachments expose metadata here. Open them from the original project file panel until legacy preview is ported.");
        return;
      }
      await downloadDriveFile(row.id, row.name);
      setNotice("Download started.");
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const openDriveLink = async (driveFileId: string) => {
    setNotice("");
    setActionError("");
    const opened = await openExternalUrl(driveWebUrl(driveFileId));
    if (!opened) setActionError("Could not open the Google Drive link.");
  };

  const columns: DataTableColumn<AttachmentRow>[] = [
    {
      key: "name",
      header: "File",
      sortValue: (row) => row.name,
      render: (row) => (
        <button onClick={() => setSelected(row)} className="flex items-center gap-2 min-w-0 text-left">
          <StatusDot tone={sourceTone(row.source)} />
          <span className="min-w-0">
            <span className="block truncate text-text">{row.name}</span>
            <span className="block truncate text-text-muted text-[12px]">{kindFromMime(row.mimeType)} · {row.source}</span>
          </span>
        </button>
      ),
    },
    { key: "project", header: "Project", sortValue: (row) => row.projectName, render: (row) => <span className="text-text-secondary truncate">{row.projectName}</span> },
    { key: "task", header: "Task", sortValue: (row) => row.taskTitle, render: (row) => <span className="text-text-muted truncate">{row.taskTitle}</span> },
    { key: "uploader", header: "Uploaded by", sortValue: (row) => row.uploadedByName, render: (row) => <span className="text-text-secondary truncate">{row.uploadedByName}</span> },
    { key: "size", header: "Size", sortValue: (row) => row.sizeBytes ?? -1, render: (row) => <span className="text-text-muted tabular-nums">{formatBytes(row.sizeBytes)}</span> },
    { key: "created", header: "Created", sortValue: (row) => row.createdAt, render: (row) => <span className="text-text-muted tabular-nums">{timeAgo(row.createdAt)}</span> },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface grid place-items-center">
          <Paperclip size={16} />
        </div>
        <div>
          <h1>Files & Attachments</h1>
          <div className="text-text-muted text-[12px]">System / Storage</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} />
          Refresh
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <Panel>
          <PanelBody className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-text">
              <HardDrive size={15} />
              <span className="font-medium">This is the friendly place for attachments.</span>
            </div>
            <div className="text-text-muted">
              Drive uploads come from `project_files`; older local/Supabase attachments come from `wt_attachments`.
            </div>
          </PanelBody>
        </Panel>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {metrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>

        <Panel>
          <PanelHeader className="gap-3">
            <PanelTitle>Attachment Library</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files, projects, people" className="pl-7" />
            </div>
            <div className="flex items-center gap-1">
              {SOURCE_FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setSource(item)}
                  className={`h-8 px-2 rounded-[var(--radius-sm)] text-[12px] ${source === item ? "bg-hover text-text" : "text-text-secondary hover:text-text"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </PanelHeader>
          <ActionMessage notice={notice} error={actionError || (data?.warnings[0] ?? "")} onClear={() => { setNotice(""); setActionError(""); }} />
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-10 bg-raised border border-border animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Files failed to load.</div>
            ) : (
              <DataTable rows={filtered} columns={columns} empty="No files visible" />
            )}
          </PanelBody>
        </Panel>
      </div>

      <Inspector open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "File"}>
        {selected && (
          <div className="space-y-3">
            <Panel>
              <PanelBody className="space-y-3">
                <div className="flex items-start gap-2">
                  <StatusDot tone={sourceTone(selected.source)} className="mt-1.5" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{selected.name}</div>
                    <div className="text-text-muted">{selected.mimeType || selected.category || selected.source}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Project</div>
                    <div className="text-text truncate">{selected.projectName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Task</div>
                    <div className="text-text truncate">{selected.taskTitle}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Uploaded by</div>
                    <div className="text-text truncate">{selected.uploadedByName}</div>
                  </div>
                  <div className="border border-border bg-raised p-2">
                    <div className="text-text-muted">Size</div>
                    <div className="text-text tabular-nums">{formatBytes(selected.sizeBytes)}</div>
                  </div>
                </div>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader>
                <PanelTitle>Actions</PanelTitle>
              </PanelHeader>
              <PanelBody className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled={selected.source !== "drive"} onClick={() => void openSelected(selected)}>
                  <ExternalLink size={13} />
                  Open
                </Button>
                <Button variant="outline" disabled={selected.source !== "drive"} onClick={() => void downloadSelected(selected)}>
                  <Download size={13} />
                  Download
                </Button>
                {selected.driveFileId && (
                  <Button variant="outline" className="col-span-2" onClick={() => void openDriveLink(selected.driveFileId)}>
                    <HardDrive size={13} />
                    Google Drive
                  </Button>
                )}
              </PanelBody>
            </Panel>

            {preview && (
              <Panel>
                <PanelHeader>
                  <FileText size={15} />
                  <PanelTitle>Preview</PanelTitle>
                </PanelHeader>
                <PanelBody>
                  {preview.mimeType.startsWith("image/") ? (
                    <img src={preview.url} alt={preview.name} className="max-h-[520px] w-full rounded-[var(--radius-sm)] border border-border object-contain bg-black" />
                  ) : preview.mimeType.startsWith("video/") ? (
                    <video src={preview.url} controls className="max-h-[520px] w-full rounded-[var(--radius-sm)] border border-border bg-black" />
                  ) : preview.mimeType.includes("pdf") ? (
                    <iframe src={preview.url} title={preview.name} className="h-[520px] w-full rounded-[var(--radius-sm)] border border-border bg-white" />
                  ) : (
                    <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-3 text-text-secondary">
                      Preview loaded. Use Download for this file type.
                    </div>
                  )}
                </PanelBody>
              </Panel>
            )}

            <Panel>
              <PanelHeader>
                <FileText size={15} />
                <PanelTitle>Metadata</PanelTitle>
              </PanelHeader>
              <PanelBody className="space-y-2 text-[12px] text-text-secondary">
                <div className="flex gap-2">
                  <FolderKanban size={13} className="mt-0.5 shrink-0" />
                  <span className="break-all">{selected.storageRef || selected.driveFileId || selected.id}</span>
                </div>
                <pre className="m-0 whitespace-pre-wrap break-words text-text-muted">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </PanelBody>
            </Panel>
          </div>
        )}
      </Inspector>
    </div>
  );
}
