"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getListingImageUrl } from "@/lib/supabase/storage";
import type { ListingImage } from "@/types";

export function ImageGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const [activeIndex, setActiveIndex] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[16px] bg-paper-muted text-muted">
        <ImageOff size={32} />
      </div>
    );
  }

  const active = sorted[activeIndex];
  const activeUrl = getListingImageUrl(active.storage_path);

  const goTo = (index: number) => setActiveIndex((index + sorted.length) % sorted.length);

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-paper-muted">
        {activeUrl && (
          <Image
            src={activeUrl}
            alt={`${title} — photo ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow"
            >
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-xs font-medium text-paper">
              {activeIndex + 1} / {sorted.length}
            </span>
          </>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, index) => {
            const thumbUrl = getListingImageUrl(img.storage_path);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] border-2",
                  index === activeIndex ? "border-signal" : "border-transparent"
                )}
              >
                {thumbUrl && (
                  <Image src={thumbUrl} alt="" fill sizes="64px" className="object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
