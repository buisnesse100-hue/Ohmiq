import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/services/categories";
import { searchListings } from "@/services/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";

interface CategoryCityPageProps {
  params: Promise<{ slug: string; ville: string }>;
  searchParams: Promise<{ page?: string }>;
}

function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: CategoryCityPageProps): Promise<Metadata> {
  const { slug, ville } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const city = slugToCity(ville);
  const title = `${category.name} à ${city}`;
  const description = `Annonces de ${category.name.toLowerCase()} à ${city} sur OHMIQ. Contact direct avec les vendeurs, sans intermédiaire.`;

  return {
    title,
    description,
    alternates: { canonical: `/categorie/${slug}/${ville}` },
  };
}

export default async function CategoryCityPage({ params, searchParams }: CategoryCityPageProps) {
  const { slug, ville } = await params;
  const { page } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const city = slugToCity(ville);
  const results = await searchListings({ category: slug, city, page: page ? Number(page) : 1 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        {category.name} à {city}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Toutes les annonces de {category.name.toLowerCase()} publiées à {city}. Contactez le vendeur
        directement par téléphone, WhatsApp ou email.
      </p>

      <div className="mt-8">
        <p className="mb-4 text-sm text-muted">{results.total} annonces</p>
        <ListingGrid
          listings={results.listings}
          emptyMessage={`Aucune annonce de ${category.name.toLowerCase()} à ${city} pour le moment.`}
        />
      </div>
    </div>
  );
}
