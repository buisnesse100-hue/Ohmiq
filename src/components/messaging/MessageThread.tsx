"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, HandCoins } from "lucide-react";
import { sendMessageAction, createOfferAction, respondToOfferAction } from "@/actions/messaging";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Message, Offer } from "@/types";

type ThreadItem =
  | { type: "message"; at: string; message: Message }
  | { type: "offer"; at: string; offer: Offer };

export function MessageThread({
  conversationId,
  listingId,
  currentUserId,
  isSeller,
  messages,
  offers,
  listingStatus,
}: {
  conversationId: string;
  listingId: string;
  currentUserId: string;
  isSeller: boolean;
  messages: Message[];
  offers: Offer[];
  listingStatus: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const items: ThreadItem[] = [
    ...messages.map((m) => ({ type: "message" as const, at: m.created_at, message: m })),
    ...offers.map((o) => ({ type: "offer" as const, at: o.created_at, offer: o })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  const handleSend = () => {
    if (!content.trim()) return;
    const text = content;
    setContent("");
    startTransition(async () => {
      await sendMessageAction(conversationId, text);
      router.refresh();
    });
  };

  const handleOffer = () => {
    const amount = Number(offerAmount);
    if (!(amount > 0)) return;
    startTransition(async () => {
      await createOfferAction(conversationId, listingId, amount);
      setShowOfferInput(false);
      setOfferAmount("");
      router.refresh();
    });
  };

  const handleRespond = (offerId: string, accept: boolean) => {
    startTransition(async () => {
      await respondToOfferAction(offerId, conversationId, accept);
      router.refresh();
    });
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-[16px] border border-line">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {items.map((item) =>
          item.type === "message" ? (
            <MessageBubble key={item.message.id} message={item.message} isOwn={item.message.sender_id === currentUserId} />
          ) : (
            <OfferBubble
              key={item.offer.id}
              offer={item.offer}
              isBuyer={!isSeller}
              canRespond={isSeller && item.offer.status === "pending"}
              onRespond={handleRespond}
              isPending={isPending}
            />
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-line p-3">
        {showOfferInput && (
          <div className="mb-2 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Montant en €"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />
            <Button variant="signal" onClick={handleOffer} disabled={isPending}>
              Envoyer
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!isSeller && listingStatus === "active" && (
            <button
              type="button"
              onClick={() => setShowOfferInput((v) => !v)}
              aria-label="Faire une offre"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-line-strong text-ink hover:bg-paper-muted"
            >
              <HandCoins size={18} />
            </button>
          )}
          <Input
            placeholder="Écris un message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isPending || !content.trim()}
            aria-label="Envoyer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-ink text-paper disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-[14px] px-3.5 py-2 text-sm",
          isOwn ? "bg-ink text-paper" : "bg-paper-muted text-ink"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function OfferBubble({
  offer,
  canRespond,
  onRespond,
  isPending,
}: {
  offer: Offer;
  isBuyer: boolean;
  canRespond: boolean;
  onRespond: (offerId: string, accept: boolean) => void;
  isPending: boolean;
}) {
  const statusLabel: Record<string, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    declined: "Refusée",
    expired: "Expirée",
    withdrawn: "Retirée",
  };

  return (
    <div className="mx-auto max-w-xs rounded-[14px] border border-volt/30 bg-volt-soft p-3 text-center">
      <p className="font-display text-lg font-semibold text-volt-ink">{formatPrice(offer.amount)}</p>
      <p className="text-xs text-volt-ink/80">Offre · {statusLabel[offer.status]}</p>
      {canRespond && (
        <div className="mt-2 flex justify-center gap-2">
          <Button size="sm" variant="signal" disabled={isPending} onClick={() => onRespond(offer.id, true)}>
            Accepter
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => onRespond(offer.id, false)}>
            Refuser
          </Button>
        </div>
      )}
    </div>
  );
}
