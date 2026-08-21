import { lazy, Suspense, useEffect, type ReactNode } from "react";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  Kbd,
  Menu,
  NavLink,
  ScrollArea,
  Select,
  Skeleton,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, Plus, Search, Settings, UserRound, Wifi } from "lucide-react";
import { CommandCenter } from "@/navigation/CommandCenter";
import { adminNavItems, mainNavItems, navItemForPath } from "@/navigation/navItems";
import { useGlobalShortcuts } from "@/shortcuts/useGlobalShortcuts";
import { useUiStore } from "@/stores/uiStore";
import { useLiveSync, type LiveSyncStatus } from "@/lib/liveSync";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { timeAgo } from "@/lib/utils";

const LoginPage = lazy(() => import("@/pages/LoginPage").then((module) => ({ default: module.LoginPage })));

function ShellLoading({ label }: { label: string }) {
  return (
    <Box h="100%" display="grid" style={{ placeItems: "center" }}>
      <Box w={260}>
        <Skeleton height={42} radius="sm" mb="sm" />
        <Text c="dimmed" ta="center" size="sm">{label}</Text>
      </Box>
    </Box>
  );
}

function liveTone(status: LiveSyncStatus) {
  if (status === "live") return "green";
  if (status === "connecting") return "blue";
  if (status === "offline") return "yellow";
  if (status === "error") return "red";
  return "gray";
}

function pageLabel(path: string) {
  return navItemForPath(path)?.label ?? "Orbitrack";
}

function NavRows({ collapsed, closeMobile }: { collapsed: boolean; closeMobile: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { hasPermission } = useExecutiveSession();
  const pinnedPages = useUiStore((state) => state.pinnedPages);
  const recentPages = useUiStore((state) => state.recentPages);
  const routePreloading = useUiStore((state) => state.routePreloading);
  const showAdmin = hasPermission("admin:read");
  const nav = showAdmin ? [...mainNavItems, ...adminNavItems] : mainNavItems;
  const pinned = nav.filter((item) => pinnedPages.includes(item.to));
  const recent = recentPages
    .map((path) => nav.find((item) => item.to === path))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item, index, rows) => rows.findIndex((row) => row.to === item.to) === index)
    .slice(0, 5);

  const renderItem = (item: (typeof nav)[number]) => {
    const Icon = item.icon;
    const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(`${item.to}/`));
    return (
      <Tooltip key={item.to} label={item.label} disabled={!collapsed} position="right">
        <NavLink
          component={Link}
          to={item.to}
          preload={routePreloading ? "intent" : false}
          active={active}
          label={collapsed ? undefined : item.label}
          leftSection={<Icon size={17} strokeWidth={1.8} />}
          onClick={closeMobile}
          className="orbit-nav-row"
        />
      </Tooltip>
    );
  };

  return (
    <StackLike>
      {pinned.length > 0 && (
        <NavSection label="Pinned" collapsed={collapsed}>
          {pinned.map(renderItem)}
        </NavSection>
      )}
      <NavSection label="Workspace" collapsed={collapsed}>
        {mainNavItems.map(renderItem)}
      </NavSection>
      {recent.length > 0 && (
        <NavSection label="Recent" collapsed={collapsed}>
          {recent.map(renderItem)}
        </NavSection>
      )}
      {showAdmin && (
        <NavSection label="Administration" collapsed={collapsed}>
          {adminNavItems.map(renderItem)}
        </NavSection>
      )}
    </StackLike>
  );
}

function StackLike({ children }: { children: ReactNode }) {
  return <Box style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</Box>;
}

function NavSection({ label, collapsed, children }: { label: string; collapsed: boolean; children: ReactNode }) {
  return (
    <Box>
      {!collapsed && (
        <Text size="10px" fw={800} tt="uppercase" c="dimmed" mb={6} px={8} style={{ letterSpacing: 1.4 }}>
          {label}
        </Text>
      )}
      <Box style={{ display: "flex", flexDirection: "column", gap: 3 }}>{children}</Box>
    </Box>
  );
}

function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const session = useExecutiveSession();
  const live = useLiveSync();
  const performanceMode = useUiStore((state) => state.performanceMode);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const mobileOpen = useUiStore((state) => state.mobileNavigationOpen);
  const setMobileOpen = useUiStore((state) => state.setMobileNavigationOpen);

  return (
    <Group h="100%" px="md" gap="sm" wrap="nowrap">
      <Burger opened={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} hiddenFrom="md" size="sm" aria-label="Toggle navigation" />
      <Tooltip label={collapsed ? "Expand navigation" : "Collapse navigation"}>
        <ActionIcon visibleFrom="md" variant="subtle" color="gray" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle navigation">
          <ChevronRight size={17} style={{ transform: collapsed ? "none" : "rotate(180deg)" }} />
        </ActionIcon>
      </Tooltip>
      <Box miw={0}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" c="dimmed" truncate>Orbitrack</Text>
          <ChevronRight size={13} color="var(--mantine-color-dimmed)" />
          <Text size="sm" fw={650} truncate>{pageLabel(pathname)}</Text>
        </Group>
      </Box>
      <Box flex={1} />
      <Select
        visibleFrom="sm"
        aria-label="Workspace"
        data={["Main workspace"]}
        value="Main workspace"
        size="xs"
        w={160}
        allowDeselect={false}
      />
      <Button size="xs" leftSection={<Plus size={14} />} onClick={() => void navigate({ to: "/projects" as never })}>
        Quick create
      </Button>
      <Button
        visibleFrom="sm"
        variant="default"
        size="xs"
        leftSection={<Search size={14} />}
        rightSection={<Kbd size="xs">Ctrl K</Kbd>}
        onClick={() => spotlight.open()}
      >
        Command
      </Button>
      <Tooltip label={`Sync ${live.status}${live.lastEventAt ? ` · ${timeAgo(live.lastEventAt)}` : ""}`}>
        <Badge variant="light" color={liveTone(live.status)} leftSection={<Wifi size={12} />}>
          {performanceMode === "low-power" ? "Quiet" : live.status}
        </Badge>
      </Tooltip>
      <ActionIcon variant="subtle" aria-label="Notifications" onClick={() => void navigate({ to: "/settings/notifications" as never })}>
        <Bell size={17} />
      </ActionIcon>
      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <UnstyledButton aria-label="User menu">
            <Group gap={8} wrap="nowrap">
              <Avatar size={28} radius="sm" color="gray">{session.session?.displayName?.charAt(0) ?? "O"}</Avatar>
              <Text visibleFrom="lg" size="sm" maw={160} truncate>{session.session?.displayName ?? "User"}</Text>
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{session.session?.role ?? "Session"}</Menu.Label>
          <Menu.Item leftSection={<UserRound size={14} />} onClick={() => void navigate({ to: "/settings/account" as never })}>Account</Menu.Item>
          <Menu.Item leftSection={<Settings size={14} />} onClick={() => void navigate({ to: "/settings" as never })}>Settings</Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={() => void session.logout()}>Sign out</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

export function OrbitrackShell() {
  const { session, loading } = useExecutiveSession();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const mobileOpen = useUiStore((state) => state.mobileNavigationOpen);
  const setMobileOpen = useUiStore((state) => state.setMobileNavigationOpen);
  const rememberPage = useUiStore((state) => state.rememberPage);
  const reducedMotion = useUiStore((state) => state.reducedMotion);
  const performanceMode = useUiStore((state) => state.performanceMode);
  const blurEffects = useUiStore((state) => state.blurEffects);

  useGlobalShortcuts();

  useEffect(() => {
    rememberPage(pathname);
  }, [pathname, rememberPage]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.performanceMode = performanceMode;
    root.dataset.reducedMotion = reducedMotion ? "true" : "false";
    root.dataset.blurEffects = blurEffects ? "true" : "false";
  }, [blurEffects, performanceMode, reducedMotion]);

  if (loading) return <ShellLoading label="Opening Orbitrack" />;

  if (!session) {
    return (
      <Suspense fallback={<ShellLoading label="Opening sign in" />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <>
      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 76 : 270,
          breakpoint: "md",
          collapsed: { mobile: !mobileOpen },
        }}
        padding={0}
        className="orbit-shell"
      >
        <AppShell.Header className="orbit-header">
          <Header />
        </AppShell.Header>
        <AppShell.Navbar className="orbit-navbar">
          <Box p="sm" h="100%" style={{ display: "flex", flexDirection: "column" }}>
            <Group h={44} gap="sm" wrap="nowrap" px={4}>
              <Avatar radius="sm" color="green" size={32}>O</Avatar>
              {!collapsed && (
                <Box miw={0}>
                  <Title order={2} size="sm">Orbitrack</Title>
                  <Text size="xs" c="dimmed" truncate>Work tracking, calmer</Text>
                </Box>
              )}
            </Group>
            <Divider my="sm" />
            <ScrollArea flex={1} offsetScrollbars>
              <NavRows collapsed={collapsed} closeMobile={() => setMobileOpen(false)} />
            </ScrollArea>
          </Box>
        </AppShell.Navbar>
        <AppShell.Main className="orbit-main">
          <Suspense fallback={<ShellLoading label="Loading page" />}>
            <Outlet />
          </Suspense>
        </AppShell.Main>
      </AppShell>
      <CommandCenter />
    </>
  );
}
