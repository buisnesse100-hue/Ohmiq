import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function ConditionsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Conditions d&apos;utilisation</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p className="rounded-[10px] bg-paper-muted p-4 text-sm text-muted">
          Placeholder à faire relire par un professionnel du droit avant mise en production.
        </p>
        <section>
          <h2 className="font-display text-lg font-semibold">Objet</h2>
          <p>
            OHMIQ est une plateforme de mise en relation entre particuliers et professionnels
            souhaitant vendre ou acheter des biens. OHMIQ n&apos;est ni vendeur, ni acheteur, ni
            intermédiaire dans les transactions : la plateforme met uniquement en relation les
            utilisateurs, qui échangent et concluent la vente directement entre eux.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Publication des annonces</h2>
          <p>
            La publication d&apos;une annonce de base est gratuite. Chaque utilisateur est seul
            responsable du contenu de ses annonces (exactitude, légalité, droits sur les photos).
            OHMIQ se réserve le droit de masquer ou supprimer toute annonce non conforme aux{" "}
            <a href="/regles" className="underline">règles de la plateforme</a>.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Responsabilité</h2>
          <p>
            OHMIQ ne garantit ni la qualité, ni la sécurité, ni la légalité des annonces publiées,
            ni l&apos;exactitude des informations fournies par les utilisateurs. Chaque transaction se
            déroule sous la seule responsabilité des parties concernées.
          </p>
        </section>
      </div>
    </div>
  );
}
