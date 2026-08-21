import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("executive-surface rounded-[var(--radius-md)] border border-border/80", className)}>{children}</section>;
}

export function PanelHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-h-11 px-3.5 border-b border-border/70 flex items-center gap-2.5", className)}>{children}</div>;
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[14px] font-semibold text-text">{children}</h2>;
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-3.5", className)}>{children}</div>;
}
