import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "ok" | "warn" | "danger" | "info";

export function MetricTile({ label, value, tone = "neutral" }: { label: string; value: number | string; tone?: Tone }) {
  return (
    <div className="min-h-[76px] rounded-[var(--radius-md)] border border-border/80 bg-surface/70 px-3.5 py-3 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(244,244,240,0.03)]">
      <div className="flex items-center gap-2 text-text-muted text-[12px]">
        <StatusDot tone={tone} />
        <span className="truncate">{label}</span>
      </div>
      <div className={cn("text-[22px] font-semibold tabular-nums", tone === "danger" && "text-danger", tone === "warn" && "text-warn")}>
        {value}
      </div>
    </div>
  );
}
