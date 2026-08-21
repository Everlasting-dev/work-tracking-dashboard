export interface SettingsSection {
  slug: string;
  title: string;
  description: string;
  items: string[];
}

export const settingsSections: SettingsSection[] = [
  {
    slug: "general",
    title: "General",
    description: "Language, date, timezone, workspace defaults, and start-of-week preferences.",
    items: ["Language", "Time zone", "Date format", "Default landing page", "Default workspace", "Start of week"],
  },
  {
    slug: "appearance",
    title: "Appearance",
    description: "Theme, density, type scale, sidebar style, reduced motion, and contrast controls.",
    items: ["Theme", "Accent color", "Density", "Font size", "Border radius", "Compact cards", "High contrast"],
  },
  {
    slug: "navigation",
    title: "Navigation",
    description: "Pinned pages, recent pages, sidebar mode, and project view defaults.",
    items: ["Sidebar mode", "Pinned pages", "Recent pages", "Default project view", "Open detail panels"],
  },
  {
    slug: "shortcuts",
    title: "Shortcuts",
    description: "Keyboard shortcuts, conflicts, export/import, and layout-friendly labels.",
    items: ["Shortcut list", "Customization", "Conflict detection", "Reset options", "Import/export"],
  },
  {
    slug: "notifications",
    title: "Notifications",
    description: "In-app alerts, mentions, assignments, deadlines, rankings, and team changes.",
    items: ["In-app", "Task assignments", "Mentions", "Deadline alerts", "Ranking updates", "Team changes"],
  },
  {
    slug: "performance",
    title: "Performance",
    description: "Full, balanced, and low-power behavior for animations, blur, realtime, and preloading.",
    items: ["Mode", "Animation toggle", "Background refresh", "Realtime presence", "Blur effects", "Data preloading"],
  },
  {
    slug: "account",
    title: "Account",
    description: "Profile, avatar, password, session management, and personal preferences.",
    items: ["Profile", "Avatar", "Password", "Sessions", "Personal preferences"],
  },
];
