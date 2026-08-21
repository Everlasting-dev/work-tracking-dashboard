import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded-[var(--radius-sm)] border border-border bg-raised/80 px-3 text-[13px] text-text placeholder:text-text-muted outline-none transition-colors focus:border-border-strong focus:bg-hover/60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
