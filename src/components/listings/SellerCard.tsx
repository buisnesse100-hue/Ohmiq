import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, Star, BadgeCheck } from "lucide-react";
import { formatFullDate } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/supabase/storage";
import type { Profile } from "@/types";

type SellerCardProps = Pick<
  Profile,
  | "id"
  | "username"
  | "display_name"
  | "avatar_url"
  | "city"
  | "created_at"
  | "listing_count"
  | "is_professional"
  | "rating_average"
  | "rating_count"
>;

export function SellerCard({ seller }: { seller: SellerCardProps }) {
  const avatarUrl = getAvatarUrl(seller.avatar_url);

  return (
    <Link
      href={`/profil/${seller.username}`}
      className="flex items-center gap-3 rounded-[14px] border border-line p-4 hover:bg-paper-muted"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper-muted text-muted">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={seller.display_name} fill className="object-cover" />
        ) : (
          <UserIcon size={22} />
        )}
      </span>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-ink">{seller.display_name}</p>
          {seller.is_professional && (
            <span className="flex items-center gap-0.5 rounded-full bg-volt-soft px-1.5 py-0.5 text-[10px] font-semibold text-volt-ink">
              <BadgeCheck size={11} /> Pro
            </span>
          )}
        </div>
        {seller.rating_count > 0 && seller.rating_average !== null && (
          <p className="flex items-center gap-1 text-xs text-ink">
            <Star size={12} className="fill-warning text-warning" />
            {seller.rating_average.toFixed(1)} ({seller.rating_count} avis)
          </p>
        )}
        <p className="text-xs text-muted">
          {seller.city ? `${seller.city} · ` : ""}Membre depuis {formatFullDate(seller.created_at)}
        </p>
        <p className="text-xs text-muted">{seller.listing_count} annonce(s) active(s)</p>
      </div>
    </Link>
  );
}
