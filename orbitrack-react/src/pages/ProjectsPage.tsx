import * as Dialog from "@radix-ui/react-dialog";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  CheckSquare,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  GripVertical,
  HardDrive,
  Loader2,
  Paperclip,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Group as ResizeGroup, Panel as ResizePanel, Separator as ResizeSeparator, useDefaultLayout } from "react-resizable-panels";
import { downloadDriveFile, driveWebUrl, formatBytes, loadDriveFile, type LoadedAttachment } from "@/lib/adminFiles";
import { openExternalUrl } from "@/lib/desktopBridge";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { queryKeys } from "@/lib/queryKeys";
import { avatarSrc } from "@/lib/supabase";
import { cn, timeAgo } from "@/lib/utils";
import {
  addWorkspaceTask,
  createWorkspaceProject,
  fetchWorkspaceProjects,
  updateWorkspaceProjectStatus,
  updateWorkspaceTaskBoard,
  updateWorkspaceTaskStatus,
  uploadWorkspaceFile,
  type CreateProjectInput,
  type UserSummary,
  type WorkspaceFile,
  type WorkspaceProject,
  type WorkspaceTask,
} from "@/lib/workspaceProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";

const EMPTY_PROJECTS: WorkspaceProject[] = [];
const EMPTY_USERS: UserSummary[] = [];
const PROJECT_TYPES = ["project", "job", "research", "admin", "personal"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
const PROJECT_STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "on-hold", label: "On Hold" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
] as const;

const TASK_COLUMNS = [
  { id: "todo", label: "To Do", tone: "neutral" as const },
  { id: "doing", label: "Progress", tone: "info" as const },
  { id: "done", label: "Completed", tone: "ok" as const },
];

const PROJECT_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  "on-hold": "On Hold",
  completed: "Completed",
  archived: "Archived",
};

function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function formatDate(value: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function projectTone(status: string): "ok" | "warn" | "info" | "neutral" {
  if (status === "active") return "ok";
  if (status === "on-hold") return "warn";
  if (status === "completed") return "info";
  return "neutral";
}

function taskColumn(status: string) {
  if (status === "done" || status === "completed") return "done";
  if (status === "doing" || status === "progress" || status === "in-progress") return "doing";
  return "todo";
}

function taskTone(status: string): "ok" | "warn" | "danger" | "info" | "neutral" {
  const column = taskColumn(status);
  if (column === "done") return "ok";
  if (column === "doing") return "info";
  if (status === "blocked") return "danger";
  return "neutral";
}

function Avatar({ user, fallback, className }: { user?: UserSummary | null; fallback: string; className?: string }) {
  const src = user?.avatarDriveId ? avatarSrc({ avatar_drive_id: user.avatarDriveId }) : "";
  return src ? (
    <img src={src} alt="" className={cn("h-7 w-7 rounded-[var(--radius-sm)] border border-border object-cover bg-hover", className)} />
  ) : (
    <span
      className={cn("h-7 w-7 rounded-[var(--radius-sm)] border border-border bg-hover grid place-items-center text-[12px] font-semibold text-text", className)}
      style={user?.color ? { backgroundColor: user.color } : undefined}
    >
      {fallback}
    </span>
  );
}

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded-full bg-hover overflow-hidden">
      <motion.div
        className="h-full bg-text-secondary"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 24 }}
      />
    </div>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  ownerId,
  ownerDepartment,
  onCreate,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: number | null;
  ownerDepartment: string;
  onCreate: (input: CreateProjectInput) => Promise<void>;
  pending: boolean;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<(typeof PROJECT_TYPES)[number]>("project");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("medium");
  const [department, setDepartment] = useState(ownerDepartment);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!ownerId) {
      setError("Sign in with a user account before creating a project.");
      return;
    }
    if (!name.trim()) {
      setError("Give the project a name.");
      return;
    }
    try {
      await onCreate({ name, notes, type, priority, department, ownerId });
      setName("");
      setNotes("");
      setType("project");
      setPriority("medium");
      setDepartment(ownerDepartment);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[520px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 border border-border bg-bg rounded-[var(--radius-md)] shadow-2xl outline-none">
          <div className="h-12 px-3 border-b border-border flex items-center gap-2">
            <FolderKanban size={16} />
            <Dialog.Title className="font-semibold text-[14px] flex-1">New Project</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" title="Close">
                <X size={15} />
              </Button>
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="p-3 space-y-3">
            <label className="block space-y-1">
              <span className="text-[12px] text-text-muted">Name</span>
              <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] text-text-muted">Description</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-[var(--radius-sm)] border border-border bg-raised px-2.5 py-2 text-[13px] text-text outline-none transition-colors focus:border-border-strong resize-none"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="block space-y-1">
                <span className="text-[12px] text-text-muted">Type</span>
                <select value={type} onChange={(event) => setType(event.target.value as (typeof PROJECT_TYPES)[number])} className="h-8 w-full rounded-[var(--radius-sm)] border border-border bg-raised px-2.5 text-[13px] text-text outline-none">
                  {PROJECT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {titleCase(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[12px] text-text-muted">Priority</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as (typeof PRIORITIES)[number])} className="h-8 w-full rounded-[var(--radius-sm)] border border-border bg-raised px-2.5 text-[13px] text-text outline-none">
                  {PRIORITIES.map((item) => (
                    <option key={item} value={item}>
                      {titleCase(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[12px] text-text-muted">Department</span>
                <Input value={department} onChange={(event) => setDepartment(event.target.value)} />
              </label>
            </div>
            {error && <div className="border border-danger/30 bg-danger/10 p-2 text-danger text-[12px]">{error}</div>}
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button variant="default" type="submit" disabled={pending}>
                {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Create
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProjectListItem({
  project,
  active,
  owner,
  onSelect,
}: {
  project: WorkspaceProject;
  active: boolean;
  owner?: UserSummary;
  onSelect: () => void;
}) {
  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-[var(--radius-sm)] px-2.5 py-2.5 transition-colors hover:bg-hover/80",
        active && "bg-hover text-text shadow-[inset_0_1px_0_rgba(244,244,240,0.04)]",
      )}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-start gap-2">
        <StatusDot tone={projectTone(project.status)} className="mt-2" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{project.name}</span>
            {project.files.length > 0 && <Paperclip size={12} className="text-text-muted shrink-0" />}
          </div>
          <div className="mt-0.5 text-[12px] text-text-muted truncate">{project.notes || titleCase(project.type)}</div>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        <ProgressLine value={project.progress} />
        <div className="flex items-center gap-2 text-[12px] text-text-muted">
          <Avatar user={owner} fallback={project.ownerInitial} className="h-5 w-5 text-[10px]" />
          <span className="truncate flex-1">{project.ownerName}</span>
          <span className="tabular-nums">{project.doneCount}/{project.taskCount}</span>
        </div>
      </div>
    </motion.button>
  );
}

function AddTaskForm({
  project,
  actorId,
  onAdd,
  pending,
}: {
  project: WorkspaceProject;
  actorId: number | null;
  onAdd: (projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) => Promise<void>;
  pending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Add a task title.");
      return;
    }
    try {
      await onAdd(project.id, title, notes, actorId, project.ownerId);
      setTitle("");
      setNotes("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] gap-2">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
        <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Task description" />
        <Button variant="default" type="submit" disabled={pending}>
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add
        </Button>
      </div>
      {error && <div className="text-danger text-[12px]">{error}</div>}
    </form>
  );
}

function TaskStatusButtons({
  task,
  projectId,
  actorId,
  disabled,
  onChange,
}: {
  task: WorkspaceTask;
  projectId: number;
  actorId: number | null;
  disabled: boolean;
  onChange: (taskId: number, projectId: number, status: string, actorId: number | null) => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-1">
      {TASK_COLUMNS.map((column) => (
        <button
          key={column.id}
          type="button"
          disabled={disabled || taskColumn(task.status) === column.id}
          onClick={() => void onChange(task.id, projectId, column.id, actorId)}
          className={cn(
            "h-6 px-2 rounded-[var(--radius-sm)] border border-border text-[11px] transition-colors",
            taskColumn(task.status) === column.id ? "bg-accent text-bg border-accent" : "bg-raised/70 text-text-muted hover:text-text hover:bg-hover",
            disabled && "opacity-50",
          )}
        >
          {column.label}
        </button>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  projectId,
  assignee,
  actorId,
  pending,
  onStatus,
  overlay = false,
}: {
  task: WorkspaceTask;
  projectId: number;
  assignee?: UserSummary;
  actorId: number | null;
  pending: boolean;
  onStatus: (taskId: number, projectId: number, status: string, actorId: number | null) => Promise<void>;
  overlay?: boolean;
}) {
  const sortable = useSortable({
    id: task.id,
    data: { type: "task", taskId: task.id, status: taskColumn(task.status) },
    disabled: overlay,
  });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <motion.div
      ref={sortable.setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        "border border-border/80 rounded-[var(--radius-md)] bg-raised/80 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.12)]",
        sortable.isDragging && "opacity-40",
        overlay && "shadow-2xl border-border-strong",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 h-6 w-6 rounded-[var(--radius-sm)] grid place-items-center text-text-muted hover:bg-hover hover:text-text cursor-grab active:cursor-grabbing"
          {...sortable.attributes}
          {...sortable.listeners}
          title="Drag task"
        >
          <GripVertical size={14} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <StatusDot tone={taskTone(task.status)} className="mt-2" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-text break-words">{task.title}</div>
              {task.notes ? (
                <div className="mt-1 text-[12px] leading-5 text-text-secondary whitespace-pre-wrap break-words">{task.notes}</div>
              ) : (
                <div className="mt-1 text-[12px] text-text-muted">No task description.</div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
            <span className="border border-border bg-surface px-1.5 py-0.5 rounded-[var(--radius-sm)]">{titleCase(task.priority)}</span>
            {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
            {assignee && <span>{assignee.displayName}</span>}
          </div>
          <div className="mt-3">
            <TaskStatusButtons task={task} projectId={projectId} actorId={actorId} disabled={pending} onChange={onStatus} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TaskColumn({
  status,
  label,
  tone,
  tasks,
  projectId,
  usersById,
  actorId,
  pending,
  onStatus,
}: {
  status: string;
  label: string;
  tone: "ok" | "info" | "neutral";
  tasks: WorkspaceTask[];
  projectId: number;
  usersById: Map<number, UserSummary>;
  actorId: number | null;
  pending: boolean;
  onStatus: (taskId: number, projectId: number, nextStatus: string, actorId: number | null) => Promise<void>;
}) {
  const droppable = useDroppable({ id: `column-${status}`, data: { type: "column", status } });

  return (
    <section ref={droppable.setNodeRef} className={cn("min-h-[280px] rounded-[var(--radius-md)] border border-border/80 bg-surface/70", droppable.isOver && "border-border-strong bg-hover")}>
      <div className="h-10 px-3 border-b border-border/70 flex items-center gap-2">
        <StatusDot tone={tone} />
        <h3 className="font-semibold text-[13px] flex-1">{label}</h3>
        <span className="text-text-muted tabular-nums text-[12px]">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="p-2 space-y-2">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={projectId}
                assignee={task.assigneeId ? usersById.get(task.assigneeId) : undefined}
                actorId={actorId}
                pending={pending}
                onStatus={onStatus}
              />
            ))}
          </AnimatePresence>
          {!tasks.length && <div className="h-24 border border-dashed border-border rounded-[var(--radius-sm)] grid place-items-center text-text-muted text-[12px]">Drop tasks here</div>}
        </div>
      </SortableContext>
    </section>
  );
}

function FilePreview({ preview }: { preview: LoadedAttachment }) {
  if (preview.mimeType.startsWith("image/")) {
    return <img src={preview.url} alt={preview.name} className="max-h-[360px] w-full rounded-[var(--radius-sm)] border border-border object-contain bg-black" />;
  }
  if (preview.mimeType.startsWith("video/")) {
    return <video src={preview.url} controls className="max-h-[360px] w-full rounded-[var(--radius-sm)] border border-border bg-black" />;
  }
  if (preview.mimeType.includes("pdf")) {
    return <iframe src={preview.url} title={preview.name} className="h-[420px] w-full rounded-[var(--radius-sm)] border border-border bg-white" />;
  }
  return <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-3 text-text-secondary">Preview loaded. Use Download for this file type.</div>;
}

function ProjectFilesPanel({
  project,
  uploadPending,
  onUpload,
}: {
  project: WorkspaceProject;
  uploadPending: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const [preview, setPreview] = useState<LoadedAttachment | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
    setMessage("");
  }, [project.id]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const openFile = async (file: WorkspaceFile) => {
    setMessage("");
    if (file.source !== "drive") {
      setMessage("Legacy file metadata is visible here; Drive-backed files can preview in this app.");
      return;
    }
    try {
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return null;
      });
      const loaded = await loadDriveFile(file.id);
      setPreview({ ...loaded, name: file.fileName || loaded.name, mimeType: file.mimeType || loaded.mimeType });
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const downloadFile = async (file: WorkspaceFile) => {
    setMessage("");
    if (file.source !== "drive") {
      setMessage("Legacy file metadata is visible here; Drive-backed files can download in this app.");
      return;
    }
    try {
      await downloadDriveFile(file.id, file.fileName);
      setMessage("Download started.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : String(caught));
    }
  };

  const openDriveFile = async (file: WorkspaceFile) => {
    const url = driveWebUrl(file.driveFileId);
    if (!url) return;
    const opened = await openExternalUrl(url);
    if (!opened) setMessage("Could not open the Google Drive link.");
  };

  return (
    <Panel>
      <PanelHeader>
        <Paperclip size={15} />
        <PanelTitle>Attachments</PanelTitle>
        <div className="flex-1" />
        <label className="inline-flex">
          <input
            type="file"
            className="sr-only"
            disabled={uploadPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void onUpload(file);
            }}
          />
          <span className={cn("inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] h-7 px-2.5 text-[13px] font-medium border border-border text-text-secondary hover:bg-hover hover:text-text", uploadPending && "opacity-50")}>
            {uploadPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Upload
          </span>
        </label>
      </PanelHeader>
      <PanelBody className="space-y-3">
        {message && <div className="border border-border bg-raised rounded-[var(--radius-sm)] p-2 text-[12px] text-text-secondary">{message}</div>}
        <div className="space-y-2">
          {project.files.slice(0, 8).map((file) => (
            <div key={`${file.source}-${file.id}`} className="border border-border bg-raised rounded-[var(--radius-sm)] p-2">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-text-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-text-secondary truncate">{file.fileName}</div>
                  <div className="text-[11px] text-text-muted">
                    {file.source} / {file.mimeType || "file"} / {formatBytes(file.sizeBytes)}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => void openFile(file)} disabled={file.source !== "drive"} title="Preview">
                  <ExternalLink size={13} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => void downloadFile(file)} disabled={file.source !== "drive"} title="Download">
                  <Download size={13} />
                </Button>
                {file.driveFileId && (
                  <Button variant="ghost" size="icon" onClick={() => void openDriveFile(file)} title="Google Drive">
                    <HardDrive size={13} />
                  </Button>
                )}
              </div>
              {file.description && <div className="mt-1 text-[12px] text-text-muted">{file.description}</div>}
            </div>
          ))}
          {!project.files.length && <div className="text-text-muted text-[12px]">No files attached yet.</div>}
        </div>
        {preview && <FilePreview preview={preview} />}
      </PanelBody>
    </Panel>
  );
}

function ProjectWorkbench({
  project,
  owner,
  usersById,
  actorId,
  activeTask,
  taskPending,
  boardPending,
  statusPending,
  onAddTask,
  onTaskStatus,
  onBoardMove,
  onProjectStatus,
  onDragStart,
  onDragEnd,
}: {
  project: WorkspaceProject;
  owner?: UserSummary;
  usersById: Map<number, UserSummary>;
  actorId: number | null;
  activeTask: WorkspaceTask | null;
  taskPending: boolean;
  boardPending: boolean;
  statusPending: boolean;
  onAddTask: (projectId: number, title: string, notes: string, actorId: number | null, assigneeId: number | null) => Promise<void>;
  onTaskStatus: (taskId: number, projectId: number, status: string, actorId: number | null) => Promise<void>;
  onBoardMove: (event: DragEndEvent, project: WorkspaceProject) => void;
  onProjectStatus: (projectId: number, status: string, actorId: number | null) => Promise<void>;
  onDragStart: (event: DragStartEvent, project: WorkspaceProject) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const tasksByColumn = useMemo(
    () =>
      Object.fromEntries(
        TASK_COLUMNS.map((column) => [
          column.id,
          project.tasks.filter((task) => taskColumn(task.status) === column.id).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
        ]),
      ) as Record<string, WorkspaceTask[]>,
    [project.tasks],
  );

  return (
    <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-3">
      <Panel>
        <PanelBody className="space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="h-10 w-10 border border-border bg-surface rounded-[var(--radius-sm)] grid place-items-center">
              <FolderKanban size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate">{project.name}</h1>
                <span className="h-6 px-2 border border-border bg-raised rounded-[var(--radius-sm)] text-[12px] text-text-secondary">{PROJECT_STATUS_LABEL[project.status] ?? titleCase(project.status)}</span>
                <span className="h-6 px-2 border border-border bg-raised rounded-[var(--radius-sm)] text-[12px] text-text-secondary">{titleCase(project.priority)}</span>
              </div>
              <p className="m-0 mt-1 text-text-secondary whitespace-pre-wrap break-words">{project.notes || "No project description yet."}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-text-muted">
                <Avatar user={owner} fallback={project.ownerInitial} className="h-6 w-6" />
                <span>{project.ownerName}</span>
                {project.department && <span>{titleCase(project.department)}</span>}
                <span>Updated {timeAgo(project.updatedAt) || "recently"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={statusPending || project.status === "active"} onClick={() => void onProjectStatus(project.id, "active", actorId)}>
                <PlayCircle size={13} />
                Active
              </Button>
              <Button variant="outline" disabled={statusPending || project.status === "on-hold"} onClick={() => void onProjectStatus(project.id, "on-hold", actorId)}>
                <PauseCircle size={13} />
                Hold
              </Button>
              <Button variant="outline" disabled={statusPending || project.status === "completed"} onClick={() => void onProjectStatus(project.id, "completed", actorId)}>
                <CheckCircle2 size={13} />
                Complete
              </Button>
              <Button variant="outline" disabled={statusPending || project.status === "archived"} onClick={() => void onProjectStatus(project.id, "archived", actorId)}>
                <Archive size={13} />
                Archive
              </Button>
            </div>
          </div>
          <ProgressLine value={project.progress} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricTile label="Tasks" value={project.taskCount} />
            <MetricTile label="Done" value={project.doneCount} tone="ok" />
            <MetricTile label="In progress" value={project.doingCount} tone="info" />
            <MetricTile label="Files" value={project.files.length} tone="info" />
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader>
          <CheckSquare size={15} />
          <PanelTitle>Tasks</PanelTitle>
          <div className="flex-1" />
          {(taskPending || boardPending) && <Loader2 size={14} className="animate-spin text-text-muted" />}
        </PanelHeader>
        <PanelBody className="space-y-3">
          <AddTaskForm project={project} actorId={actorId} onAdd={onAddTask} pending={taskPending} />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => onDragStart(event, project)}
            onDragEnd={(event) => {
              onBoardMove(event, project);
              onDragEnd(event);
            }}
            onDragCancel={() => onDragEnd({} as DragEndEvent)}
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              {TASK_COLUMNS.map((column) => (
                <TaskColumn
                  key={column.id}
                  status={column.id}
                  label={column.label}
                  tone={column.tone}
                  tasks={tasksByColumn[column.id] ?? []}
                  projectId={project.id}
                  usersById={usersById}
                  actorId={actorId}
                  pending={taskPending || boardPending}
                  onStatus={onTaskStatus}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <TaskCard
                  task={activeTask}
                  projectId={project.id}
                  assignee={activeTask.assigneeId ? usersById.get(activeTask.assigneeId) : undefined}
                  actorId={actorId}
                  pending={true}
                  onStatus={onTaskStatus}
                  overlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </PanelBody>
      </Panel>

    </motion.div>
  );
}

function ProjectContextPanel({
  project,
  owner,
  uploadPending,
  onUpload,
}: {
  project: WorkspaceProject;
  owner?: UserSummary;
  uploadPending: boolean;
  onUpload: (projectId: number, file: File) => Promise<void>;
}) {
  const openTasks = project.tasks.filter((task) => taskColumn(task.status) !== "done").length;
  const nextDueTask = [...project.tasks]
    .filter((task) => task.dueDate && taskColumn(task.status) !== "done")
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))[0];

  return (
    <motion.div
      key={`context-${project.id}`}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
      className="h-full min-h-0 overflow-auto pr-1 space-y-3"
    >
      <Panel>
        <PanelHeader>
          <FolderKanban size={15} />
          <PanelTitle>Inspector</PanelTitle>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Description</div>
            <p className="mt-2 m-0 text-text-secondary whitespace-pre-wrap break-words">{project.notes || "No project description yet."}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[var(--radius-sm)] bg-raised/70 border border-border/70 p-2.5">
              <div className="text-[11px] text-text-muted">Status</div>
              <div className="mt-1 flex items-center gap-2 text-text">
                <StatusDot tone={projectTone(project.status)} />
                <span>{PROJECT_STATUS_LABEL[project.status] ?? titleCase(project.status)}</span>
              </div>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-raised/70 border border-border/70 p-2.5">
              <div className="text-[11px] text-text-muted">Priority</div>
              <div className="mt-1 text-text">{titleCase(project.priority)}</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Avatar user={owner} fallback={project.ownerInitial} className="h-7 w-7" />
              <div className="min-w-0">
                <div className="truncate text-text">{project.ownerName}</div>
                <div className="truncate text-[12px] text-text-muted">{project.department ? titleCase(project.department) : "No department"}</div>
              </div>
            </div>
            <ProgressLine value={project.progress} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-[var(--radius-sm)] bg-raised/70 p-2">
              <div className="text-[18px] font-semibold tabular-nums">{openTasks}</div>
              <div className="text-[11px] text-text-muted">Open</div>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-raised/70 p-2">
              <div className="text-[18px] font-semibold tabular-nums">{project.doneCount}</div>
              <div className="text-[11px] text-text-muted">Done</div>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-raised/70 p-2">
              <div className="text-[18px] font-semibold tabular-nums">{project.files.length}</div>
              <div className="text-[11px] text-text-muted">Files</div>
            </div>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader>
          <RefreshCcw size={15} />
          <PanelTitle>Activity</PanelTitle>
        </PanelHeader>
        <PanelBody className="space-y-3">
          <div className="flex items-start gap-2 text-text-secondary">
            <StatusDot tone="neutral" className="mt-2" />
            <div>
              <div>Project updated {timeAgo(project.updatedAt) || "recently"}</div>
              <div className="text-[12px] text-text-muted">Live sync will refresh this workspace when project records change.</div>
            </div>
          </div>
          {nextDueTask && (
            <div className="flex items-start gap-2 text-text-secondary">
              <StatusDot tone="warn" className="mt-2" />
              <div>
                <div className="text-text">Next due: {nextDueTask.title}</div>
                <div className="text-[12px] text-text-muted">{formatDate(nextDueTask.dueDate ?? "")}</div>
              </div>
            </div>
          )}
        </PanelBody>
      </Panel>

      <ProjectFilesPanel project={project} uploadPending={uploadPending} onUpload={(file) => onUpload(project.id, file)} />
    </motion.div>
  );
}

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const { session } = useExecutiveSession();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof PROJECT_STATUS_FILTERS)[number]["key"]>("all");
  const [owner, setOwner] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<WorkspaceTask | null>(null);

  useEffect(() => {
    const openCreate = () => setCreateOpen(true);
    window.addEventListener("executive:new-project", openCreate);
    return () => window.removeEventListener("executive:new-project", openCreate);
  }, []);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.projectsAll,
    queryFn: fetchWorkspaceProjects,
  });

  const projects = data?.projects ?? EMPTY_PROJECTS;
  const users = data?.users ?? EMPTY_USERS;
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const actorId = session?.id ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = status === "all" || project.status === status;
      const matchesOwner = owner === "all" || (owner === "me" ? project.ownerId === actorId : project.ownerId === Number(owner));
      const haystack = `${project.name} ${project.notes} ${project.ownerName} ${project.department} ${project.type}`.toLowerCase();
      return matchesStatus && matchesOwner && (!needle || haystack.includes(needle));
    });
  }, [actorId, owner, projects, query, status]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((project) => project.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = selectedId ? projects.find((project) => project.id === selectedId) ?? null : null;

  const createMutation = useMutation({
    mutationFn: createWorkspaceProject,
    onSuccess: async (id) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
      setSelectedId(id);
      setCreateOpen(false);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: ({ projectId, title, notes, actor, assignee }: { projectId: number; title: string; notes: string; actor: number | null; assignee: number | null }) =>
      addWorkspaceTask(projectId, title, notes, actor, assignee),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
    },
  });

  const taskStatusMutation = useMutation({
    mutationFn: ({ taskId, projectId, nextStatus, actor }: { taskId: number; projectId: number; nextStatus: string; actor: number | null }) =>
      updateWorkspaceTaskStatus(taskId, projectId, nextStatus, actor),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
    },
  });

  const boardMutation = useMutation({
    mutationFn: updateWorkspaceTaskBoard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
    },
  });

  const projectStatusMutation = useMutation({
    mutationFn: ({ projectId, nextStatus, actor }: { projectId: number; nextStatus: string; actor: number | null }) =>
      updateWorkspaceProjectStatus(projectId, nextStatus, actor),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ projectId, file }: { projectId: number; file: File }) => uploadWorkspaceFile({ projectId, file, description: file.name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
      await queryClient.invalidateQueries({ queryKey: ["admin", "files"] });
    },
  });

  const ownerOptions = useMemo(() => {
    const ids = new Set(projects.map((project) => project.ownerId).filter((id): id is number => Boolean(id)));
    return [...ids].map((id) => usersById.get(id)).filter(Boolean) as UserSummary[];
  }, [projects, usersById]);

  const metrics = useMemo(
    () => [
      { label: "Projects", value: projects.length, tone: "neutral" as const },
      { label: "Active", value: projects.filter((project) => project.status === "active").length, tone: "ok" as const },
      { label: "On hold", value: projects.filter((project) => project.status === "on-hold").length, tone: "warn" as const },
      { label: "Open tasks", value: projects.reduce((sum, project) => sum + project.tasks.filter((task) => taskColumn(task.status) !== "done").length, 0), tone: "info" as const },
      { label: "Files", value: projects.reduce((sum, project) => sum + project.files.length, 0), tone: "info" as const },
    ],
    [projects],
  );

  const projectLayout = useDefaultLayout({
    id: "executive-black-project-workspace",
    panelIds: ["project-index", "project-workbench", "project-context"],
    onlySaveAfterUserInteractions: true,
  });

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: projects.length };
    for (const item of PROJECT_STATUS_FILTERS.slice(1)) {
      result[item.key] = projects.filter((project) => project.status === item.key).length;
    }
    return result;
  }, [projects]);

  const fallbackOwnerId = actorId ?? users[0]?.id ?? null;
  const ownerDepartment = session?.department || usersById.get(fallbackOwnerId ?? -1)?.department || "";

  const handleDragStart = (event: DragStartEvent, project: WorkspaceProject) => {
    const taskId = Number(event.active.id);
    setActiveTask(project.tasks.find((task) => task.id === taskId) ?? null);
  };

  const handleBoardMove = (event: DragEndEvent, project: WorkspaceProject) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = Number(active.id);
    const moving = project.tasks.find((task) => task.id === taskId);
    if (!moving) return;

    const sourceStatus = taskColumn(moving.status);
    const overData = over.data.current as { type?: string; status?: string; taskId?: number } | undefined;
    const targetStatus = overData?.status ?? sourceStatus;
    const overTaskId = overData?.type === "task" ? Number(over.id) : null;
    if (sourceStatus === targetStatus && overTaskId === taskId) return;

    let orderedIds: number[];
    if (sourceStatus === targetStatus) {
      const list = project.tasks.filter((task) => taskColumn(task.status) === sourceStatus).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      const oldIndex = list.findIndex((task) => task.id === taskId);
      const newIndex = overTaskId ? list.findIndex((task) => task.id === overTaskId) : list.length - 1;
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
      orderedIds = arrayMove(list, oldIndex, newIndex).map((task) => task.id);
    } else {
      const list = project.tasks
        .filter((task) => taskColumn(task.status) === targetStatus && task.id !== taskId)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      const insertAt = overTaskId ? list.findIndex((task) => task.id === overTaskId) : list.length;
      list.splice(insertAt < 0 ? list.length : insertAt, 0, { ...moving, status: targetStatus });
      orderedIds = list.map((task) => task.id);
    }

    boardMutation.mutate({ taskId, projectId: project.id, status: targetStatus, orderedIds, actorId });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface rounded-[var(--radius-sm)] grid place-items-center">
          <FolderKanban size={16} />
        </div>
        <div className="min-w-0">
          <h1>Projects</h1>
          <div className="text-text-muted text-[12px]">Interactive project workbench</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} className={isFetching ? "animate-spin" : undefined} />
          Refresh
        </Button>
        <Button variant="default" onClick={() => setCreateOpen(true)}>
          <Plus size={13} />
          New Project
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {metrics.map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>

        <div className="overflow-x-auto">
          <ResizeGroup
            orientation="horizontal"
            defaultLayout={projectLayout.defaultLayout ?? { "project-index": 24, "project-workbench": 52, "project-context": 24 }}
            onLayoutChanged={projectLayout.onLayoutChanged}
            className="min-h-[calc(100vh-230px)] min-w-[1060px]"
          >
            <ResizePanel id="project-index" defaultSize="24%" minSize="18%" maxSize="34%" className="min-w-[280px]">
              <Panel className="h-full flex flex-col">
                <PanelHeader>
                  <PanelTitle>Project Index</PanelTitle>
                  <div className="flex-1" />
                  <span className="text-[12px] text-text-muted tabular-nums">{filtered.length}</span>
                </PanelHeader>
                <PanelBody className="flex-1 min-h-0 flex flex-col gap-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="pl-8" />
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <select value={owner} onChange={(event) => setOwner(event.target.value)} className="h-9 rounded-[var(--radius-sm)] border border-border bg-raised/80 px-2.5 text-[13px] text-text outline-none">
                      <option value="all">All owners</option>
                      <option value="me">My projects</option>
                      {ownerOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.displayName}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={() => { setQuery(""); setOwner("all"); setStatus("all"); }} title="Reset filters">
                      <RotateCcw size={13} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PROJECT_STATUS_FILTERS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setStatus(item.key)}
                        className={cn(
                          "h-8 px-2.5 rounded-[var(--radius-sm)] text-[12px] transition-colors",
                          status === item.key ? "bg-hover text-text" : "text-text-secondary hover:text-text hover:bg-surface",
                        )}
                      >
                        {item.label} <span className="text-text-muted tabular-nums">{counts[item.key] ?? 0}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 min-h-[260px] overflow-auto pr-1 space-y-1">
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-20 bg-raised/70 rounded-[var(--radius-md)] animate-pulse" />)
                    ) : error ? (
                      <div className="p-3 text-danger">Projects failed to load.</div>
                    ) : filtered.length ? (
                      <AnimatePresence initial={false}>
                        {filtered.map((project) => (
                          <ProjectListItem
                            key={project.id}
                            project={project}
                            active={project.id === selectedId}
                            owner={project.ownerId ? usersById.get(project.ownerId) : undefined}
                            onSelect={() => setSelectedId(project.id)}
                          />
                        ))}
                      </AnimatePresence>
                    ) : (
                      <div className="min-h-48 grid place-items-center text-center text-text-muted">
                        <div>
                          <FolderKanban size={18} className="mx-auto mb-2" />
                          No projects match this view.
                        </div>
                      </div>
                    )}
                  </div>
                </PanelBody>
              </Panel>
            </ResizePanel>

            <ResizeSeparator className="executive-resize-handle" />

            <ResizePanel id="project-workbench" defaultSize="52%" minSize="34%" className="min-w-[460px]">
              <div className="h-full overflow-auto pr-1">
                {selected ? (
                  <ProjectWorkbench
                    project={selected}
                    owner={selected.ownerId ? usersById.get(selected.ownerId) : undefined}
                    usersById={usersById}
                    actorId={actorId}
                    activeTask={activeTask}
                    taskPending={addTaskMutation.isPending || taskStatusMutation.isPending}
                    boardPending={boardMutation.isPending}
                    statusPending={projectStatusMutation.isPending}
                    onAddTask={(projectId, title, notes, actor, assignee) =>
                      addTaskMutation.mutateAsync({ projectId, title, notes, actor, assignee }).then(() => undefined)
                    }
                    onTaskStatus={(taskId, projectId, nextStatus, actor) =>
                      taskStatusMutation.mutateAsync({ taskId, projectId, nextStatus, actor }).then(() => undefined)
                    }
                    onBoardMove={handleBoardMove}
                    onProjectStatus={(projectId, nextStatus, actor) =>
                      projectStatusMutation.mutateAsync({ projectId, nextStatus, actor }).then(() => undefined)
                    }
                    onDragStart={handleDragStart}
                    onDragEnd={() => setActiveTask(null)}
                  />
                ) : (
                  <Panel>
                    <PanelBody className="min-h-[420px] grid place-items-center text-center text-text-muted">
                      <div>
                        <FolderKanban size={22} className="mx-auto mb-2" />
                        Select a project to work on it.
                      </div>
                    </PanelBody>
                  </Panel>
                )}
              </div>
            </ResizePanel>

            <ResizeSeparator className="executive-resize-handle" />

            <ResizePanel id="project-context" defaultSize="24%" minSize="20%" maxSize="36%" className="min-w-[320px]">
              {selected ? (
                <ProjectContextPanel
                  project={selected}
                  owner={selected.ownerId ? usersById.get(selected.ownerId) : undefined}
                  uploadPending={uploadMutation.isPending}
                  onUpload={(projectId, file) => uploadMutation.mutateAsync({ projectId, file }).then(() => undefined)}
                />
              ) : (
                <Panel className="h-full">
                  <PanelBody className="h-full min-h-[420px] grid place-items-center text-center text-text-muted">
                    <div>
                      <Paperclip size={20} className="mx-auto mb-2" />
                      Attachments and context appear here.
                    </div>
                  </PanelBody>
                </Panel>
              )}
            </ResizePanel>
          </ResizeGroup>
        </div>
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        ownerId={fallbackOwnerId}
        ownerDepartment={ownerDepartment}
        pending={createMutation.isPending}
        onCreate={(input) => createMutation.mutateAsync(input).then(() => undefined)}
      />
    </div>
  );
}
