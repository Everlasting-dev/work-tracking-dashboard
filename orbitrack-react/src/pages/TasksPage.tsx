import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CheckSquare, Circle, Loader2, RefreshCcw, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { queryKeys } from "@/lib/queryKeys";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { cn, timeAgo } from "@/lib/utils";
import { fetchWorkspaceProjects, updateWorkspaceTaskStatus, type WorkspaceProject, type WorkspaceTask } from "@/lib/workspaceProjects";

const EMPTY_PROJECTS: WorkspaceProject[] = [];
const TASK_STATUSES = [
  { id: "todo", label: "To Do", tone: "neutral" as const },
  { id: "doing", label: "Progress", tone: "info" as const },
  { id: "done", label: "Completed", tone: "ok" as const },
];

function taskColumn(status: string) {
  if (status === "done" || status === "completed") return "done";
  if (status === "doing" || status === "progress" || status === "in-progress") return "doing";
  return "todo";
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

interface TaskRow {
  task: WorkspaceTask;
  project: WorkspaceProject;
}

function StatusButtons({
  row,
  pending,
  onStatus,
}: {
  row: TaskRow;
  pending: boolean;
  onStatus: (taskId: number, projectId: number, status: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {TASK_STATUSES.map((status) => (
        <button
          key={status.id}
          type="button"
          disabled={pending || taskColumn(row.task.status) === status.id}
          onClick={() => onStatus(row.task.id, row.project.id, status.id)}
          className={cn(
            "h-6 px-2 rounded-[var(--radius-sm)] border border-border text-[11px] transition-colors",
            taskColumn(row.task.status) === status.id ? "bg-text text-bg" : "bg-raised text-text-muted hover:text-text hover:bg-hover",
          )}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const { session } = useExecutiveSession();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.projectsAll,
    queryFn: fetchWorkspaceProjects,
  });

  const projects = data?.projects ?? EMPTY_PROJECTS;
  const rows = useMemo<TaskRow[]>(
    () => projects.flatMap((project) => project.tasks.map((task) => ({ project, task }))),
    [projects],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === "all" || taskColumn(row.task.status) === status;
      const haystack = `${row.task.title} ${row.task.notes} ${row.project.name} ${row.project.ownerName}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, rows, status]);

  const statusMutation = useMutation({
    mutationFn: ({ taskId, projectId, nextStatus }: { taskId: number; projectId: number; nextStatus: string }) =>
      updateWorkspaceTaskStatus(taskId, projectId, nextStatus, session?.id ?? null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projectsAll });
    },
  });

  const metrics = useMemo(
    () => [
      { label: "Tasks", value: rows.length, tone: "neutral" as const },
      { label: "To do", value: rows.filter((row) => taskColumn(row.task.status) === "todo").length, tone: "neutral" as const },
      { label: "Progress", value: rows.filter((row) => taskColumn(row.task.status) === "doing").length, tone: "info" as const },
      { label: "Completed", value: rows.filter((row) => taskColumn(row.task.status) === "done").length, tone: "ok" as const },
    ],
    [rows],
  );

  return (
    <div className="h-full overflow-auto">
      <div className="px-4 py-4 border-b border-border flex items-center gap-3">
        <div className="h-8 w-8 border border-border bg-surface rounded-[var(--radius-sm)] grid place-items-center">
          <CheckSquare size={16} />
        </div>
        <div>
          <h1>Tasks</h1>
          <div className="text-text-muted text-[12px]">Global task desk</div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCcw size={13} className={isFetching ? "animate-spin" : undefined} />
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
            <PanelTitle>Task List</PanelTitle>
            <div className="flex-1" />
            <div className="relative w-72">
              <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className="pl-7" />
            </div>
            <div className="flex items-center gap-1">
              {[{ id: "all", label: "All" }, ...TASK_STATUSES].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id)}
                  className={cn("h-8 px-2 rounded-[var(--radius-sm)] text-[12px]", status === item.id ? "bg-hover text-text" : "text-text-secondary hover:text-text")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </PanelHeader>
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 grid gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-16 border border-border bg-raised animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-danger">Tasks failed to load.</div>
            ) : filtered.length ? (
              <div className="divide-y divide-border">
                {filtered.map((row) => {
                  const tone = TASK_STATUSES.find((item) => item.id === taskColumn(row.task.status))?.tone ?? "neutral";
                  return (
                    <motion.div
                      key={row.task.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="min-h-16 p-3 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px_260px_120px] gap-3 items-center hover:bg-hover"
                    >
                      <div className="min-w-0 flex gap-2">
                        {taskColumn(row.task.status) === "done" ? <CheckCircle2 size={15} className="mt-1 text-ok shrink-0" /> : <Circle size={15} className="mt-1 text-text-muted shrink-0" />}
                        <div className="min-w-0">
                          <div className="text-text font-medium truncate">{row.task.title}</div>
                          <div className="text-[12px] text-text-muted whitespace-pre-wrap break-words">{row.task.notes || "No task description."}</div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-text-secondary truncate">{row.project.name}</div>
                        <div className="text-[12px] text-text-muted truncate">{row.project.ownerName}</div>
                      </div>
                      <StatusButtons
                        row={row}
                        pending={statusMutation.isPending}
                        onStatus={(taskId, projectId, nextStatus) => statusMutation.mutate({ taskId, projectId, nextStatus })}
                      />
                      <div className="flex items-center gap-2 text-text-muted text-[12px]">
                        <StatusDot tone={tone} />
                        <span>{titleCase(taskColumn(row.task.status))}</span>
                        <span>{timeAgo(row.task.updatedAt)}</span>
                        {statusMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="min-h-48 grid place-items-center text-text-muted">No tasks visible.</div>
            )}
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
