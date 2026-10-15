"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reportFormSchema } from "@/lib/validations/misc";
import type { ActionResult } from "@/types";
import type { ListingEventType } from "@/types/database";

export async function toggleFavoriteAction(listingId: string): Promise<ActionResult<{ isFavorited: boolean }>> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { success: false, message: "Connecte-toi pour ajouter des favoris." };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", auth.user.id).eq("listing_id", listingId);
    revalidatePath("/favoris");
    return { success: true, data: { isFavorited: false } };
  }

  const { error } = await supabase.from("favorites").insert({ user_id: auth.user.id, listing_id: listingId });
  if (error) return { success: false, message: "Action impossible." };

  revalidatePath("/favoris");
  return { success: true, data: { isFavorited: true } };
}

export async function submitReportAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = reportFormSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { success: false, message: "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase.from("reports").insert({
    listing_id: parsed.data.listingId,
    reporter_id: auth.user?.id ?? null,
    reason: parsed.data.reason,
    message: parsed.data.message || null,
  });

  if (error) {
    // Contrainte unique (listing_id, reporter_id) -> déjà signalé par cet utilisateur
    if (error.code === "23505") {
      return { success: false, message: "Tu as déjà signalé cette annonce." };
    }
    return { success: false, message: "Impossible d'envoyer le signalement." };
  }

  return { success: true, message: "Merci, ton signalement a bien été envoyé et sera examiné." };
}

/** Enregistre un événement (vue, clic appel/whatsapp/email) avec dédup anti-spam côté serveur. */
export async function recordListingEventAction(
  listingId: string,
  eventType: ListingEventType,
  sessionId: string
): Promise<{ recorded: boolean }> {
  if (!sessionId) return { recorded: false };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("record_listing_event", {
    p_listing_id: listingId,
    p_event_type: eventType,
    p_viewer_id: auth.user?.id ?? null,
    p_session_id: sessionId,
  });

  if (error) {
    console.error("[recordListingEventAction]", error.message);
    return { recorded: false };
  }

  return { recorded: Boolean(data) };
}
