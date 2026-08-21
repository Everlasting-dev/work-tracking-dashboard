import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  FileText,
  FolderKanban,
  Gauge,
  Home,
  KeyRound,
  Megaphone,
  Paperclip,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  group: "Workspace" | "Planning" | "Team" | "Library" | "System" | "Administration";
  icon: LucideIcon;
  adminOnly?: boolean;
  keywords?: string[];
}

export const mainNavItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", group: "Workspace", icon: Home, keywords: ["home", "overview"] },
  { to: "/projects", label: "Projects", group: "Workspace", icon: FolderKanban, keywords: ["portfolio", "work"] },
  { to: "/tasks", label: "Tasks", group: "Workspace", icon: CheckSquare, keywords: ["todo", "kanban"] },
  { to: "/calendar", label: "Calendar", group: "Workspace", icon: CalendarDays, keywords: ["agenda", "deadlines", "schedule"] },
  { to: "/files", label: "Files", group: "Library", icon: Paperclip, keywords: ["attachments", "drive"] },
  { to: "/team", label: "Team", group: "Team", icon: Users, keywords: ["members", "flow"] },
  { to: "/reports", label: "Reports", group: "Library", icon: FileText, keywords: ["analytics", "exports"] },
  { to: "/settings", label: "Settings", group: "System", icon: Settings, keywords: ["preferences", "shortcuts"] },
];

export const settingsNavItems: NavItem[] = [
  { to: "/settings/appearance", label: "Appearance", group: "System", icon: SlidersHorizontal },
  { to: "/settings/navigation", label: "Navigation", group: "System", icon: Search },
  { to: "/settings/shortcuts", label: "Shortcuts", group: "System", icon: KeyRound },
  { to: "/settings/notifications", label: "Notifications", group: "System", icon: Bell },
  { to: "/settings/performance", label: "Performance", group: "System", icon: Gauge },
  { to: "/settings/account", label: "Account", group: "System", icon: Users },
];

export const adminNavItems: NavItem[] = [
  { to: "/admin", label: "Admin Overview", group: "Administration", icon: ShieldCheck, adminOnly: true },
  { to: "/admin/users", label: "Users", group: "Administration", icon: Users, adminOnly: true },
  { to: "/admin/teams", label: "Teams", group: "Administration", icon: Users, adminOnly: true },
  { to: "/admin/roles", label: "Roles", group: "Administration", icon: KeyRound, adminOnly: true },
  { to: "/admin/permissions", label: "Permissions", group: "Administration", icon: ShieldCheck, adminOnly: true },
  { to: "/admin/ranking-rules", label: "Ranking Rules", group: "Administration", icon: BarChart3, adminOnly: true },
  { to: "/admin/audit-log", label: "Audit Log", group: "Administration", icon: Activity, adminOnly: true },
  { to: "/admin/announcements", label: "Announcements", group: "Administration", icon: Megaphone, adminOnly: true },
];

export const allNavItems = [...mainNavItems, ...settingsNavItems, ...adminNavItems];

export function navItemForPath(path: string) {
  return allNavItems.find((item) => item.to === path) ?? mainNavItems.find((item) => path.startsWith(item.to) && item.to !== "/");
}
