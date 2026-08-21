import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Activity, ArrowRight, CalendarDays, CheckSquare, FileText, FolderKanban, Paperclip, Sparkles, Users } from "lucide-react";
import { MetricTile } from "@/components/ui/metric";
import { Panel, PanelBody, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import { queryKeys } from "@/lib/queryKeys";
import { fetchWorkspaceProjects } from "@/lib/workspaceProjects";
import { timeAgo } from "@/lib/utils";

const WORKSPACE_LINKS = [
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/files", label: "Files", icon: Paperclip },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
];

export function WorkspaceHomePage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.projectsAll,
    queryFn: fetchWorkspaceProjects,
  });

  const projects = data?.projects ?? [];
  const openTasks = projects.reduce((sum, project) => sum + project.tasks.filter((task) => task.status !== "done" && task.status !== "completed").length, 0);
  const recentProjects = [...projects].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 5);

  return (
    <div className="h-full overflow-auto">
      <div className="px-5 py-5 border-b border-border/60">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-text-muted">
              <Sparkles size={13} />
              Executive workstation
            </div>
            <h1 className="mt-2">Home</h1>
          </div>
          <Link to={"/projects" as never} className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-3 text-[13px] font-medium text-bg">
            Open projects
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricTile label="Projects" value={isLoading ? "..." : projects.length} />
          <MetricTile label="Active" value={isLoading ? "..." : projects.filter((project) => project.status === "active").length} tone="ok" />
          <MetricTile label="Open tasks" value={isLoading ? "..." : openTasks} tone="info" />
          <MetricTile label="Files" value={isLoading ? "..." : projects.reduce((sum, project) => sum + project.files.length, 0)} tone="info" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-3">
          <Panel>
            <PanelHeader>
              <Activity size={15} />
              <PanelTitle>Recent Work</PanelTitle>
            </PanelHeader>
            <PanelBody className="space-y-1">
              {recentProjects.map((project) => (
                  <Link key={project.id} to={"/projects" as never} className="flex items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2.5 text-text-secondary hover:bg-hover hover:text-text transition-colors">
                  <StatusDot tone={project.status === "active" ? "ok" : project.status === "on-hold" ? "warn" : "neutral"} />
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  <span className="text-[12px] text-text-muted tabular-nums">{timeAgo(project.updatedAt) || "recent"}</span>
                </Link>
              ))}
              {!recentProjects.length && <div className="min-h-32 grid place-items-center text-text-muted">No projects loaded yet.</div>}
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Places</PanelTitle>
            </PanelHeader>
            <PanelBody className="grid grid-cols-2 gap-2">
              {WORKSPACE_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to as never} className="min-h-20 rounded-[var(--radius-sm)] bg-raised/70 border border-border/70 p-3 hover:bg-hover transition-colors">
                    <Icon size={16} className="text-text-muted" />
                    <div className="mt-3 font-medium text-text-secondary">{item.label}</div>
                  </Link>
                );
              })}
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
