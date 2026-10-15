"use server";

import { getModelsForBrand } from "@/services/catalog";
import type { Model } from "@/types";

export async function getModelsForBrandAction(
  brandId: string,
  subcategoryId: string | null
): Promise<Model[]> {
  if (!brandId) return [];
  return getModelsForBrand(brandId, subcategoryId);
}
