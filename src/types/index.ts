import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Subcategory = Database["public"]["Tables"]["subcategories"]["Row"];
export type Brand = Database["public"]["Tables"]["brands"]["Row"];
export type Model = Database["public"]["Tables"]["models"]["Row"];
export type CategoryAttribute = Database["public"]["Tables"]["category_attributes"]["Row"];
export type ListingAttributeValue = Database["public"]["Tables"]["listing_attribute_values"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type ListingImage = Database["public"]["Tables"]["listing_images"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Offer = Database["public"]["Tables"]["offers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type PriceEstimate = Database["public"]["Tables"]["price_estimates"]["Row"];

/** Une annonce enrichie avec ses relations, telle que renvoyée par les pages de listing */
export type ListingWithRelations = Listing & {
  category: Pick<Category, "id" | "slug" | "name" | "icon">;
  subcategory: Pick<Subcategory, "id" | "slug" | "name"> | null;
  images: ListingImage[];
  seller: Pick<
    Profile,
    | "id"
    | "username"
    | "display_name"
    | "avatar_url"
    | "city"
    | "created_at"
    | "listing_count"
    | "is_professional"
    | "rating_average"
    | "rating_count"
  >;
  brand?: Pick<Brand, "id" | "slug" | "name"> | null;
  model?: Pick<Model, "id" | "slug" | "name"> | null;
};

/** Carte d'annonce affichée dans les grilles/résultats de recherche */
export type ListingCardData = Pick<
  Listing,
  | "id"
  | "slug"
  | "title"
  | "price"
  | "is_negotiable"
  | "city"
  | "condition"
  | "is_promoted"
  | "created_at"
  | "favorite_count"
> & {
  primary_image_path: string | null;
  category_name: string;
};

export type SortOption = "relevance" | "recent" | "price_asc" | "price_desc";

export interface SearchFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  isProfessional?: boolean;
  hasPhone?: boolean;
  hasWhatsapp?: boolean;
  hasEmail?: boolean;
  sort?: SortOption;
  page?: number;
}

export interface ActionResult<T = undefined> {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}
