import { PackageSearch } from "lucide-react";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingWithRelations } from "@/types";

export function ListingGrid({
  listings,
  emptyMessage = "Aucune annonce trouvée pour le moment.",
}: {
  listings: ListingWithRelations[];
  emptyMessage?: string;
}) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-line-strong bg-paper-muted py-16 text-center">
        <PackageSearch size={32} className="text-muted" />
        <p className="text-sm font-medium text-ink">{emptyMessage}</p>
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
