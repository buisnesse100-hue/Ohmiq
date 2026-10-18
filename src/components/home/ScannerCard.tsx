"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TrendingDown, Minus } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

/* Trois silhouettes dessinées en SVG : carte graphique, smartphone, aspirateur robot. */
function GpuArt() {
  return (
    <svg viewBox="0 0 320 200" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <rect x="22" y="62" width="276" height="88" rx="10" />
      <rect x="10" y="70" width="12" height="72" rx="3" />
      <circle cx="98" cy="106" r="34" />
      <circle cx="98" cy="106" r="9" />
      <path d="M98 72v16M98 124v16M64 106h16M116 106h16M74 82l11 11M111 119l11 11M122 82l-11 11M85 119l-11 11" />
      <circle cx="210" cy="106" r="34" />
      <circle cx="210" cy="106" r="9" />
      <path d="M210 72v16M210 124v16M176 106h16M228 106h16M186 82l11 11M223 119l11 11M234 82l-11 11M197 119l-11 11" />
      <path d="M44 150v14h92v-14M180 150v14h92v-14" />
      <rect x="262" y="76" width="26" height="10" rx="2" />
    </svg>
  );
}

function PhoneArt() {
  return (
    <svg viewBox="0 0 320 200" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <rect x="108" y="12" width="104" height="176" rx="20" />
      <rect x="116" y="22" width="88" height="156" rx="13" />
      <rect x="146" y="28" width="28" height="7" rx="3.5" />
      <rect x="124" y="46" width="34" height="34" rx="9" />
      <circle cx="134" cy="56" r="5" />
      <circle cx="148" cy="56" r="5" />
      <circle cx="134" cy="70" r="5" />
      <path d="M214 60h5M214 78h5" />
    </svg>
  );
}

function RobotArt() {
  return (
    <svg viewBox="0 0 320 200" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
      <circle cx="160" cy="104" r="76" />
      <circle cx="160" cy="104" r="52" />
      <circle cx="160" cy="104" r="15" />
      <path d="M160 89v-9M160 128v-9M145 104h-9M184 104h-9" />
      <path d="M96 62a76 76 0 0 1 128 0" />
      <path d="M100 150l-12 12M220 150l12 12" />
      <rect x="132" y="168" width="56" height="10" rx="5" />
    </svg>
  );
}

interface Device {
  name: string;
  condition: string;
  art: ReactNode;
  specs: string[];
  asked: number;
  estimate: number;
}

const DEVICES: Device[] = [
  {
    name: "RTX 4070 12 Go",
    condition: "Comme neuve",
    art: <GpuArt />,
    specs: ["12 Go de VRAM", "Bus 192 bits", "200 W", "Garantie 8 mois"],
    asked: 380,
    estimate: 450,
  },
  {
    name: "iPhone 14 128 Go",
    condition: "Très bon état",
    art: <PhoneArt />,
    specs: ["128 Go", "Batterie 91 %", "Écran parfait", "Facture"],
    asked: 520,
    estimate: 590,
  },
  {
    name: "Aspirateur robot",
    condition: "Bon état",
    art: <RobotArt />,
    specs: ["150 min d'autonomie", "Station de vidage", "Garantie 1 an", "Brosses neuves"],
    asked: 245,
    estimate: 260,
  },
];

const CHIP_POSITIONS = ["left-2 top-3", "right-2 top-12", "left-3 bottom-4", "right-2 bottom-3"];

function verdictFor(asked: number, estimate: number) {
  const gapPercent = ((estimate - asked) / estimate) * 100;
  if (gapPercent >= 25) return { label: "Très bonne affaire", good: true };
  if (gapPercent >= 10) return { label: "Bonne affaire", good: true };
  return { label: "Prix cohérent avec le marché", good: false };
}

export function ScannerCard() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const device = DEVICES[index];
  const verdict = verdictFor(device.asked, device.estimate);
  const gap = device.estimate - device.asked;

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % DEVICES.length), 7000);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <div className="relative rounded-[22px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={device.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-display text-xl font-semibold text-paper">{device.name}</p>
            <p className="text-sm text-paper/60">{device.condition}</p>
          </motion.div>
        </AnimatePresence>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-paper/70">
          Exemple illustratif
        </span>
      </div>

      {/* Zone de scan */}
      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[14px] border border-white/10 bg-black/25 text-paper/75">
        <div className="absolute inset-0 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={device.name}
              className="h-full w-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35 }}
            >
              {device.art}
            </motion.div>
          </AnimatePresence>
        </div>

        {!reduced && (
          <motion.div
            key={`beam-${device.name}`}
            aria-hidden
            className="absolute inset-x-0 h-0.5 bg-[var(--cyan)] shadow-[0_0_18px_4px_rgba(0,224,255,0.5)]"
            initial={{ top: "4%" }}
            animate={{ top: ["4%", "96%", "4%"] }}
            transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
          />
        )}

        {device.specs.map((spec, i) => (
          <motion.span
            key={`${device.name}-${spec}`}
            className={cn(
              "absolute rounded-full border border-white/20 bg-ink/80 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur-sm",
              CHIP_POSITIONS[i]
            )}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduced ? 0 : 0.6 + i * 0.5, duration: 0.3 }}
          >
            {spec}
          </motion.span>
        ))}
      </div>

      {/* Comparaison au prix du marché */}
      <div className="mt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-paper/55">Prix demandé</p>
            <p className="tabular font-display text-3xl font-bold text-paper">{formatPrice(device.asked)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-paper/55">Estimation du marché</p>
            <p className="tabular text-lg font-semibold text-paper/75">{formatPrice(device.estimate)}</p>
          </div>
        </div>

        <div className="relative mt-3 h-2 rounded-full bg-white/10">
          <motion.div
            key={`bar-${device.name}`}
            className={cn("h-full rounded-full", verdict.good ? "bg-[var(--cyan)]" : "bg-paper/50")}
            initial={{ width: 0 }}
            animate={{ width: `${(device.asked / device.estimate) * 100}%` }}
            transition={{ duration: 1, delay: reduced ? 0 : 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          {verdict.good ? (
            <TrendingDown size={16} className="text-[var(--cyan)]" />
          ) : (
            <Minus size={16} className="text-paper/60" />
          )}
          <span className="font-medium text-paper">{verdict.label}</span>
          {gap > 0 && <span className="tabular text-paper/55">· {formatPrice(gap)} sous l&apos;estimation</span>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] leading-snug text-paper/45">
          L&apos;estimation n&apos;apparaît que si elle repose sur assez d&apos;annonces comparables.
        </p>
        <div className="flex shrink-0 gap-1.5">
          {DEVICES.map((d, i) => (
            <button
              key={d.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir l'exemple : ${d.name}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-paper" : "w-1.5 bg-paper/30 hover:bg-paper/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
