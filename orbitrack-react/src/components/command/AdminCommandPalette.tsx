import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { CheckSquare, FileText, FolderKanban, FolderPlus, Paperclip, RefreshCcw, Search, UserRound, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flatRoutes } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { searchLocalIndex, type LocalSearchResult } from "@/lib/localSearch";
import { queryKeys } from "@/lib/queryKeys";
import { workspaceRepository } from "@/lib/repositories/workspaceRepository";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { toast } from "sonner";

interface ExecutiveCommand {
  id: string;
  label: string;
  section: string;
  detail: string;
  keywords: string[];
  icon: LucideIcon;
  area: "workspace" | "admin" | "action" | "record";
  run: () => void;
}

const RECORD_ICON: Record<LocalSearchResult["kind"], LucideIcon> = {
  project: FolderKanban,
  task: CheckSquare,
  user: UserRound,
  file: Paperclip,
  document: FileText,
  canvas: FileText,
};

function recordRoute(result: LocalSearchResult, canOpenAdmin: boolean) {
  if (result.kind === "file") return "/workspace/files";
  if (result.kind === "user") return canOpenAdmin ? "/admin/users" : "/workspace/team";
  return "/workspace/projects";
}

function compactLabel(text: string) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length > 72 ? `${trimmed.slice(0, 72)}...` : trimmed;
}

export function AdminCommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<LocalSearchResult[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useExecutiveSession();
  const canOpenAdmin = hasPermission("admin:read");

  useEffect(() => {
    if (!open) {
      setLocalResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchLocalIndex(query).then(setLocalResults).catch(() => setLocalResults([]));
    }, 120);
    return () => window.clearTimeout(timer);
  }, [open, query]);

  const commands = useMemo<ExecutiveCommand[]>(() => {
    const routes = flatRoutes
      .filter((route) => route.area !== "admin" || canOpenAdmin)
      .map<ExecutiveCommand>((route) => ({
        id: route.path,
        label: route.label,
        section: route.area === "admin" ? "Admin" : route.group,
        detail: route.area === "admin" ? route.group : "Open workspace",
        keywords: [route.label, route.group, route.area, route.path],
        icon: route.icon,
        area: route.area,
        run: () => navigate(route.path),
      }));

    const actions: ExecutiveCommand[] = [
      {
        id: "action:new-project",
        label: "New Project",
        section: "Actions",
        detail: "Open the project creator",
        keywords: ["create", "project", "workbench"],
        icon: FolderPlus,
        area: "action",
        run: () => {
          navigate("/workspace/projects");
          window.setTimeout(() => window.dispatchEvent(new CustomEvent("executive:new-project")), 60);
        },
      },
      {
        id: "action:refresh",
        label: "Refresh Workspace Data",
        section: "Actions",
        detail: "Invalidate local query cache",
        keywords: ["sync", "refresh", "live", "reload"],
        icon: RefreshCcw,
        area: "action",
        run: () => {
          void workspaceRepository.refreshProjects().then(() => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview, refetchType: "active" });
            void queryClient.invalidateQueries({ queryKey: queryKeys.adminWorkload, refetchType: "active" });
          });
          toast.message("Workspace refresh queued");
        },
      },
    ];

    return [...actions, ...routes];
  }, [canOpenAdmin, navigate, queryClient]);

  const recordCommands = useMemo<ExecutiveCommand[]>(
    () =>
      localResults.map((result) => {
        const Icon = RECORD_ICON[result.kind];
        const label = compactLabel(result.text) || `${result.kind} ${result.entityId}`;
        return {
          id: `record:${result.id}`,
          label,
          section: "Cached Records",
          detail: `${result.kind} / local index`,
          keywords: [result.kind, result.entityId, result.text],
          icon: Icon,
          area: "record",
          run: () => navigate(recordRoute(result, canOpenAdmin)),
        };
      }),
    [canOpenAdmin, localResults, navigate],
  );

  const visibleCommands = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands.slice(0, 18);
    const fuse = new Fuse(commands, {
      keys: ["label", "section", "detail", "keywords"],
      threshold: 0.38,
      ignoreLocation: true,
    });
    return fuse.search(needle).map((result) => result.item).slice(0, 18);
  }, [commands, query]);

  const allVisibleCommands = useMemo(() => [...recordCommands, ...visibleCommands], [recordCommands, visibleCommands]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, ExecutiveCommand[]>();
    for (const command of allVisibleCommands) {
      const current = groups.get(command.section) ?? [];
      current.push(command);
      groups.set(command.section, current);
    }
    return [...groups.entries()];
  }, [allVisibleCommands]);

  const run = (command: ExecutiveCommand) => {
    command.run();
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[680px] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-[var(--radius-lg)] border border-border/90 bg-bg shadow-2xl outline-none overflow-hidden">
          <Command shouldFilter={false} className="bg-surface/95">
            <div className="h-14 px-4 border-b border-border/70 flex items-center gap-3">
              <Search size={16} className="text-text-muted" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search pages, files, tasks, actions..."
                className="h-full flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-text-muted"
                autoFocus
              />
              <span className="hidden sm:inline text-[11px] text-text-muted border border-border rounded-[var(--radius-sm)] px-1.5 py-0.5">Esc</span>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" title="Close">
                  <X size={15} />
                </Button>
              </Dialog.Close>
            </div>
            <Command.List className="max-h-[460px] overflow-auto p-2.5">
              {groupedCommands.map(([section, items]) => (
                <Command.Group
                  key={section}
                  heading={<div className="px-2 py-1.5 text-[11px] uppercase tracking-[0.18em] text-text-muted">{section}</div>}
                  className="pb-2"
                >
                  {items.map((command) => {
                    const Icon = command.icon;
                    return (
                      <Command.Item
                        key={command.id}
                        value={`${command.label} ${command.detail} ${command.keywords.join(" ")}`}
                        onSelect={() => run(command)}
                        className="h-11 px-2.5 flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] text-left text-text-secondary outline-none data-[selected=true]:bg-hover data-[selected=true]:text-text"
                      >
                        <Icon size={16} className="shrink-0 text-text-muted" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{command.label}</span>
                          <span className="block truncate text-[12px] text-text-muted">{command.detail}</span>
                        </span>
                        <StatusDot tone={command.area === "admin" ? "info" : command.area === "action" ? "ok" : "neutral"} />
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              ))}
              {!allVisibleCommands.length && <div className="h-28 grid place-items-center text-text-muted">No command found</div>}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
