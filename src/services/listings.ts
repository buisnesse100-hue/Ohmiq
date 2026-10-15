import { createClient } from "@/lib/supabase/server";
import { LISTINGS_PER_PAGE } from "@/lib/constants";
import type { ListingWithRelations, SearchFilters } from "@/types";
import type { ListingCondition } from "@/types/database";

const LISTING_SELECT = `
  *,
  category:categories!listings_category_id_fkey ( id, slug, name, icon ),
  subcategory:subcategories!listings_subcategory_id_fkey ( id, slug, name ),
  images:listing_images ( id, storage_path, display_order, is_primary ),
  seller:profiles!listings_seller_id_fkey ( id, username, display_name, avatar_url, city, created_at, listing_count, is_professional, rating_average, rating_count ),
  brand:brands!listings_brand_id_fkey ( id, slug, name ),
  model:models!listings_model_id_fkey ( id, slug, name )
`;

export interface SearchResult {
  listings: ListingWithRelations[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/** Recherche d'annonces avec filtres, tri et pagination. Ne renvoie que les annonces "active". */
export async function searchListings(filters: SearchFilters): Promise<SearchResult> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const perPage = LISTINGS_PER_PAGE;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("listings")
    .select(LISTING_SELECT, { count: "exact" })
    .eq("status", "active");

  if (filters.q) {
    const safe = filters.q.replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (filters.subcategory) {
    const { data: subcat } = await supabase
      .from("subcategories")
      .select("id")
      .eq("slug", filters.subcategory)
      .maybeSingle();
    if (subcat) query = query.eq("subcategory_id", subcat.id);
  }
  if (filters.brand) {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", filters.brand)
      .maybeSingle();
    if (brand) query = query.eq("brand_id", brand.id);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.priceMin !== undefined) {
    query = query.gte("price", filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    query = query.lte("price", filters.priceMax);
  }
  if (filters.condition) {
    query = query.eq("condition", filters.condition as ListingCondition);
  }
  if (filters.isProfessional !== undefined) {
    query = query.eq("is_professional_listing", filters.isProfessional);
  }
  if (filters.hasPhone) query = query.eq("contact_phone_public", true);
  if (filters.hasWhatsapp) query = query.eq("contact_whatsapp_public", true);
  if (filters.hasEmail) query = query.eq("contact_email_public", true);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "relevance":
      // Priorise les annonces mises en avant, puis les plus récentes.
      query = query.order("is_promoted", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("[searchListings]", error.message);
    return { listings: [], total: 0, page, perPage, totalPages: 0 };
  }

  return {
    listings: (data ?? []) as unknown as ListingWithRelations[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  };
}

export async function getListingBySlug(slug: string): Promise<ListingWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[getListingBySlug]", error.message);
    return null;
  }
  return data as unknown as ListingWithRelations | null;
}

export async function getRecentListings(limit = 8): Promise<ListingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentListings]", error.message);
    return [];
  }
  return (data ?? []) as unknown as ListingWithRelations[];
}

export async function getPromotedListings(limit = 8): Promise<ListingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("is_promoted", true)
    .gt("promotion_expires_at", new Date().toISOString())
    .order("promotion_started_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as unknown as ListingWithRelations[];
}

export async function getRelatedListings(
  categoryId: string,
  excludeListingId: string,
  limit = 4
): Promise<ListingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeListingId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as unknown as ListingWithRelations[];
}

/** Annonces d'un vendeur (toutes visibles pour lui-même, uniquement actives/vendues pour les autres via RLS). */
export async function getListingsBySeller(sellerId: string): Promise<ListingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("seller_id", sellerId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getListingsBySeller]", error.message);
    return [];
  }
  return (data ?? []) as unknown as ListingWithRelations[];
}

export async function getFavoriteListings(userId: string): Promise<ListingWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(`listing:listings!favorites_listing_id_fkey ( ${LISTING_SELECT} )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFavoriteListings]", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => row.listing)
    .filter(Boolean) as unknown as ListingWithRelations[];
}
