import { spotlight } from "@mantine/spotlight";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { eventChord, isTypingTarget, shortcutDefinitions, shortcutPreference } from "@/shortcuts/registry";
import { useUiStore } from "@/stores/uiStore";

interface ShortcutAction {
  id: string;
  run: () => void;
}

const sequenceTimeoutMs = 900;

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const overrides = useUiStore((state) => state.shortcutOverrides);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const performanceMode = useUiStore((state) => state.performanceMode);
  const setPerformanceMode = useUiStore((state) => state.setPerformanceMode);
  const sequence = useRef<{ key: string; at: number } | null>(null);

  const actions = useMemo<ShortcutAction[]>(
    () => [
      { id: "command.open", run: () => spotlight.open() },
      { id: "shortcuts.open", run: () => void navigate({ to: "/settings/shortcuts" as never }) },
      { id: "nav.dashboard", run: () => void navigate({ to: "/dashboard" as never }) },
      { id: "nav.projects", run: () => void navigate({ to: "/projects" as never }) },
      { id: "nav.team", run: () => void navigate({ to: "/team" as never }) },
      { id: "nav.rankings", run: () => void navigate({ to: "/rankings" as never }) },
      { id: "nav.settings", run: () => void navigate({ to: "/settings" as never }) },
      { id: "create.task", run: () => void navigate({ to: "/tasks" as never }) },
      { id: "create.project", run: () => void navigate({ to: "/projects" as never }) },
      { id: "create.member", run: () => void navigate({ to: "/admin/users" as never }) },
      { id: "sidebar.toggle", run: () => toggleSidebar() },
      { id: "performance.toggle", run: () => setPerformanceMode(performanceMode === "low-power" ? "balanced" : "low-power") },
      {
        id: "search.focus",
        run: () => {
          const input = document.querySelector<HTMLInputElement>("[data-global-search]");
          input?.focus();
        },
      },
      {
        id: "form.save",
        run: () => {
          const form = document.activeElement?.closest("form") as HTMLFormElement | null;
          form?.requestSubmit();
        },
      },
    ],
    [navigate, performanceMode, setPerformanceMode, toggleSidebar],
  );

  useEffect(() => {
    const actionMap = new Map(actions.map((action) => [action.id, action.run]));

    const onKeyDown = (event: KeyboardEvent) => {
      const chord = eventChord(event);
      const typing = isTypingTarget(event.target);
      const now = Date.now();

      for (const definition of shortcutDefinitions) {
        const preference = shortcutPreference(definition, overrides);
        if (!preference.enabled) continue;

        for (const keys of preference.keys) {
          const normalized = keys.trim();
          const isSequence = /^[a-z0-9] [a-z0-9]$/i.test(normalized);
          if (isSequence) {
            if (typing) continue;
            const [first, second] = normalized.toUpperCase().split(" ");
            if (sequence.current && now - sequence.current.at > sequenceTimeoutMs) sequence.current = null;
            if (!sequence.current && chord === first) {
              sequence.current = { key: first, at: now };
              event.preventDefault();
              return;
            }
            if (sequence.current?.key === first && chord === second) {
              sequence.current = null;
              event.preventDefault();
              actionMap.get(definition.id)?.();
              return;
            }
          } else if (chord.toLowerCase() === normalized.toLowerCase()) {
            if (typing && !["command.open", "shortcuts.open", "form.save"].includes(definition.id)) continue;
            event.preventDefault();
            actionMap.get(definition.id)?.();
            return;
          }
        }
      }

      if (!/^[a-z0-9]$/i.test(event.key)) sequence.current = null;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions, overrides]);
}
