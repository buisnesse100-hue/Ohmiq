import Link from "next/link";
import type { Brand } from "@/types";

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const list = brands.filter((b) => b.slug !== "autre");
  if (list.length === 0) return null;

  return (
    <div className="marquee overflow-hidden border-b border-line bg-paper py-5" aria-label="Marques disponibles">
      <ul className="marquee-track">
        {[...list, ...list].map((brand, i) => (
          <li key={`${brand.id}-${i}`} aria-hidden={i >= list.length}>
            <Link
              href={`/search?brand=${brand.slug}`}
              tabIndex={i >= list.length ? -1 : 0}
              className="block px-8 font-display text-xl font-semibold text-ink/35 transition-colors hover:text-ink"
            >
              {brand.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
