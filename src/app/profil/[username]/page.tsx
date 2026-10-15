import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { User as UserIcon, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { getProfileByUsername } from "@/services/profiles";
import { createClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { getAvatarUrl } from "@/lib/supabase/storage";
import { formatFullDate } from "@/lib/utils";
import type { ListingWithRelations } from "@/types";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return {};

  return {
    title: `${profile.display_name} (@${profile.username})`,
    description: `Découvrez les annonces publiées par ${profile.display_name} sur OHMIQ.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(`
      *,
      category:categories!listings_category_id_fkey ( id, slug, name, icon ),
      subcategory:subcategories!listings_subcategory_id_fkey ( id, slug, name ),
      images:listing_images ( id, storage_path, display_order, is_primary ),
      seller:profiles!listings_seller_id_fkey ( id, username, display_name, avatar_url, city, created_at, listing_count )
    `)
    .eq("seller_id", profile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const avatarUrl = getAvatarUrl(profile.avatar_url);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-muted text-muted">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={profile.display_name} fill className="object-cover" />
          ) : (
            <UserIcon size={28} />
          )}
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold sm:text-2xl">{profile.display_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {profile.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Membre depuis {formatFullDate(profile.created_at)}
            </span>
            {profile.phone_verified && (
              <span className="flex items-center gap-1 text-signal-ink">
                <ShieldCheck size={14} /> Téléphone vérifié
              </span>
            )}
          </div>
        </div>
      </div>

      {profile.bio && <p className="mt-4 max-w-2xl text-sm text-ink">{profile.bio}</p>}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">
          Annonces actives ({listings.length})
        </h2>
        <div className="mt-4">
          <ListingGrid listings={listings} emptyMessage="Aucune annonce active pour le moment." />
        </div>
      </div>
    </div>
  );
}
