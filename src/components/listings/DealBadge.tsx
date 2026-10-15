import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { DealAssessment } from "@/services/price-estimates";

const STATUS_CONFIG = {
  great_deal: {
    label: "Très bonne affaire",
    icon: TrendingDown,
    className: "bg-success/10 text-success border-success/20",
  },
  good_deal: {
    label: "Bonne affaire",
    icon: TrendingDown,
    className: "bg-volt-soft text-volt-ink border-volt/20",
  },
  fair: {
    label: "Prix cohérent avec le marché",
    icon: Minus,
    className: "bg-paper-muted text-muted border-line",
  },
  above_market: {
    label: "Au-dessus du marché",
    icon: TrendingUp,
    className: "bg-warning/10 text-warning border-warning/20",
  },
} as const;

export function DealBadge({ assessment }: { assessment: DealAssessment }) {
  const config = STATUS_CONFIG[assessment.status];
  const Icon = config.icon;

  return (
    <div className={`rounded-[12px] border p-3.5 text-sm ${config.className}`}>
      <div className="flex items-center gap-2 font-semibold">
        <Icon size={16} />
        {config.label}
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed opacity-90">
        Prix demandé {formatPrice(assessment.askedPrice)} vs estimation de marché{" "}
        {formatPrice(assessment.estimatedPrice)} pour un état similaire
        {assessment.gapEur > 0 ? ` (écart de ${formatPrice(Math.abs(assessment.gapEur))})` : ""}.
      </p>
      <p className="mt-1 text-[11px] opacity-70">
        Estimation indicative basée sur des annonces comparables — ne constitue pas une garantie
        de revente ni de bénéfice.
      </p>
    </div>
  );
}
