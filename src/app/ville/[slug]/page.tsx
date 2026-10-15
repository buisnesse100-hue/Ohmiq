import type { Metadata } from "next";
import { searchListings } from "@/services/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";

interface CityPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = slugToCity(slug);
  const title = `Petites annonces à ${city}`;
  const description = `Toutes les petites annonces publiées à ${city} sur OHMIQ. Contactez directement les vendeurs près de chez vous.`;

  return {
    title,
    description,
    alternates: { canonical: `/ville/${slug}` },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const city = slugToCity(slug);

  const results = await searchListings({ city, page: page ? Number(page) : 1 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Annonces à {city}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Découvrez les petites annonces publiées par des vendeurs à {city} et ses environs.
      </p>

      <div className="mt-8">
        <p className="mb-4 text-sm text-muted">{results.total} annonces</p>
        <ListingGrid
          listings={results.listings}
          emptyMessage={`Aucune annonce à ${city} pour le moment.`}
        />
      </div>
    </div>
  );
}
