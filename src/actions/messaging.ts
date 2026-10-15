"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/** Récupère ou crée la conversation acheteur/vendeur pour une annonce, puis y redirige. */
export async function startConversationAction(
  listingId: string,
  sellerId: string,
  initialMessage: string
): Promise<ActionResult<{ conversationId: string }>> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { success: false, message: "Connecte-toi pour contacter le vendeur." };
  }
  if (auth.user.id === sellerId) {
    return { success: false, message: "Tu ne peux pas te contacter toi-même." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", auth.user.id)
    .maybeSingle();

  let conversationId = existing?.id;

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ listing_id: listingId, buyer_id: auth.user.id, seller_id: sellerId })
      .select("id")
      .single();

    if (error || !created) {
      return { success: false, message: "Impossible de démarrer la conversation." };
    }
    conversationId = created.id;
  }

  if (initialMessage.trim()) {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: auth.user.id,
      content: initialMessage.trim(),
    });
  }

  revalidatePath("/messages");
  return { success: true, data: { conversationId } };
}

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult> {
  if (!content.trim()) return { success: false, message: "Le message ne peut pas être vide." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, message: "Non authentifié." };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: auth.user.id,
    content: content.trim(),
  });

  if (error) return { success: false, message: "Message non envoyé." };

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: true };
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  const { data: conv } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) return;

  if (conv.buyer_id === auth.user.id) {
    await supabase.from("conversations").update({ buyer_unread_count: 0 }).eq("id", conversationId);
  } else if (conv.seller_id === auth.user.id) {
    await supabase.from("conversations").update({ seller_unread_count: 0 }).eq("id", conversationId);
  }
}

export async function createOfferAction(
  conversationId: string,
  listingId: string,
  amount: number
): Promise<ActionResult> {
  if (!(amount > 0)) return { success: false, message: "Montant invalide." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, message: "Non authentifié." };

  const { error } = await supabase.from("offers").insert({
    conversation_id: conversationId,
    listing_id: listingId,
    buyer_id: auth.user.id,
    amount,
  });

  if (error) return { success: false, message: "Impossible d'envoyer l'offre." };

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: auth.user.id,
    content: `💰 Offre envoyée : ${amount.toFixed(2)} €`,
  });

  revalidatePath(`/messages/${conversationId}`);
  return { success: true, message: "Offre envoyée." };
}

export async function respondToOfferAction(
  offerId: string,
  conversationId: string,
  accept: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, message: "Non authentifié." };

  const { data: offer, error: fetchError } = await supabase
    .from("offers")
    .select("*")
    .eq("id", offerId)
    .maybeSingle();

  if (fetchError || !offer) return { success: false, message: "Offre introuvable." };

  const { error } = await supabase
    .from("offers")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", offerId);

  if (error) return { success: false, message: "Action impossible." };

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: auth.user.id,
    content: accept
      ? `✅ Offre de ${offer.amount.toFixed(2)} € acceptée.`
      : `❌ Offre de ${offer.amount.toFixed(2)} € refusée.`,
  });

  if (accept) {
    // Trace la vente conclue pour les statistiques vendeur et les futurs avis.
    const { data: conv } = await supabase
      .from("conversations")
      .select("seller_id, buyer_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (conv) {
      await supabase.from("orders").insert({
        listing_id: offer.listing_id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        amount: offer.amount,
        status: "confirmed",
      });
    }
  }

  revalidatePath(`/messages/${conversationId}`);
  return { success: true };
}

export async function goToConversationRedirect(conversationId: string): Promise<never> {
  redirect(`/messages/${conversationId}`);
}
