"use client";

import { useEffect, useRef } from "react";
import { getOrCreateAnonSessionId } from "@/lib/utils";
import { recordListingEventAction } from "@/actions/interactions";

export function ViewTracker({ listingId }: { listingId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const sessionId = getOrCreateAnonSessionId();
    void recordListingEventAction(listingId, "view", sessionId);
  }, [listingId]);

  return null;
}
