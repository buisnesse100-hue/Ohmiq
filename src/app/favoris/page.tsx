import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/services/profiles";
import { getFavoriteListings } from "@/services/listings";
import { ListingGrid } from "@/components/listings/ListingGrid";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavorisPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/favoris");

  const listings = await getFavoriteListings(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mes favoris</h1>
      <div className="mt-6">
        <ListingGrid listings={listings} emptyMessage="Tu n'as pas encore de favoris." />
      </div>
    </div>
  );
}
