import {
  Activity,
  ArchiveRestore,
  BarChart3,
  Bell,
  Bot,
  Brain,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  Database,
  FileText,
  FileWarning,
  Flag,
  FolderKanban,
  Gauge,
  GitBranch,
  HardDrive,
  HeartPulse,
  Home,
  KeyRound,
  Lock,
  Map,
  Megaphone,
  Paperclip,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode } from "react";
import {
  AdminApprovalsPage,
  AdminAuditPage,
  AdminDataStoragePage,
  AdminFilesPage,
  AdminIncidentsPage,
  AdminOverviewPage,
  AdminProjectsPage,
  AdminUsersPage,
  AdminWorkloadPage,
  ModulePage,
  ProjectsPage,
  TasksPage,
  WorkspaceHomePage,
} from "@/app/lazyPages";
import { LazyRouteBoundary } from "@/app/RouteBoundary";

export interface AppRoute {
  path: string;
  label: string;
  group: string;
  area: "admin" | "workspace";
  icon: LucideIcon;
  element: ReactNode;
}

interface ModuleDefinition {
  path: string;
  label: string;
  group: string;
  icon: LucideIcon;
  priority: "Foundation" | "Operations" | "Reliability" | "Control" | "Advanced";
  rows: string[];
}

function lazyElement(label: string, element: ReactNode): ReactNode {
  return <LazyRouteBoundary label={label}>{element}</LazyRouteBoundary>;
}

function moduleRoute(definition: ModuleDefinition): AppRoute {
  return {
    path: definition.path,
    label: definition.label,
    group: definition.group,
    area: definition.path.startsWith("/workspace") ? "workspace" : "admin",
    icon: definition.icon,
    element: lazyElement(
      definition.label,
      <ModulePage title={definition.label} group={definition.group} icon={definition.icon} priority={definition.priority} rows={definition.rows} />,
    ),
  };
}

export const workspaceRoutes: AppRoute[] = [
  { path: "/workspace", label: "Home", group: "Workspace", area: "workspace", icon: Home, element: lazyElement("Home", <WorkspaceHomePage />) },
  { path: "/workspace/projects", label: "Projects", group: "Workspace", area: "workspace", icon: FolderKanban, element: lazyElement("Projects", <ProjectsPage />) },
  { path: "/workspace/tasks", label: "Tasks", group: "Workspace", area: "workspace", icon: CheckSquare, element: lazyElement("Tasks", <TasksPage />) },
  moduleRoute({ path: "/workspace/orbit-map", label: "Orbit Map", group: "Workspace", icon: Map, priority: "Advanced", rows: ["Portfolio map", "Dependencies", "Risk lanes", "Resource gravity"] }),
  { path: "/workspace/calendar", label: "Calendar", group: "Workspace", area: "workspace", icon: CalendarDays, element: lazyElement("Calendar", <ModulePage title="Calendar" group="Workspace" icon={CalendarDays} priority="Operations" rows={["Month", "Agenda", "Events", "Deadlines"]} />) },
  moduleRoute({ path: "/workspace/canvas", label: "Canvas", group: "Workspace", icon: SlidersHorizontal, priority: "Advanced", rows: ["Project canvas", "Scratch space", "Local persistence", "Export"] }),
  moduleRoute({ path: "/workspace/intelligence", label: "Intelligence", group: "Workspace", icon: Brain, priority: "Advanced", rows: ["Focus brief", "Local summaries", "Project signals", "Action drafts"] }),
  { path: "/workspace/team", label: "Team", group: "Workspace", area: "workspace", icon: Users, element: lazyElement("Team", <ModulePage title="Team" group="Workspace" icon={Users} priority="Operations" rows={["Directory", "Profile", "Ranking", "Availability"]} />) },
];

export const secondaryWorkspaceRoutes: AppRoute[] = [
  { path: "/workspace/files", label: "Files", group: "Library", area: "workspace", icon: Paperclip, element: lazyElement("Files", <AdminFilesPage />) },
  moduleRoute({ path: "/workspace/documents", label: "Documents", group: "Library", icon: FileText, priority: "Advanced", rows: ["Rich notes", "Project docs", "Templates", "Exports"] }),
  moduleRoute({ path: "/workspace/automations", label: "Automations", group: "Library", icon: Workflow, priority: "Control", rows: ["Triggers", "Actions", "Runs", "Failures"] }),
  moduleRoute({ path: "/workspace/reports", label: "Reports", group: "Library", icon: BarChart3, priority: "Advanced", rows: ["Executive summaries", "Portfolio exports", "Project health", "Saved views"] }),
];

export const adminRouteGroups: { label: string; routes: AppRoute[] }[] = [
  {
    label: "Operations",
    routes: [
      { path: "/admin/overview", label: "Operations", group: "Operations", area: "admin", icon: ShieldCheck, element: lazyElement("Operations", <AdminOverviewPage />) },
      { path: "/admin/users", label: "Users", group: "Operations", area: "admin", icon: Users, element: lazyElement("Users", <AdminUsersPage />) },
      { path: "/admin/projects", label: "Project Governance", group: "Operations", area: "admin", icon: FolderKanban, element: lazyElement("Project Governance", <AdminProjectsPage />) },
      { path: "/admin/workload", label: "Workload", group: "Operations", area: "admin", icon: Gauge, element: lazyElement("Workload", <AdminWorkloadPage />) },
      { path: "/admin/approvals", label: "Approvals", group: "Operations", area: "admin", icon: ClipboardCheck, element: lazyElement("Approvals", <AdminApprovalsPage />) },
      moduleRoute({ path: "/admin/activity", label: "Activity", group: "Operations", icon: Activity, priority: "Operations", rows: ["Events", "Filters", "Inspection", "Record links"] }),
    ],
  },
  {
    label: "Reliability",
    routes: [
      { path: "/admin/incidents", label: "Incidents", group: "Reliability", area: "admin", icon: FileWarning, element: lazyElement("Incidents", <AdminIncidentsPage />) },
      moduleRoute({ path: "/admin/health", label: "Health", group: "Reliability", icon: HeartPulse, priority: "Reliability", rows: ["Database", "Auth", "Storage", "Background jobs"] }),
      { path: "/admin/files", label: "Files & Attachments", group: "Reliability", area: "admin", icon: Paperclip, element: lazyElement("Files & Attachments", <AdminFilesPage />) },
      { path: "/admin/storage", label: "Storage", group: "Reliability", area: "admin", icon: HardDrive, element: lazyElement("Storage", <AdminDataStoragePage />) },
      moduleRoute({ path: "/admin/integrations", label: "Integrations", group: "Reliability", icon: GitBranch, priority: "Control", rows: ["Supabase", "Google Drive", "GitHub", "Ollama"] }),
      moduleRoute({ path: "/admin/notifications", label: "Notifications", group: "Reliability", icon: Bell, priority: "Control", rows: ["Announcements", "Digests", "Quiet hours", "Acknowledgements"] }),
      moduleRoute({ path: "/admin/deleted-items", label: "Deleted Items", group: "Reliability", icon: ArchiveRestore, priority: "Control", rows: ["Restore", "Retention", "Purge", "History"] }),
    ],
  },
  {
    label: "Governance",
    routes: [
      moduleRoute({ path: "/admin/roles", label: "Roles & Permissions", group: "Governance", icon: KeyRound, priority: "Foundation", rows: ["Role presets", "Custom roles", "Overrides", "Temporary access"] }),
      { path: "/admin/audit", label: "Audit Log", group: "Governance", area: "admin", icon: Database, element: lazyElement("Audit Log", <AdminAuditPage />) },
      moduleRoute({ path: "/admin/security", label: "Security Center", group: "Governance", icon: Lock, priority: "Reliability", rows: ["Failed logins", "Sessions", "Password resets", "Key rotation"] }),
      moduleRoute({ path: "/admin/flags", label: "Feature Flags", group: "Governance", icon: Flag, priority: "Control", rows: ["Rollouts", "Targets", "Experiments", "State"] }),
      moduleRoute({ path: "/admin/settings", label: "Global Settings", group: "Governance", icon: Settings, priority: "Control", rows: ["Classrooms", "Departments", "Templates", "Visibility"] }),
      moduleRoute({ path: "/admin/copilot", label: "Local Copilot", group: "Governance", icon: Bot, priority: "Advanced", rows: ["Ollama status", "Prompt history", "Local actions", "Project drafts"] }),
      moduleRoute({ path: "/admin/announcements", label: "Announcements", group: "Governance", icon: Megaphone, priority: "Control", rows: ["Broadcasts", "Targets", "Expiry", "Acknowledgement"] }),
    ],
  },
];

export const workspacePrimaryRoutes = workspaceRoutes;
export const flatRoutes: AppRoute[] = [...workspaceRoutes, ...secondaryWorkspaceRoutes, ...adminRouteGroups.flatMap((group) => group.routes)];

export function routeForPath(pathname: string): AppRoute | undefined {
  return flatRoutes.find((route) => route.path === pathname);
}
