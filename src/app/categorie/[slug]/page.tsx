import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getSubcategoriesByCategoryId } from "@/services/categories";
import { searchListings } from "@/services/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.name} — Petites annonces`;
  const description = `Découvrez toutes les annonces de la catégorie ${category.name} sur OHMIQ. Contactez directement les vendeurs par téléphone, WhatsApp ou email.`;

  return {
    title,
    description,
    alternates: { canonical: `/categorie/${category.slug}` },
    openGraph: { title, description },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [subcategories, results] = await Promise.all([
    getSubcategoriesByCategoryId(category.id),
    searchListings({ category: slug, page: page ? Number(page) : 1 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Parcourez les annonces de la catégorie {category.name} publiées par des particuliers et
        professionnels. Contactez directement le vendeur par téléphone, WhatsApp ou email — sans
        intermédiaire.
      </p>

      {subcategories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/search?category=${category.slug}&subcategory=${sub.slug}`}
              className="rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink hover:bg-paper-muted"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <p className="mb-4 text-sm text-muted">{results.total} annonces</p>
        <ListingGrid
          listings={results.listings}
          emptyMessage={`Aucune annonce dans ${category.name} pour le moment. Sois le premier à publier !`}
        />
      </div>
    </div>
  );
}
