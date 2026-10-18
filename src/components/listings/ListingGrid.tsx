import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingWithRelations } from "@/types";

export function ListingGrid({
  listings,
  emptyMessage = "Aucune annonce trouvée pour le moment.",
  emptyAction,
}: {
  listings: ListingWithRelations[];
  emptyMessage?: string;
  emptyAction?: ReactNode;
}) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[18px] border border-dashed border-line-strong bg-paper-muted px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-muted">
          <PackageSearch size={24} />
        </span>
        <p className="max-w-sm text-[15px] font-medium text-ink">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
