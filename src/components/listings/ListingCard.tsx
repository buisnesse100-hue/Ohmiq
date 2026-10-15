import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles, BadgeCheck } from "lucide-react";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { getListingImageUrl } from "@/lib/supabase/storage";
import { Badge } from "@/components/ui/Badge";
import type { ListingWithRelations } from "@/types";

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const primaryImage =
    listing.images?.find((img) => img.is_primary) ?? listing.images?.[0] ?? null;
  const imageUrl = getListingImageUrl(primaryImage?.storage_path);

  return (
    <Link
      href={`/annonce/${listing.slug}`}
      className="group block overflow-hidden rounded-[16px] border border-line bg-paper transition-all hover:-translate-y-0.5 hover:border-volt/30 hover:shadow-[0_12px_32px_rgba(124,92,255,0.12)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Pas de photo
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {listing.is_promoted && (
            <Badge variant="signal">
              <Sparkles size={12} /> Mise en avant
            </Badge>
          )}
          {listing.seller?.is_professional && (
            <Badge variant="outline" className="bg-paper/90">
              <BadgeCheck size={12} /> Pro
            </Badge>
          )}
        </div>
        {listing.status === "sold" && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-semibold text-paper">
            Vendu
          </span>
        )}
      </div>

      <div className="p-3.5">
        <p className="font-display text-lg font-semibold text-ink">{formatPrice(listing.price)}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-ink">{listing.title}</p>
        {listing.brand?.name && (
          <p className="mt-0.5 text-xs font-medium text-volt-ink">{listing.brand.name}</p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {listing.city}
          </span>
          <span>{formatRelativeDate(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
