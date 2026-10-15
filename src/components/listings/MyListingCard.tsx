"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Phone, MessageCircle, Mail } from "lucide-react";
import {
  markListingAsSoldAction,
  republishListingAction,
  deleteListingAction,
} from "@/actions/listings";
import { getListingImageUrl } from "@/lib/supabase/storage";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ListingWithRelations } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  pending: "En attente",
  active: "En ligne",
  sold: "Vendu",
  hidden: "Masquée (modération)",
  deleted: "Supprimée",
};

export function MyListingCard({ listing }: { listing: ListingWithRelations }) {
  const [isPending, startTransition] = useTransition();
  const primaryImage = listing.images.find((i) => i.is_primary) ?? listing.images[0];
  const imageUrl = getListingImageUrl(primaryImage?.storage_path);

  return (
    <div className="flex gap-4 rounded-[14px] border border-line p-4">
      <Link href={`/annonce/${listing.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-paper-muted">
        {imageUrl && <Image src={imageUrl} alt={listing.title} fill className="object-cover" />}
      </Link>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/annonce/${listing.slug}`} className="font-medium text-ink hover:underline">
              {listing.title}
            </Link>
            <p className="text-sm text-muted">{formatPrice(listing.price)}</p>
          </div>
          <Badge variant={listing.status === "active" ? "signal" : "default"}>
            {STATUS_LABELS[listing.status]}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Eye size={13} /> {listing.view_count}
          </span>
          <span className="flex items-center gap-1">
            <Phone size={13} /> {listing.call_click_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={13} /> {listing.whatsapp_click_count}
          </span>
          <span className="flex items-center gap-1">
            <Mail size={13} /> {listing.email_click_count}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {listing.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => { await markListingAsSoldAction(listing.id); })}
            >
              Marquer vendu
            </Button>
          )}
          {(listing.status === "sold" || listing.status === "hidden") && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => { await republishListingAction(listing.id); })}
            >
              Republier
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              if (confirm("Supprimer définitivement cette annonce ?")) {
                startTransition(async () => { await deleteListingAction(listing.id); });
              }
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
