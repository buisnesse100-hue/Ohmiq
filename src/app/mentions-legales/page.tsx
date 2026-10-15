import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Mentions légales</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p className="rounded-[10px] bg-paper-muted p-4 text-sm text-muted">
          Placeholder à personnaliser : remplace les informations ci-dessous par celles de ta société
          avant la mise en production. Elles ne doivent jamais rester fictives sur un site en ligne.
        </p>
        <section>
          <h2 className="font-display text-lg font-semibold">Éditeur du site</h2>
          <p>
            Raison sociale : [À COMPLÉTER]<br />
            Forme juridique : [À COMPLÉTER]<br />
            Siège social : [À COMPLÉTER]<br />
            SIRET : [À COMPLÉTER]<br />
            Directeur de la publication : [À COMPLÉTER]<br />
            Contact : [À COMPLÉTER]
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Hébergement</h2>
          <p>
            Ce site est hébergé sur une infrastructure Cloudflare, avec une base de données et un
            stockage gérés par Supabase. [Compléter avec les coordonnées précises de l&apos;hébergeur.]
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site OHMIQ (marque, logo, charte graphique) sont la
            propriété de l&apos;éditeur, sauf mention contraire. Les contenus publiés par les
            utilisateurs (annonces, photos) restent leur propriété.
          </p>
        </section>
      </div>
    </div>
  );
}
