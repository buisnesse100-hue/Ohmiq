import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-paper-muted text-ink border border-line",
  signal: "bg-signal-soft text-signal-ink border border-signal/20",
  outline: "border border-line-strong text-muted bg-transparent",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
