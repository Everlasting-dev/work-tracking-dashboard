import { type ShortcutPreference } from "@/stores/uiStore";

export type ShortcutCategory = "Navigation" | "Creation" | "Search" | "Settings" | "Administration";

export interface ShortcutDefinition {
  id: string;
  category: ShortcutCategory;
  action: string;
  description: string;
  defaultKeys: string[];
  editable?: boolean;
}

export const shortcutDefinitions: ShortcutDefinition[] = [
  { id: "command.open", category: "Search", action: "Open command centre", description: "Search commands, pages, projects, tasks, and members.", defaultKeys: ["Mod+K"] },
  { id: "shortcuts.open", category: "Settings", action: "Open shortcut guide", description: "Open Settings > Shortcuts.", defaultKeys: ["Mod+/"] },
  { id: "nav.dashboard", category: "Navigation", action: "Go to dashboard", description: "Open the dashboard.", defaultKeys: ["G D"] },
  { id: "nav.projects", category: "Navigation", action: "Go to projects", description: "Open the projects list.", defaultKeys: ["G P"] },
  { id: "nav.team", category: "Navigation", action: "Go to team", description: "Open Team Flow.", defaultKeys: ["G T"] },
  { id: "nav.rankings", category: "Navigation", action: "Go to rankings", description: "Open the ranking table.", defaultKeys: ["G R"] },
  { id: "nav.settings", category: "Navigation", action: "Go to settings", description: "Open user settings.", defaultKeys: ["G S"] },
  { id: "create.task", category: "Creation", action: "Create task", description: "Start a new task flow.", defaultKeys: ["N T"] },
  { id: "create.project", category: "Creation", action: "Create project", description: "Start a new project flow.", defaultKeys: ["N P"] },
  { id: "create.member", category: "Creation", action: "Create team member", description: "Open admin users.", defaultKeys: ["N M"] },
  { id: "search.focus", category: "Search", action: "Focus global search", description: "Move focus to global search when visible.", defaultKeys: ["/"] },
  { id: "form.save", category: "Creation", action: "Save current form", description: "Submit the focused form when supported.", defaultKeys: ["Mod+S"] },
  { id: "performance.toggle", category: "Settings", action: "Toggle performance mode", description: "Switch between balanced and low-power mode.", defaultKeys: ["Mod+Shift+P"] },
  { id: "sidebar.toggle", category: "Navigation", action: "Toggle sidebar", description: "Collapse or expand the navigation.", defaultKeys: ["Mod+B"] },
];

export function shortcutPreference(definition: ShortcutDefinition, overrides: Record<string, ShortcutPreference>): ShortcutPreference {
  return overrides[definition.id] ?? { keys: definition.defaultKeys, enabled: true };
}

export function shortcutLabel(keys: string[], platform = navigator.platform) {
  const isMac = /Mac|iPhone|iPad/.test(platform);
  return keys
    .map((combo) =>
      combo
        .replace(/Mod/g, isMac ? "Cmd" : "Ctrl")
        .replace(/\+/g, " + ")
        .replace(/\s([A-Z])$/g, " then $1"),
    )
    .join(", ");
}

export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable || Boolean(el.closest("[contenteditable='true']"));
}

export function eventChord(event: KeyboardEvent) {
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push("Mod");
  if (event.shiftKey) parts.push("Shift");
  if (event.altKey) parts.push("Alt");
  parts.push(key === " " ? "Space" : key);
  return parts.join("+");
}

export function shortcutConflicts(overrides: Record<string, ShortcutPreference>) {
  const seen = new Map<string, string>();
  const conflicts = new Set<string>();

  for (const definition of shortcutDefinitions) {
    const preference = shortcutPreference(definition, overrides);
    if (!preference.enabled) continue;
    for (const key of preference.keys.map((item) => item.trim()).filter(Boolean)) {
      const normalized = key.toLowerCase();
      const existing = seen.get(normalized);
      if (existing) {
        conflicts.add(existing);
        conflicts.add(definition.id);
      } else {
        seen.set(normalized, definition.id);
      }
    }
  }

  return conflicts;
}
