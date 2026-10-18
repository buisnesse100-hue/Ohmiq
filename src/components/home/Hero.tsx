"use client";

import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { SearchBar } from "@/components/search/SearchBar";
import { ScannerCard } from "@/components/home/ScannerCard";
import type { Category } from "@/types";

const HEADLINE = ["L'électronique d'occasion,", "avec la fiche technique", "qui va avec."];

const EXAMPLE_SEARCHES = ["RTX 4070 moins de 400 €", "iPhone 14 sous 500 €", "aspirateur robot"];

/* Pistes de circuit imprimé : tracées une fois au chargement (le « démarrage » de la page). */
const TRACES = [
  "M0 90 H210 L250 130 H470 L500 100 H640",
  "M0 230 H120 L160 270 H330 L360 300 H420",
  "M0 560 H260 L300 520 H520 L550 550 H760",
  "M1200 80 H980 L940 120 H820 L790 90 H700",
  "M1200 330 H1040 L1000 370 H900",
  "M1200 600 H950 L910 560 H760 L730 590 H640",
];
const NODES: Array<[number, number]> = [
  [640, 100],
  [420, 300],
  [760, 550],
  [700, 90],
  [900, 370],
  [640, 590],
];

export function Hero({ categories }: { categories: Category[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative overflow-hidden bg-ink text-paper">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {TRACES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              stroke="var(--volt)"
              strokeWidth="1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.95, 0.2] }}
              transition={{ duration: 2.4, delay: i * 0.18, times: [0, 0.55, 1], ease: "easeOut" }}
            />
          ))}
          {NODES.map(([cx, cy], i) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="4"
              fill="var(--volt)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.35] }}
              transition={{ duration: 1.2, delay: 1.2 + i * 0.18 }}
            />
          ))}
        </svg>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <h1 className="font-display text-[40px] font-bold leading-[1.04] tracking-tight sm:text-6xl">
              {HEADLINE.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.75, delay: 0.5 + i * 0.13, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="mt-5 max-w-lg text-lg text-paper/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              Smartphones, PC, consoles, électroménager, outillage. Chaque annonce affiche les
              caractéristiques qui comptent, et son prix est comparé au marché.
            </motion.p>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.6 }}
            >
              <SearchBar categories={categories} />
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-paper/60">
                Essaie :
                {EXAMPLE_SEARCHES.map((example) => (
                  <Link
                    key={example}
                    href={`/search?q=${encodeURIComponent(example)}`}
                    className="rounded-full border border-white/15 px-3 py-1 text-paper/80 transition-colors hover:border-white/40 hover:bg-white/10"
                  >
                    {example}
                  </Link>
                ))}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ScannerCard />
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
