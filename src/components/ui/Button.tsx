import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none rounded-[10px] whitespace-nowrap";

const variants = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  signal: "bg-signal text-signal-ink hover:brightness-95",
  outline: "border border-line-strong text-ink hover:bg-paper-muted bg-transparent",
  ghost: "text-ink hover:bg-paper-muted bg-transparent",
  danger: "bg-danger text-white hover:brightness-90",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}

interface LinkButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
