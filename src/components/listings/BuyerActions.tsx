"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, HandCoins, X } from "lucide-react";
import { startConversationAction, createOfferAction } from "@/actions/messaging";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";

export function BuyerActions({
  listingId,
  sellerId,
  listingTitle,
  price,
  isNegotiable,
  isAuthenticated,
  isOwnListing,
}: {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  price: number;
  isNegotiable: boolean;
  isAuthenticated: boolean;
  isOwnListing: boolean;
}) {
  const router = useRouter();
  const [showMessage, setShowMessage] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [message, setMessage] = useState(`Bonjour, votre annonce "${listingTitle}" m'intéresse.`);
  const [offerAmount, setOfferAmount] = useState(String(Math.round(price * 0.9)));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isOwnListing) return null;

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push(`/connexion?next=${encodeURIComponent(window.location.pathname)}`);
      return false;
    }
    return true;
  };

  const handleSendMessage = () => {
    if (!requireAuth()) return;
    setError(null);
    startTransition(async () => {
      const result = await startConversationAction(listingId, sellerId, message);
      if (result.success && result.data) {
        router.push(`/messages/${result.data.conversationId}`);
      } else {
        setError(result.message ?? "Une erreur est survenue.");
      }
    });
  };

  const handleSendOffer = () => {
    if (!requireAuth()) return;
    const amount = Number(offerAmount);
    if (!(amount > 0)) {
      setError("Indique un montant valide.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const convResult = await startConversationAction(listingId, sellerId, "");
      if (!convResult.success || !convResult.data) {
        setError(convResult.message ?? "Une erreur est survenue.");
        return;
      }
      const offerResult = await createOfferAction(convResult.data.conversationId, listingId, amount);
      if (offerResult.success) {
        router.push(`/messages/${convResult.data.conversationId}`);
      } else {
        setError(offerResult.message ?? "Une erreur est survenue.");
      }
    });
  };

  return (
    <div className="space-y-2.5">
      <Button variant="signal" size="lg" fullWidth onClick={() => setShowMessage(true)}>
        <MessageSquare size={18} /> Envoyer un message
      </Button>
      {isNegotiable && (
        <Button variant="outline" size="lg" fullWidth onClick={() => setShowOffer(true)}>
          <HandCoins size={18} /> Faire une offre
        </Button>
      )}

      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-[16px] bg-paper p-5 sm:rounded-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Envoyer un message</h2>
              <button type="button" onClick={() => setShowMessage(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <Field htmlFor="message">Ton message</Field>
              <Textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <Button variant="signal" fullWidth className="mt-4" onClick={handleSendMessage} disabled={isPending}>
              {isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
      )}

      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-[16px] bg-paper p-5 sm:rounded-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Faire une offre</h2>
              <button type="button" onClick={() => setShowOffer(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">Prix demandé : {formatPrice(price)}</p>
            <div className="mt-3">
              <Field htmlFor="offerAmount">Ton offre (€)</Field>
              <Input
                id="offerAmount"
                type="number"
                min={0}
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <Button variant="signal" fullWidth className="mt-4" onClick={handleSendOffer} disabled={isPending}>
              {isPending ? "Envoi..." : "Envoyer l'offre"}
            </Button>
            <p className="mt-2 text-xs text-muted">
              L&apos;offre expire automatiquement après 48h si le vendeur ne répond pas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
