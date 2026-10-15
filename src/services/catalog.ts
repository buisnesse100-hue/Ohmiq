import { createClient } from "@/lib/supabase/server";
import type { Brand, Model, CategoryAttribute } from "@/types";

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getBrands]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getBrandsForCategory(categoryId: string): Promise<Brand[]> {
  const supabase = await createClient();
  const brandCategorySelect = "brand:brands!brand_categories_brand_id_fkey ( * )";
  const { data, error } = await supabase
    .from("brand_categories")
    .select(brandCategorySelect)
    .eq("category_id", categoryId);

  if (error || !data) {
    // Si aucune association marque/catégorie n'est configurée, on retombe sur toutes
    // les marques actives plutôt que de bloquer le vendeur.
    return getBrands();
  }

  const brands = data.map((row) => row.brand).filter(Boolean) as unknown as Brand[];
  return brands.length > 0 ? brands : getBrands();
}

export async function getModelsForBrand(brandId: string, subcategoryId?: string | null): Promise<Model[]> {
  const supabase = await createClient();
  let query = supabase.from("models").select("*").eq("brand_id", brandId).eq("is_active", true);

  if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);

  const { data, error } = await query.order("name");
  if (error) {
    console.error("[getModelsForBrand]", error.message);
    return [];
  }
  return data ?? [];
}

/** Attributs techniques dynamiques pilotant le formulaire d'annonce pour une (sous-)catégorie. */
export async function getCategoryAttributes(
  categoryId: string,
  subcategoryId?: string | null
): Promise<CategoryAttribute[]> {
  const supabase = await createClient();
  let query = supabase.from("category_attributes").select("*").eq("category_id", categoryId);

  query = subcategoryId ? query.eq("subcategory_id", subcategoryId) : query.is("subcategory_id", null);

  const { data, error } = await query.order("display_order");
  if (error) {
    console.error("[getCategoryAttributes]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllCategoryAttributes(): Promise<CategoryAttribute[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_attributes")
    .select("*")
    .order("display_order");

  if (error) return [];
  return data ?? [];
}

export async function getListingAttributeValues(listingId: string) {
  const supabase = await createClient();
  const select = "*, attribute:category_attributes!listing_attribute_values_attribute_id_fkey ( * )";
  const { data, error } = await supabase
    .from("listing_attribute_values")
    .select(select)
    .eq("listing_id", listingId);

  if (error) return [];
  return (data ?? []) as unknown as Array<{
    id: string;
    listing_id: string;
    attribute_id: string;
    value: string;
    created_at: string;
    attribute: CategoryAttribute | null;
  }>;
}
