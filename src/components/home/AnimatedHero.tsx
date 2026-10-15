"use client";

import { motion } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import type { Category } from "@/types";

const floatingChips = [
  { label: "RTX 4070", top: "18%", left: "8%", delay: 0 },
  { label: "iPhone 15 Pro", top: "68%", left: "6%", delay: 0.4 },
  { label: "PS5", top: "22%", left: "84%", delay: 0.8 },
  { label: "Aspirateur robot", top: "72%", left: "82%", delay: 1.2 },
];

export function AnimatedHero({ categories }: { categories: Category[] }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-ink px-4 py-20 text-paper sm:px-6 sm:py-28">
      {/* Fond : grille + orbes dégradés animés */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--volt) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--cyan) 0%, transparent 70%)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Chips produits flottants (décor, masqués sur mobile pour rester lisible) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {floatingChips.map((chip) => (
          <motion.div
            key={chip.label}
            className="absolute rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-paper/80 backdrop-blur-sm"
            style={{ top: chip.top, left: chip.left }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: chip.delay },
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
            }}
          >
            {chip.label}
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-paper/80 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
          Nouveau · marketplace électronique nouvelle génération
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl font-bold tracking-tight sm:text-7xl"
        >
          {SITE_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gradient mt-3 font-display text-xl font-semibold sm:text-2xl"
        >
          {SITE_TAGLINE}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-5 max-w-xl text-balance text-base text-paper/70 sm:text-lg"
        >
          Smartphones, PC, gaming, électroménager, outillage électrique : achetez et vendez de
          l&apos;électronique d&apos;occasion, avec une estimation de prix pour repérer les vraies
          bonnes affaires.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-9"
        >
          <SearchBar categories={categories} />
        </motion.div>
      </div>
    </section>
  );
}
