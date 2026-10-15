import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, Gauge, MessagesSquare, Upload, Search, HandCoins } from "lucide-react";
import { AnimatedHero } from "@/components/home/AnimatedHero";
import { AnimatedCategoryGrid } from "@/components/home/AnimatedCategoryGrid";
import { StatsBar } from "@/components/home/StatsBar";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { LinkButton } from "@/components/ui/Button";
import { getCategories } from "@/services/categories";
import { getRecentListings, getPromotedListings } from "@/services/listings";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
};

export const revalidate = 60;

export default async function HomePage() {
  const [categories, recentListings, promotedListings] = await Promise.all([
    getCategories(),
    getRecentListings(8),
    getPromotedListings(8),
  ]);

  return (
    <div>
      <AnimatedHero categories={categories} />

      <section className="border-b border-line px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <StatsBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">Catégories</h2>
          <Link href="/categories" className="text-sm font-medium text-volt-ink underline">
            Voir tout
          </Link>
        </div>
        <AnimatedCategoryGrid categories={categories.slice(0, 16)} />
      </section>

      {promotedListings.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">Mises en avant</h2>
          <div className="mt-5">
            <ListingGrid listings={promotedListings} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">Annonces récentes</h2>
          <Link href="/search" className="text-sm font-medium text-volt-ink underline">
            Voir tout
          </Link>
        </div>
        <div className="mt-5">
          <ListingGrid listings={recentListings} />
        </div>
      </section>

      <section className="border-y border-line bg-paper-muted px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
            Comment ça marche ?
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Upload, title: "1. Publie", text: "Le formulaire s'adapte à ton produit : les bons champs techniques apparaissent automatiquement selon la catégorie." },
              { icon: Search, title: "2. Sois trouvé", text: "Recherche par marque, modèle, prix, état — jusqu'à une recherche en langage naturel type « RTX 4070 moins de 400 € »." },
              { icon: MessagesSquare, title: "3. Échange et vends", text: "Messagerie intégrée, offres négociées, avis vérifiés après chaque transaction." },
            ].map((step) => (
              <div key={step.title} className="rounded-[16px] border border-line bg-paper p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-volt-soft text-volt-ink">
                  <step.icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">
          Conçu pour l&apos;électronique d&apos;occasion
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Gauge, title: "Bonne affaire, vérifiée", text: "Comparaison au prix de marché quand une estimation fiable existe — jamais inventée." },
            { icon: ShieldCheck, title: "Vendeurs pro identifiés", text: "Un badge distingue les professionnels vérifiés des particuliers." },
            { icon: HandCoins, title: "Négocie sans friction", text: "Fais une offre directement depuis la messagerie, sans sortir de la conversation." },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
                <item.icon size={20} />
              </span>
              <h3 className="mt-3 font-medium text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 pb-20 text-center sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-line bg-ink px-6 py-14 text-paper">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Prêt à donner une seconde vie à ton matériel ?
          </h2>
          <p className="mt-2 text-paper/70">
            La publication d&apos;une annonce est gratuite, quel que soit le type de produit.
          </p>
          <LinkButton href="/publier" variant="signal" size="lg" className="mt-6">
            Publier une annonce
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
