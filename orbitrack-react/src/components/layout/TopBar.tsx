import { LogOut, Search, Shield, UserRound, Wifi } from "lucide-react";
import { useLocation } from "react-router-dom";
import { routeForPath } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { useLiveSync, type LiveSyncStatus } from "@/lib/liveSync";
import { useExecutiveSession } from "@/lib/useExecutiveSession";
import { timeAgo } from "@/lib/utils";

function liveTone(status: LiveSyncStatus): "ok" | "warn" | "danger" | "info" | "neutral" {
  if (status === "live") return "ok";
  if (status === "connecting") return "info";
  if (status === "offline") return "warn";
  if (status === "error") return "danger";
  return "neutral";
}

function liveLabel(status: LiveSyncStatus) {
  if (status === "live") return "Live";
  if (status === "connecting") return "Syncing";
  if (status === "offline") return "Offline";
  if (status === "error") return "Sync error";
  return "Idle";
}

export function TopBar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const location = useLocation();
  const route = routeForPath(location.pathname);
  const { session, loading, logout } = useExecutiveSession();
  const live = useLiveSync();
  const roleLabel = session?.role.replace(/_/g, " ") ?? "No session";

  return (
    <header className="h-14 shrink-0 border-b border-border/60 bg-bg/75 backdrop-blur px-3.5 flex items-center gap-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot tone={route?.area === "admin" ? "info" : "neutral"} />
        <span className="text-text-muted truncate">{route?.group ?? "Executive Black"}</span>
        <span className="text-text-muted/70">/</span>
        <span className="text-text truncate font-medium">{route?.label ?? "Home"}</span>
      </div>
      <div className="flex-1" />
      <Button variant="outline" onClick={onOpenCommand} className="min-w-[154px] justify-start text-text-muted">
        <Search size={13} />
        Command
        <span className="ml-auto text-[11px] text-text-muted">Ctrl K</span>
      </Button>
      <div className="h-8 px-2.5 rounded-[var(--radius-sm)] border border-border/80 bg-surface/70 flex items-center gap-2 text-text-secondary">
        <Wifi size={13} />
        <StatusDot tone={liveTone(live.status)} />
        <span>{liveLabel(live.status)}</span>
        {live.lastEventAt && <span className="text-text-muted tabular-nums">{timeAgo(live.lastEventAt)}</span>}
      </div>
      <div className="hidden lg:flex h-8 px-2.5 rounded-[var(--radius-sm)] border border-border/80 bg-surface/70 items-center gap-2 text-text-secondary capitalize">
        <Shield size={13} />
        <span>{loading ? "Checking" : roleLabel}</span>
      </div>
      <div className="hidden md:flex h-8 px-2.5 rounded-[var(--radius-sm)] border border-border/80 bg-surface/70 items-center gap-2 text-text-secondary max-w-[220px]">
        <UserRound size={13} className="shrink-0" />
        <span className="truncate">{session?.displayName ?? "Guest"}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={() => void logout()} title="Sign out">
        <LogOut size={14} />
      </Button>
    </header>
  );
}
