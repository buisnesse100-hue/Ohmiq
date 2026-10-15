import type { Metadata } from "next";
import { ShieldCheck, Flag, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Sécurité" };

export default function SecuritePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Sécurité sur OHMIQ</h1>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink">
        <div className="flex gap-4">
          <ShieldCheck size={22} className="shrink-0 text-signal-ink" />
          <div>
            <h2 className="font-medium">Tu contrôles tes coordonnées</h2>
            <p className="mt-1 text-muted">
              Aucune information n&apos;est publique par défaut. Tu choisis précisément quels moyens
              de contact afficher sur chaque annonce.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Flag size={22} className="shrink-0 text-signal-ink" />
          <div>
            <h2 className="font-medium">Signalement et modération active</h2>
            <p className="mt-1 text-muted">
              Chaque annonce peut être signalée en un clic. Notre équipe examine les signalements et
              peut masquer ou supprimer les annonces non conformes.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Lock size={22} className="shrink-0 text-signal-ink" />
          <div>
            <h2 className="font-medium">Quelques conseils avant de conclure une vente</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
              <li>Privilégie les remises en main propre dans un lieu public.</li>
              <li>Vérifie l&apos;état du produit avant de payer.</li>
              <li>Méfie-toi des prix anormalement bas ou des demandes de paiement anticipé.</li>
              <li>Ne communique jamais de code de carte bancaire ou de mot de passe.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
