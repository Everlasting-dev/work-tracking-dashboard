import { AlertCircle, Ban, Inbox, Loader2, WifiOff, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StateTone = "neutral" | "danger" | "warn" | "info";

const toneClass: Record<StateTone, string> = {
  neutral: "border-border bg-surface text-text-secondary",
  danger: "border-danger/40 bg-danger/10 text-danger",
  warn: "border-warn/40 bg-warn/10 text-warn",
  info: "border-info/40 bg-info/10 text-info",
};

function SurfaceState({
  icon: Icon,
  title,
  children,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  tone?: StateTone;
  className?: string;
}) {
  return (
    <div className={cn("min-h-40 rounded-[var(--radius-md)] border p-4 grid place-items-center text-center", toneClass[tone], className)}>
      <div className="max-w-[420px]">
        <Icon size={22} className="mx-auto mb-2" />
        <div className="font-semibold text-text">{title}</div>
        {children && <div className="mt-1 text-[13px] leading-5">{children}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading workspace" }: { label?: string }) {
  return <SurfaceState icon={Loader2} title={label} className="[&_svg]:animate-spin" />;
}

export function EmptyState({ title = "Nothing here yet", children }: { title?: string; children?: ReactNode }) {
  return <SurfaceState icon={Inbox} title={title}>{children}</SurfaceState>;
}

export function ErrorState({ title = "Something went wrong", children }: { title?: string; children?: ReactNode }) {
  return <SurfaceState icon={AlertCircle} title={title} tone="danger">{children}</SurfaceState>;
}

export function PermissionState({ children }: { children?: ReactNode }) {
  return <SurfaceState icon={Ban} title="You do not have access" tone="warn">{children}</SurfaceState>;
}

export function OfflineState({ children }: { children?: ReactNode }) {
  return <SurfaceState icon={WifiOff} title="You are offline" tone="info">{children}</SurfaceState>;
}
