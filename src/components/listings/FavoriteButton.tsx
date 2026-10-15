"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/actions/interactions";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  listingId,
  initialFavorited,
  isAuthenticated,
}: {
  listingId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
}) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/connexion?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsFavorited((prev) => !prev); // optimiste
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId);
      if (result.success && result.data) {
        setIsFavorited(result.data.isFavorited);
      } else {
        setIsFavorited((prev) => !prev); // rollback si échec
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorited}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors",
        isFavorited
          ? "border-signal bg-signal-soft text-signal-ink"
          : "border-line-strong text-ink hover:bg-paper-muted"
      )}
    >
      <Heart size={17} fill={isFavorited ? "currentColor" : "none"} />
      {isFavorited ? "Dans vos favoris" : "Ajouter aux favoris"}
    </button>
  );
}
