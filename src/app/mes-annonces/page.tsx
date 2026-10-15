import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profiles";
import { getListingsBySeller } from "@/services/listings";
import { MyListingCard } from "@/components/listings/MyListingCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Mes annonces" };

export default async function MesAnnoncesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/mes-annonces");

  const listings = await getListingsBySeller(profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mes annonces</h1>
        <LinkButton href="/publier" variant="signal" size="sm">
          Publier
        </LinkButton>
      </div>

      <div className="mt-6 space-y-3">
        {listings.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-line-strong bg-paper-muted p-8 text-center text-muted">
            Tu n&apos;as encore publié aucune annonce.
          </p>
        ) : (
          listings.map((listing) => <MyListingCard key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
