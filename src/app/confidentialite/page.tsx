import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Politique de confidentialité</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p className="rounded-[10px] bg-paper-muted p-4 text-sm text-muted">
          Placeholder à faire relire par un professionnel du droit avant mise en production
          (obligations RGPD précises selon ta structure et tes traitements réels).
        </p>
        <section>
          <h2 className="font-display text-lg font-semibold">Données collectées</h2>
          <p>
            Lors de l&apos;utilisation de OHMIQ, nous collectons : les informations de compte
            (email, nom d&apos;utilisateur), les informations de profil que tu choisis de renseigner
            (ville, téléphone, bio), le contenu de tes annonces et photos, ainsi que des données
            d&apos;usage anonymisées (vues, clics de contact) pour améliorer le service.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Utilisation des données</h2>
          <p>
            Les coordonnées de contact (téléphone, WhatsApp, email) que tu ajoutes à une annonce ne
            sont visibles publiquement que si tu actives explicitement leur affichage. Elles ne sont
            jamais partagées avec des tiers à des fins commerciales.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Tes droits</h2>
          <p>
            Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification et de
            suppression de tes données. Pour exercer ces droits, contacte-nous via la page{" "}
            <a href="/contact" className="underline">Contact</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
