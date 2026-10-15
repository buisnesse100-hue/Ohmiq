import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { getCurrentProfile } from "@/services/profiles";
import { ProfileEditForm } from "@/components/forms/ProfileEditForm";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { OHMIQ_PRO_PRICE_EUR } from "@/lib/constants";

export const metadata: Metadata = { title: "Mon compte" };

export default async function MonComptePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/mon-compte");

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mon compte</h1>
      <p className="mt-1 text-sm text-muted">@{profile.username}</p>

      <div className="mt-8 rounded-[16px] border border-line p-5">
        <ProfileEditForm profile={profile} />
      </div>

      {profile.is_professional ? (
        <Link
          href="/pro"
          className="mt-6 flex items-center gap-3 rounded-[16px] border border-volt/30 bg-volt-soft p-5 hover:brightness-95"
        >
          <LayoutDashboard size={20} className="text-volt-ink" />
          <div>
            <p className="font-display font-semibold text-volt-ink">Accéder à mon dashboard pro</p>
            <p className="text-sm text-volt-ink/80">CA, ventes, inventaire, commandes.</p>
          </div>
        </Link>
      ) : (
        <div className="mt-6 rounded-[16px] border border-signal/30 bg-signal-soft p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-signal-ink" />
            <h2 className="font-display text-lg font-semibold text-signal-ink">OHMIQ Pro</h2>
          </div>
          <p className="mt-2 text-sm text-signal-ink">
            Active le mode professionnel ci-dessus pour débloquer ton dashboard des ventes
            (gratuit dès maintenant). Les outils avancés — mise en avant automatique, statistiques
            détaillées — arriveront pour {OHMIQ_PRO_PRICE_EUR.toFixed(2)} € / mois. La publication
            d&apos;annonces reste gratuite quoi qu&apos;il arrive.
          </p>
        </div>
      )}

      <form action={signOutAction} className="mt-8">
        <Button type="submit" variant="outline">
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
