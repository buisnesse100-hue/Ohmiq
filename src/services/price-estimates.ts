import { createClient } from "@/lib/supabase/server";
import type { ListingCondition } from "@/types/database";

export interface DealAssessment {
  askedPrice: number;
  estimatedPrice: number;
  gapEur: number;
  gapPercent: number;
  status: "great_deal" | "good_deal" | "fair" | "above_market";
}

/**
 * Compare le prix demandé à une estimation de marché si elle existe.
 * Retourne `null` si aucune estimation n'est disponible : on n'affiche JAMAIS
 * un badge "Bonne affaire" basé sur une donnée inventée.
 */
export async function getDealAssessment(
  modelId: string | null,
  condition: ListingCondition,
  askedPrice: number
): Promise<DealAssessment | null> {
  if (!modelId) return null;

  const supabase = await createClient();
  const { data: estimate } = await supabase
    .from("price_estimates")
    .select("estimated_price, sample_size")
    .eq("model_id", modelId)
    .eq("condition", condition)
    .maybeSingle();

  // On exige un minimum d'échantillons avant de considérer l'estimation fiable.
  if (!estimate || estimate.sample_size < 3) return null;

  const gapEur = estimate.estimated_price - askedPrice;
  const gapPercent = (gapEur / estimate.estimated_price) * 100;

  let status: DealAssessment["status"] = "fair";
  if (gapPercent >= 25) status = "great_deal";
  else if (gapPercent >= 10) status = "good_deal";
  else if (gapPercent <= -10) status = "above_market";

  return {
    askedPrice,
    estimatedPrice: estimate.estimated_price,
    gapEur: Math.round(gapEur),
    gapPercent: Math.round(gapPercent),
    status,
  };
}
