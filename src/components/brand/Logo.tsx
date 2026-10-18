import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label={`${SITE_NAME}, accueil`} className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-volt text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_4px_14px_rgba(124,92,255,0.45)]">
        <Zap size={16} fill="currentColor" strokeWidth={0} />
      </span>
      <span
        className={cn(
          "font-display text-[22px] font-bold tracking-tight",
          onDark ? "text-paper" : "text-ink"
        )}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}
