"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { Category } from "@/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AnimatedCategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
    >
      {categories.map((category) => {
        const Icon =
          (category.icon && (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[category.icon]) ||
          LucideIcons.Package;
        return (
          <motion.div key={category.id} variants={item}>
            <Link
              href={`/categorie/${category.slug}`}
              className="group flex flex-col items-center gap-2 rounded-[14px] border border-line p-4 text-center transition-all hover:-translate-y-0.5 hover:border-volt/40 hover:shadow-[0_8px_24px_rgba(124,92,255,0.12)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-muted text-ink transition-colors group-hover:bg-volt-soft group-hover:text-volt-ink">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-ink">{category.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
