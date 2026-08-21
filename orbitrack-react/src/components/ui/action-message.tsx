import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";

export function ActionMessage({
  notice,
  error,
  onClear,
}: {
  notice: string;
  error: string;
  onClear: () => void;
}) {
  const message = error || notice;
  if (!message) return null;

  return (
    <div className="h-10 px-3 border-b border-border bg-raised flex items-center gap-2">
      <StatusDot tone={error ? "danger" : "ok"} />
      <span className={error ? "text-danger" : "text-text-secondary"}>{message}</span>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" onClick={onClear} title="Dismiss">
        <X size={13} />
      </Button>
    </div>
  );
}
