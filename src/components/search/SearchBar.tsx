"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FRENCH_CITIES_SUGGESTIONS } from "@/lib/constants";
import type { Category } from "@/types";

export function SearchBar({
  categories,
  defaultQuery = "",
  defaultCategory = "",
  defaultCity = "",
}: {
  categories: Category[];
  defaultQuery?: string;
  defaultCategory?: string;
  defaultCity?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [category, setCategory] = useState(defaultCategory);
  const [city, setCity] = useState(defaultCity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 rounded-[16px] border border-line bg-paper p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search size={20} className="shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="RTX 4070, iPhone 15 Pro, aspirateur robot..."
          className="h-12 w-full bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:w-44"
          aria-label="Catégorie"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="sm:w-40"
          aria-label="Ville"
        >
          <option value="">Toute la France</option>
          {FRENCH_CITIES_SUGGESTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Button type="submit" variant="signal" size="lg" className="sm:w-auto">
          Rechercher
        </Button>
      </div>
    </form>
  );
}
