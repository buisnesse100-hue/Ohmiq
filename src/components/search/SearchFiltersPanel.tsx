"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Field, Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CONDITION_LABELS, SORT_LABELS } from "@/lib/constants";
import type { Brand, Category } from "@/types";

export function SearchFiltersPanel({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  // `categories` réservé pour un futur filtre par sous-catégorie dans ce panneau ;
  // la sélection de catégorie principale se fait aujourd'hui depuis la SearchBar.
  void categories;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [sellerType, setSellerType] = useState(searchParams.get("isProfessional") ?? "");
  const [hasPhone, setHasPhone] = useState(searchParams.get("hasPhone") === "true");
  const [hasWhatsapp, setHasWhatsapp] = useState(searchParams.get("hasWhatsapp") === "true");
  const [hasEmail, setHasEmail] = useState(searchParams.get("hasEmail") === "true");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("priceMin", priceMin);
    setOrDelete("priceMax", priceMax);
    setOrDelete("condition", condition);
    setOrDelete("brand", brand);
    setOrDelete("isProfessional", sellerType);
    setOrDelete("hasPhone", hasPhone ? "true" : "");
    setOrDelete("hasWhatsapp", hasWhatsapp ? "true" : "");
    setOrDelete("hasEmail", hasEmail ? "true" : "");
    params.delete("page");
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-[10px] border border-line-strong px-4 text-sm font-medium text-ink"
      >
        <SlidersHorizontal size={16} /> Filtres
      </button>

      <Select
        defaultValue={searchParams.get("sort") ?? "recent"}
        onChange={(e) => handleSortChange(e.target.value)}
        className="w-auto"
        aria-label="Trier par"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[16px] bg-paper p-5 sm:rounded-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filtres</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              <div>
                <Field>Prix</Field>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <span className="text-muted">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Field htmlFor="brand">Marque</Field>
                <Select id="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
                  <option value="">Toutes marques</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Field htmlFor="condition">État</Field>
                <Select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="">Tous états</option>
                  {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Field htmlFor="sellerType">Type de vendeur</Field>
                <Select id="sellerType" value={sellerType} onChange={(e) => setSellerType(e.target.value)}>
                  <option value="">Tous vendeurs</option>
                  <option value="false">Particuliers</option>
                  <option value="true">Professionnels</option>
                </Select>
              </div>

              <div>
                <Field>Contact disponible</Field>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={hasPhone}
                      onChange={(e) => setHasPhone(e.target.checked)}
                      className="accent-signal"
                    />
                    Téléphone
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={hasWhatsapp}
                      onChange={(e) => setHasWhatsapp(e.target.checked)}
                      className="accent-signal"
                    />
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={hasEmail}
                      onChange={(e) => setHasEmail(e.target.checked)}
                      className="accent-signal"
                    />
                    Email
                  </label>
                </div>
              </div>
            </div>

            <Button variant="signal" fullWidth className="mt-6" onClick={applyFilters}>
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
