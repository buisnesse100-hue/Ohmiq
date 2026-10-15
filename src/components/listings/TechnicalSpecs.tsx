import { FileCheck2, ShieldCheck, Package, AlertTriangle } from "lucide-react";
import { formatFullDate } from "@/lib/utils";
import type { Listing } from "@/types";

interface AttributeRow {
  id: string;
  value: string;
  attribute: { label: string; unit: string | null } | null;
}

export function TechnicalSpecs({
  listing,
  attributeValues,
}: {
  listing: Pick<
    Listing,
    "has_invoice" | "has_warranty" | "warranty_until" | "accessories_included" | "known_defects"
  >;
  attributeValues: AttributeRow[];
}) {
  const hasTrustInfo =
    listing.has_invoice || listing.has_warranty || listing.accessories_included || listing.known_defects;

  if (attributeValues.length === 0 && !hasTrustInfo) return null;

  return (
    <div className="mt-6 border-t border-line pt-6">
      <h2 className="font-display text-lg font-semibold">Caractéristiques &amp; confiance</h2>

      {attributeValues.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {attributeValues.map((row) => (
            <div key={row.id} className="flex justify-between border-b border-line py-2 text-sm sm:justify-start sm:gap-2">
              <dt className="text-muted">{row.attribute?.label ?? "Caractéristique"}</dt>
              <dd className="font-medium text-ink">
                {row.value}
                {row.attribute?.unit ? ` ${row.attribute.unit}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {hasTrustInfo && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {listing.has_invoice && (
            <span className="flex items-center gap-1.5 rounded-full bg-paper-muted px-3 py-1.5 text-ink">
              <FileCheck2 size={14} /> Facture disponible
            </span>
          )}
          {listing.has_warranty && (
            <span className="flex items-center gap-1.5 rounded-full bg-paper-muted px-3 py-1.5 text-ink">
              <ShieldCheck size={14} />
              Garantie{listing.warranty_until ? ` jusqu'au ${formatFullDate(listing.warranty_until)}` : ""}
            </span>
          )}
          {listing.accessories_included && (
            <span className="flex items-center gap-1.5 rounded-full bg-paper-muted px-3 py-1.5 text-ink">
              <Package size={14} /> {listing.accessories_included}
            </span>
          )}
        </div>
      )}

      {listing.known_defects && (
        <div className="mt-3 flex items-start gap-2 rounded-[10px] border border-warning/25 bg-warning/5 p-3 text-sm text-ink">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="font-medium">Défauts signalés par le vendeur</p>
            <p className="mt-0.5 text-muted">{listing.known_defects}</p>
          </div>
        </div>
      )}
    </div>
  );
}
