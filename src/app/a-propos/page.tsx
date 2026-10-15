import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = { title: "À propos" };

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">À propos de {SITE_NAME}</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p className="font-display text-lg text-signal-ink">{SITE_TAGLINE}</p>
        <p>
          {SITE_NAME} est né d&apos;un constat simple : les marketplaces de petites annonces sont
          devenues trop compliquées, avec des messageries internes obligatoires, des étapes
          superflues, et des interfaces datées.
        </p>
        <p>
          Notre approche est volontairement différente : un vendeur publie, un acheteur découvre et
          contacte directement — par téléphone, WhatsApp ou email. Pas de paiement intermédiaire, pas
          de système de livraison imposé. Juste une mise en relation rapide, honnête et efficace.
        </p>
      </div>
    </div>
  );
}
