"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 24, stiffness: 60 });

  useEffect(() => {
    if (isInView) motionValue.set(to);
  }, [isInView, to, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${Math.round(latest).toLocaleString("fr-FR")}${suffix}`;
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { to: 18, suffix: "", label: "Catégories tech" },
  { to: 184, suffix: "+", label: "Sous-catégories" },
  { to: 100, suffix: "%", label: "Gratuit pour vendre" },
  { to: 0, suffix: " €", label: "Commission cachée" },
];

export function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 gap-6 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">
            <Counter to={stat.to} suffix={stat.suffix} />
          </p>
          <p className="mt-1 text-sm text-muted">{stat.label}</p>
        </div>
      ))}
    </motion.div>
  );
}
