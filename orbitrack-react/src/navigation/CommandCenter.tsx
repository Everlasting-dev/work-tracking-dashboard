import { Badge, Kbd } from "@mantine/core";
import { Spotlight, spotlight, type SpotlightActionData } from "@mantine/spotlight";
import { useNavigate } from "@tanstack/react-router";
import { FolderPlus, Gauge, PanelLeft, Plus, Search, Settings, UserPlus } from "lucide-react";
import { useCallback, useMemo, type ReactNode } from "react";
import { allNavItems, navItemForPath } from "@/navigation/navItems";
import { useWorkspaceData } from "@/query/workspaceHooks";
import { shortcutDefinitions, shortcutLabel, shortcutPreference } from "@/shortcuts/registry";
import { useUiStore } from "@/stores/uiStore";
import { useExecutiveSession } from "@/lib/useExecutiveSession";

function hint(id: string, overrides: ReturnType<typeof useUiStore.getState>["shortcutOverrides"]) {
  const definition = shortcutDefinitions.find((item) => item.id === id);
  if (!definition) return null;
  const preference = shortcutPreference(definition, overrides);
  return <Kbd size="xs">{shortcutLabel(preference.keys)}</Kbd>;
}

function navAction(to: string, label: string, group: string, icon: ReactNode, run: () => void, description?: string, rightSection?: ReactNode): SpotlightActionData {
  return {
    id: `nav:${to}`,
    label,
    description,
    group,
    leftSection: icon,
    rightSection,
    onClick: run,
  };
}

export function CommandCenter() {
  const navigate = useNavigate();
  const { data } = useWorkspaceData();
  const { hasPermission } = useExecutiveSession();
  const recentPages = useUiStore((state) => state.recentPages);
  const performanceMode = useUiStore((state) => state.performanceMode);
  const setPerformanceMode = useUiStore((state) => state.setPerformanceMode);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const overrides = useUiStore((state) => state.shortcutOverrides);
  const showAdmin = hasPermission("admin:read");

  const go = useCallback((to: string) => {
    spotlight.close();
    void navigate({ to: to as never });
  }, [navigate]);

  const actions = useMemo<SpotlightActionData[]>(() => {
    const nav = allNavItems
      .filter((item) => !item.adminOnly || showAdmin)
      .map((item) =>
        navAction(
          item.to,
          item.label,
          item.group,
          <item.icon size={16} />,
          () => go(item.to),
          item.keywords?.join(", "),
          item.to === "/settings" ? hint("nav.settings", overrides) : undefined,
        ),
      );

    const projectActions = (data?.projects ?? []).slice(0, 12).map((project) =>
      navAction(
        `/projects/${project.id}`,
        project.name,
        "Search",
        <Search size={16} />,
        () => go(`/projects/${project.id}`),
        `${project.ownerName} · ${project.progress}% · ${project.taskCount} tasks`,
      ),
    );

    const taskActions = (data?.projects ?? []).flatMap((project) =>
      project.tasks.slice(0, 3).map((task) =>
        navAction(
          `/tasks/${task.id}`,
          task.title,
          "Search",
          <Search size={16} />,
          () => go(`/tasks/${task.id}`),
          `${project.name} · ${task.status}`,
        ),
      ),
    ).slice(0, 12);

    const memberActions = (data?.users ?? []).slice(0, 12).map((member) =>
      navAction(
        `/team/${member.id}`,
        member.displayName,
        "Team",
        <Search size={16} />,
        () => go(`/team/${member.id}`),
        [member.role, member.department].filter(Boolean).join(" · "),
      ),
    );

    const recent = recentPages
      .map((path) => navItemForPath(path))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => {
        const Icon = item.icon;
        return navAction(item.to, item.label, "Recent", <Icon size={16} />, () => go(item.to));
      });

    return [
      ...nav,
      {
        id: "create:task",
        label: "Create task",
        description: "Open the task creation flow.",
        group: "Creation",
        leftSection: <Plus size={16} />,
        rightSection: hint("create.task", overrides),
        onClick: () => go("/tasks"),
      },
      {
        id: "create:project",
        label: "Create project",
        description: "Open the project creation flow.",
        group: "Creation",
        leftSection: <FolderPlus size={16} />,
        rightSection: hint("create.project", overrides),
        onClick: () => go("/projects"),
      },
      {
        id: "create:member",
        label: "Create team member",
        description: "Open admin users.",
        group: "Creation",
        leftSection: <UserPlus size={16} />,
        rightSection: hint("create.member", overrides),
        onClick: () => go("/admin/users"),
      },
      {
        id: "settings:shortcuts",
        label: "Open shortcut guide",
        description: "View and customize keyboard shortcuts.",
        group: "Settings",
        leftSection: <Settings size={16} />,
        rightSection: hint("shortcuts.open", overrides),
        onClick: () => go("/settings/shortcuts"),
      },
      {
        id: "ui:sidebar",
        label: "Toggle sidebar",
        description: "Collapse or expand the left navigation.",
        group: "Settings",
        leftSection: <PanelLeft size={16} />,
        rightSection: hint("sidebar.toggle", overrides),
        onClick: () => {
          toggleSidebar();
          spotlight.close();
        },
      },
      {
        id: "ui:performance",
        label: "Toggle low-power mode",
        description: `Current mode: ${performanceMode}`,
        group: "Settings",
        leftSection: <Gauge size={16} />,
        rightSection: <Badge size="xs" variant="light">{performanceMode}</Badge>,
        onClick: () => {
          setPerformanceMode(performanceMode === "low-power" ? "balanced" : "low-power");
          spotlight.close();
        },
      },
      ...projectActions,
      ...taskActions,
      ...memberActions,
      ...recent,
    ];
  }, [data?.projects, data?.users, go, overrides, performanceMode, recentPages, setPerformanceMode, showAdmin, toggleSidebar]);

  return (
    <Spotlight
      actions={actions}
      highlightQuery
      limit={12}
      nothingFound="No command found"
      searchProps={{ placeholder: "Search pages, projects, tasks, members, and actions", leftSection: <Search size={16} /> }}
    />
  );
}
