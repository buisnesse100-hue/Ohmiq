import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { LinkButton } from "@/components/ui/Button";
import { getCategories } from "@/services/categories";
import { getBrands } from "@/services/catalog";
import { getRecentListings, getPromotedListings } from "@/services/listings";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
};

export const revalidate = 60;

const STEPS = [
  {
    title: "Publie avec la bonne fiche",
    text: "Les champs s'adaptent à ta catégorie : mémoire vidéo pour une carte graphique, santé de la batterie pour un téléphone, autonomie pour un aspirateur.",
  },
  {
    title: "Sois trouvé précisément",
    text: "Recherche par marque, modèle, état et prix, ou en langage naturel : « RTX 4070 moins de 400 € ».",
  },
  {
    title: "Négocie dans la conversation",
    text: "Messagerie intégrée, offre acceptée en un clic, avis après la vente.",
  },
];

export default async function HomePage() {
  const [categories, brands, recentListings, promotedListings] = await Promise.all([
    getCategories(),
    getBrands(),
    getRecentListings(8),
    getPromotedListings(8),
  ]);

  return (
    <div>
      <Hero categories={categories} />
      <BrandMarquee brands={brands} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Parcourir par catégorie
          </h2>
          <Link href="/categories" className="text-sm font-medium text-ink underline underline-offset-4">
            Toutes les catégories
          </Link>
        </div>
        <div className="mt-7">
          <CategoryTiles categories={categories.slice(0, 18)} />
        </div>
      </section>

      {promotedListings.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Mises en avant</h2>
          <div className="mt-6">
            <ListingGrid listings={promotedListings} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dernières annonces</h2>
          <Link href="/search" className="text-sm font-medium text-ink underline underline-offset-4">
            Tout voir
          </Link>
        </div>
        <div className="mt-6">
          <ListingGrid
            listings={recentListings}
            emptyMessage="Aucune annonce pour le moment. La première, c'est peut-être la tienne."
            emptyAction={
              <LinkButton href="/publier" variant="signal">
                Publier une annonce
              </LinkButton>
            }
          />
        </div>
      </section>

      <section className="border-y border-line bg-paper-muted px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Du dépôt à la vente, sans détour
            </h2>
            <p className="mt-4 max-w-sm text-muted">
              Publier est gratuit, quel que soit le produit. Un smartphone, une carte graphique ou une
              machine à café suivent le même chemin.
            </p>
          </div>
          <ol className="relative space-y-9 border-l border-line-strong pl-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-paper">
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-[28px] bg-ink px-6 py-16 text-center text-paper sm:px-12">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Ton matériel mérite une seconde vie.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-paper/70">
            Dépose ton annonce en quelques minutes. Rien à payer pour publier.
          </p>
          <LinkButton href="/publier" variant="signal" size="lg" className="mt-8 shadow-[0_0_40px_rgba(124,92,255,0.45)]">
            Publier une annonce
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
