import type { Metadata } from "next";
import Link from "next/link";
import { searchListings } from "@/services/listings";
import { getCategories } from "@/services/categories";
import { getBrands } from "@/services/catalog";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFiltersPanel } from "@/components/search/SearchFiltersPanel";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { searchFiltersSchema } from "@/lib/validations/misc";
import { parseNaturalLanguageSearch } from "@/lib/search/natural-language";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Rechercher une annonce",
  description: "Recherchez parmi les annonces OHMIQ par catégorie, marque, prix et localisation.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawParams = await searchParams;
  const flatParams = Object.fromEntries(
    Object.entries(rawParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  );
  const filters = searchFiltersSchema.parse(flatParams);

  // Recherche en langage naturel : "RTX 4070 moins de 400 €" -> texte + contrainte de prix,
  // sans écraser des filtres de prix déjà choisis explicitement dans le panneau de filtres.
  let effectiveFilters = filters;
  if (filters.q) {
    const parsed = parseNaturalLanguageSearch(filters.q);
    effectiveFilters = {
      ...filters,
      q: parsed.query || filters.q,
      priceMin: filters.priceMin ?? parsed.priceMin,
      priceMax: filters.priceMax ?? parsed.priceMax,
    };
  }

  const [categories, brands, results] = await Promise.all([
    getCategories(),
    getBrands(),
    searchListings(effectiveFilters),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SearchBar
        categories={categories}
        defaultQuery={filters.q}
        defaultCategory={filters.category}
        defaultCity={filters.city}
      />

      <div className="mt-6">
        <SearchFiltersPanel categories={categories} brands={brands} />

        <p className="mb-4 text-sm text-muted">
          {results.total} résultat{results.total > 1 ? "s" : ""}
          {(effectiveFilters.priceMin || effectiveFilters.priceMax) && filters.q !== effectiveFilters.q && (
            <span className="ml-1 text-volt-ink">
              — recherche interprétée : « {effectiveFilters.q || "tout"}
              {effectiveFilters.priceMax ? `, moins de ${effectiveFilters.priceMax} €` : ""}
              {effectiveFilters.priceMin ? `, plus de ${effectiveFilters.priceMin} €` : ""} »
            </span>
          )}
        </p>

        <ListingGrid
          listings={results.listings}
          emptyMessage="Aucune annonce ne correspond à ta recherche. Essaie d'élargir tes critères."
        />

        {results.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((pageNum) => {
              const params = new URLSearchParams(
                Object.entries(flatParams).filter(([, v]) => v) as [string, string][]
              );
              params.set("page", String(pageNum));
              return (
                <Link
                  key={pageNum}
                  href={`/search?${params.toString()}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-[8px] text-sm",
                    pageNum === results.page
                      ? "bg-ink text-paper"
                      : "border border-line text-ink hover:bg-paper-muted"
                  )}
                >
                  {pageNum}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
