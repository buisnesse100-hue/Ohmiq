import type { Metadata } from "next";

export const metadata: Metadata = { title: "Règles de la plateforme" };

export default function ReglesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Règles de la plateforme</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p>
          Pour que OHMIQ reste un espace de confiance, chaque annonce publiée doit respecter les
          règles suivantes :
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Le produit ou service proposé doit être réel, décrit honnêtement et légal à la vente.</li>
          <li>Les photos doivent représenter fidèlement l&apos;objet vendu.</li>
          <li>Le prix affiché doit être celui réellement demandé.</li>
          <li>Aucune arnaque, contenu interdit, ou tentative de fraude n&apos;est tolérée.</li>
          <li>Une annonce vendue doit être marquée comme telle ou supprimée rapidement.</li>
          <li>Le spam et la publication massive d&apos;annonces similaires sont interdits.</li>
        </ul>
        <p>
          Toute annonce signalée est examinée par notre équipe de modération. En cas de non-respect
          répété de ces règles, un compte peut être suspendu temporairement ou définitivement.
        </p>
      </div>
    </div>
  );
}
