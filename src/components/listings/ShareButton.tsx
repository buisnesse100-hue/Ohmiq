"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // L'utilisateur a annulé le partage natif : on ne fait rien de plus.
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line-strong px-4 text-sm font-medium text-ink hover:bg-paper-muted"
    >
      {copied ? <Check size={17} /> : <Share2 size={17} />}
      {copied ? "Lien copié" : "Partager"}
    </button>
  );
}
