import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] text-[13px] font-medium transition-[background,color,border,transform] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong disabled:opacity-50 disabled:pointer-events-none active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-accent text-bg hover:bg-text shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
        ghost: "text-text-secondary hover:bg-hover/80 hover:text-text",
        outline: "border border-border bg-surface/50 text-text-secondary hover:bg-hover hover:text-text hover:border-border-strong",
      },
      size: { sm: "h-8 px-2.5", md: "h-9 px-3", icon: "h-8 w-8 px-0" },
    },
    defaultVariants: { variant: "ghost", size: "sm" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
