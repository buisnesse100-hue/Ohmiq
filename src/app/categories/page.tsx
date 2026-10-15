import Link from "next/link";
import type { Metadata } from "next";
import * as LucideIcons from "lucide-react";
import { getCategories, getCategoryListingCounts } from "@/services/categories";

export const metadata: Metadata = {
  title: "Toutes les catégories",
  description: "Parcourez toutes les catégories de petites annonces disponibles sur OHMIQ.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryListingCounts()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Toutes les catégories</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => {
          const Icon =
            (category.icon && (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[category.icon]) ||
            LucideIcons.Package;
          return (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className="flex items-center gap-3 rounded-[14px] border border-line p-4 hover:bg-paper-muted"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-muted text-ink">
                <Icon size={20} />
              </span>
              <div>
                <p className="font-medium text-ink">{category.name}</p>
                <p className="text-xs text-muted">{counts[category.id] ?? 0} annonces</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
