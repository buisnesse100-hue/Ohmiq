import type { Metadata } from "next";
import { getCategories } from "@/services/categories";
import { getBrands, getAllCategoryAttributes } from "@/services/catalog";
import { createClient } from "@/lib/supabase/server";
import { PublishListingClient } from "@/components/forms/PublishListingClient";

export const metadata: Metadata = { title: "Publier une annonce" };

export default async function PublierPage() {
  const [categories, brands, categoryAttributes] = await Promise.all([
    getCategories(),
    getBrands(),
    getAllCategoryAttributes(),
  ]);
  const supabase = await createClient();
  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Publier une annonce</h1>
      <p className="mt-1 text-muted">C&apos;est gratuit et ça prend moins de 5 minutes.</p>
      <div className="mt-8">
        <PublishListingClient
          categories={categories}
          subcategories={subcategories ?? []}
          brands={brands}
          categoryAttributes={categoryAttributes}
        />
      </div>
    </div>
  );
}
