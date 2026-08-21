import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { adminRouteGroups, secondaryWorkspaceRoutes, workspacePrimaryRoutes, type AppRoute } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { cn } from "@/lib/utils";

function RouteRow({ route, collapsed }: { route: AppRoute; collapsed: boolean }) {
  const Icon = route.icon;
  return (
    <NavLink
      to={route.path}
      title={route.label}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 h-9 px-2.5 rounded-[var(--radius-sm)] text-[13px] text-text-secondary transition-colors hover:bg-hover/80 hover:text-text",
          isActive && "bg-hover text-text shadow-[inset_0_1px_0_rgba(244,244,240,0.04)]",
          collapsed && "justify-center px-0",
        )
      }
    >
      <Icon size={15} strokeWidth={1.75} className="shrink-0 text-text-muted group-hover:text-text-secondary" />
      {!collapsed && <span className="truncate">{route.label}</span>}
    </NavLink>
  );
}

function RouteSection({ label, routes, collapsed }: { label: string; routes: AppRoute[]; collapsed: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {!collapsed && <div className="mb-1 px-2.5 text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</div>}
      {routes.map((route) => (
        <RouteRow key={route.path} route={route} collapsed={collapsed} />
      ))}
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem("executive.black.sidebar.collapsed") === "1");
  const { hasPermission } = useExecutiveSession();
  const showAdmin = hasPermission("admin:read");

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("executive.black.sidebar.collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <aside
      style={{ width: collapsed ? 64 : 268 }}
      className="shrink-0 border-r border-border/70 bg-surface/70 backdrop-blur flex flex-col transition-[width] duration-200"
    >
      <div className="h-16 flex items-center gap-3 px-3.5 border-b border-border/60">
        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent text-bg grid place-items-center text-[12px] font-bold shrink-0 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">E</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold truncate text-[14px]">Executive Black</div>
            <div className="text-[11px] text-text-muted truncate">Orbitrack workstation</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2.5 flex flex-col gap-5 overflow-y-auto">
        <RouteSection label="Work" routes={workspacePrimaryRoutes} collapsed={collapsed} />
        <RouteSection label="Library" routes={secondaryWorkspaceRoutes} collapsed={collapsed} />

        {showAdmin && (
          <div className="pt-3 border-t border-border/70 flex flex-col gap-5">
            {!collapsed && <div className="px-2.5 text-[11px] uppercase tracking-[0.18em] text-text-muted">Admin</div>}
            {adminRouteGroups.map((group) => (
              <RouteSection key={group.label} label={group.label} routes={group.routes} collapsed={collapsed} />
            ))}
          </div>
        )}
      </nav>

      <div className="h-12 border-t border-border/60 grid place-items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
        </Button>
      </div>
    </aside>
  );
}
