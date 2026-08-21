import { cn } from "@/lib/utils";

type Tone = "neutral" | "ok" | "warn" | "danger" | "info" | "unknown";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-text-muted",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  unknown: "bg-border-strong",
};

export function StatusDot({ tone = "neutral", className }: { tone?: Tone; className?: string }) {
  return <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", TONE_CLASS[tone], className)} />;
}
