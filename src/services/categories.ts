import { createClient } from "@/lib/supabase/server";
import type { Category, Subcategory } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getCategories]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[getCategoryBySlug]", error.message);
    return null;
  }
  return data;
}

export async function getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getSubcategoriesByCategoryId]", error.message);
    return [];
  }
  return data ?? [];
}

/** Compte le nombre d'annonces actives par catégorie (pour l'affichage des compteurs). */
export async function getCategoryListingCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("category_id")
    .eq("status", "active");

  if (error || !data) return {};

  return data.reduce<Record<string, number>>((acc, row) => {
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});
}
