import Link from "next/link";
import * as LucideIcons from "lucide-react";
import type { Category } from "@/types";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category) => {
        const Icon =
          (category.icon && (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[category.icon]) ||
          LucideIcons.Package;
        return (
          <Link
            key={category.id}
            href={`/categorie/${category.slug}`}
            className="group flex flex-col gap-4 rounded-[14px] border border-line bg-paper p-4 transition-colors hover:border-ink"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-paper-muted text-ink transition-colors group-hover:bg-volt group-hover:text-white">
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-medium leading-snug text-ink">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
