import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
} from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  FileText,
  FolderKanban,
  KeyRound,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  AdminAuditPage,
  AdminFilesPage,
  AdminOverviewPage,
  AdminUsersPage,
  ProjectsPage,
  TasksPage,
  WorkspaceHomePage,
} from "@/app/lazyPages";
import { LazyRouteBoundary } from "@/app/RouteBoundary";
import { GenericSettingsPage, PerformanceSettingsPage, SettingsHomePage, ShortcutsSettingsPage } from "@/features/settings/SettingsPages";
import { RankingsPage } from "@/features/rankings/RankingsPage";
import { TeamFlowPage } from "@/features/team/TeamFlowPage";
import { TeamManagementPage } from "@/features/team/TeamManagementPage";
import { WorkloadPage } from "@/features/workload/WorkloadPage";
import { OrbitrackShell } from "@/shell/OrbitrackShell";
import { FoundationPage } from "@/pages/FoundationPage";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";

function lazyPage(label: string, element: ReactNode) {
  return () => <LazyRouteBoundary label={label}>{element}</LazyRouteBoundary>;
}

function redirect(to: string) {
  return () => <Navigate to={to as never} replace />;
}

const rootRoute = createRootRoute({
  component: OrbitrackShell,
  notFoundComponent: () => (
    <FoundationPage
      title="Page not found"
      description="This route is not mapped in the new Orbitrack router."
      icon={Settings}
      status="Missing route"
      items={["Use the command centre to jump to a mapped page.", "Legacy routes are redirected where safe.", "Deep link coverage will expand as pages migrate."]}
    />
  ),
});

function route(path: string, label: string, element: ReactNode) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: lazyPage(label, element),
  });
}

function simple(title: string, description: string, icon: LucideIcon, items: string[]) {
  return <FoundationPage title={title} description={description} icon={icon} items={items} />;
}

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: redirect("/dashboard") });

const routes = [
  indexRoute,
  route("/dashboard", "Dashboard", <WorkspaceHomePage />),
  route("/projects", "Projects", <ProjectsPage />),
  route("/projects/$projectId", "Project detail", simple("Project Detail", "Project deep links are mapped first; task/team tabs migrate after the foundation stabilizes.", FolderKanban, ["Preserve selected project in the URL.", "Move project tabs into nested routes.", "Keep existing creation/editing behavior while migrating."])),
  route("/projects/$projectId/tasks", "Project tasks", simple("Project Tasks", "Nested project task routing is reserved for the staged task-page migration.", CheckSquare, ["Preserve filters in URL search.", "Reuse shared task query hooks.", "Avoid refetching when switching project tabs."])),
  route("/projects/$projectId/team", "Project team", simple("Project Team", "Project-specific team membership will use the new team model once the schema migration is approved.", Users, ["Show project members.", "Support explicit add/remove actions.", "Respect project permissions and RLS."])),
  route("/tasks", "Tasks", <TasksPage />),
  route("/tasks/$taskId", "Task detail", simple("Task Detail", "Task detail drawers are planned as route-addressable side panels.", CheckSquare, ["Open from command centre.", "Retain list filters behind the drawer.", "Support direct task links."])),
  route("/calendar", "Calendar", simple("Calendar", "Calendar gives the workspace a reliable agenda surface for due tasks, project deadlines, and team events.", CalendarDays, ["Month and agenda views.", "Due tasks from visible projects.", "Project milestones and report dates.", "Permission-aware event loading."])),
  route("/team", "Team", <TeamFlowPage />),
  route("/team/$memberId", "Member detail", simple("Member Detail", "Member details will open as a lightweight drawer from Team Flow, with a full profile route for deeper inspection.", Users, ["Current workload.", "Recent completed tasks.", "Ranking summary.", "Skills and collaboration actions."])),
  route("/workload", "Workload", <WorkloadPage />),
  route("/rankings", "Rankings", <RankingsPage />),
  route("/reports", "Reports", simple("Reports", "Reports stay staged while the data-query layer settles.", FileText, ["Monthly reports.", "Project health.", "Saved views.", "Exports."])),
  route("/activity", "Activity", <AdminAuditPage />),
  route("/files", "Files", <AdminFilesPage />),
  route("/settings", "Settings", <SettingsHomePage />),
  route("/settings/appearance", "Appearance", <GenericSettingsPage slug="appearance" />),
  route("/settings/navigation", "Navigation", <GenericSettingsPage slug="navigation" />),
  route("/settings/shortcuts", "Shortcuts", <ShortcutsSettingsPage />),
  route("/settings/notifications", "Notifications", <GenericSettingsPage slug="notifications" />),
  route("/settings/performance", "Performance", <PerformanceSettingsPage />),
  route("/settings/account", "Account", <GenericSettingsPage slug="account" />),
  route("/onboarding", "Onboarding", <OnboardingPage />),
  route("/admin", "Admin", <AdminOverviewPage />),
  route("/admin/users", "Users", <AdminUsersPage />),
  route("/admin/teams", "Teams", <TeamManagementPage />),
  route("/admin/roles", "Roles", simple("Roles", "Role management will move from hidden button checks to explicit role and permission records.", KeyRound, ["Owner", "Administrator", "Manager", "Team Lead", "Member", "Viewer"])),
  route("/admin/permissions", "Permissions", simple("Permissions", "Permission management requires RLS-backed records before write controls are enabled.", ShieldCheck, ["Project access", "Team management", "Ranking visibility", "Admin tools"])),
  route("/admin/ranking-rules", "Ranking Rules", <RankingsPage />),
  route("/admin/audit-log", "Audit Log", <AdminAuditPage />),
  route("/admin/announcements", "Announcements", simple("Announcements", "Announcement controls are mapped into admin routing and will reuse the realtime broadcast channel only when needed.", Bell, ["Target users", "Target groups", "Expiry", "Acknowledgement"])),
  route("/admin/overview", "Admin overview redirect", <Navigate to={"/admin" as never} replace />),
  route("/workspace", "Workspace redirect", <Navigate to={"/dashboard" as never} replace />),
  route("/workspace/projects", "Projects redirect", <Navigate to={"/projects" as never} replace />),
  route("/workspace/tasks", "Tasks redirect", <Navigate to={"/tasks" as never} replace />),
  route("/workspace/calendar", "Calendar redirect", <Navigate to={"/calendar" as never} replace />),
  route("/workspace/team", "Team redirect", <Navigate to={"/team" as never} replace />),
  route("/workspace/files", "Files redirect", <Navigate to={"/files" as never} replace />),
];

const routeTree = rootRoute.addChildren(routes);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: "intent",
  defaultPreloadStaleTime: 60_000,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
