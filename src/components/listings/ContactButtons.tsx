"use client";

import { Phone, MessageCircle, Mail } from "lucide-react";
import { buildTelLink, buildWhatsappLink, buildMailtoLink, getOrCreateAnonSessionId } from "@/lib/utils";
import { recordListingEventAction } from "@/actions/interactions";
import type { Listing } from "@/types";

interface ContactButtonsProps {
  listing: Pick<
    Listing,
    | "id"
    | "title"
    | "slug"
    | "contact_phone"
    | "contact_phone_public"
    | "contact_whatsapp"
    | "contact_whatsapp_public"
    | "contact_email"
    | "contact_email_public"
  >;
}

export function ContactButtons({ listing }: ContactButtonsProps) {
  const track = (eventType: "call_click" | "whatsapp_click" | "email_click") => {
    const sessionId = getOrCreateAnonSessionId();
    void recordListingEventAction(listing.id, eventType, sessionId);
  };

  const showPhone = listing.contact_phone_public && listing.contact_phone;
  const showWhatsapp = listing.contact_whatsapp_public && listing.contact_whatsapp;
  const showEmail = listing.contact_email_public && listing.contact_email;

  if (!showPhone && !showWhatsapp && !showEmail) {
    return (
      <p className="rounded-[10px] bg-paper-muted p-3 text-sm text-muted">
        Le vendeur n&apos;a rendu aucun moyen de contact public pour cette annonce.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {showPhone && (
        <a
          href={buildTelLink(listing.contact_phone!)}
          onClick={() => track("call_click")}
          className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-ink text-[17px] font-semibold text-paper active:scale-[0.99]"
        >
          <Phone size={20} /> Appeler
        </a>
      )}
      {showWhatsapp && (
        <a
          href={buildWhatsappLink(
            listing.contact_whatsapp!,
            `Bonjour, votre annonce "${listing.title}" sur OHMIQ m'intéresse.`
          )}
          onClick={() => track("whatsapp_click")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-[#1FAA59] text-[17px] font-semibold text-white active:scale-[0.99]"
        >
          <MessageCircle size={20} /> WhatsApp
        </a>
      )}
      {showEmail && (
        <a
          href={buildMailtoLink(
            listing.contact_email!,
            `Votre annonce "${listing.title}" sur OHMIQ`,
            "Bonjour, votre annonce m'intéresse. Est-elle toujours disponible ?"
          )}
          onClick={() => track("email_click")}
          className="flex h-14 items-center justify-center gap-2 rounded-[10px] border border-line-strong text-[17px] font-semibold text-ink active:scale-[0.99]"
        >
          <Mail size={20} /> Email
        </a>
      )}
    </div>
  );
}
