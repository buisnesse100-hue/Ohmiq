"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildListingImagePath, LISTING_IMAGES_BUCKET } from "@/lib/supabase/storage";
import { MAX_LISTING_IMAGES } from "@/lib/validations/listing";
import type { ActionResult } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadListingImageAction(
  listingId: string,
  formData: FormData
): Promise<ActionResult<{ id: string; storagePath: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, message: "Fichier invalide." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Formats acceptés : JPEG, PNG, WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { success: false, message: "L'image doit faire moins de 5 Mo." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, message: "Non authentifié." };

  // Vérifie la propriété de l'annonce et le nombre d'images déjà présentes.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.seller_id !== auth.user.id) {
    return { success: false, message: "Annonce introuvable ou accès refusé." };
  }

  const { count } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if ((count ?? 0) >= MAX_LISTING_IMAGES) {
    return { success: false, message: `Maximum ${MAX_LISTING_IMAGES} photos par annonce.` };
  }

  const path = buildListingImagePath(auth.user.id, listingId, file.name);
  const { error: uploadError } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadListingImageAction]", uploadError.message);
    return { success: false, message: "Échec de l'envoi de l'image." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("listing_images")
    .insert({
      listing_id: listingId,
      storage_path: path,
      display_order: count ?? 0,
      is_primary: (count ?? 0) === 0,
    })
    .select("id, storage_path")
    .single();

  if (insertError || !inserted) {
    await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]);
    return { success: false, message: "Échec de l'enregistrement de l'image." };
  }

  revalidatePath("/publier");
  revalidatePath("/mes-annonces");
  return { success: true, data: { id: inserted.id, storagePath: inserted.storage_path } };
}

export async function deleteListingImageAction(imageId: string, listingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("listing_images")
    .select("storage_path")
    .eq("id", imageId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (!image) return { success: false, message: "Image introuvable." };

  const { error: deleteRowError } = await supabase.from("listing_images").delete().eq("id", imageId);
  if (deleteRowError) return { success: false, message: "Suppression impossible." };

  await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([image.storage_path]);

  revalidatePath("/mes-annonces");
  revalidatePath(`/publier`);
  return { success: true };
}

export async function setPrimaryListingImageAction(imageId: string, listingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listing_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("listing_id", listingId);

  if (error) return { success: false, message: "Action impossible." };

  revalidatePath("/mes-annonces");
  return { success: true };
}

export async function reorderListingImagesAction(
  listingId: string,
  orderedImageIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient();

  const updates = orderedImageIds.map((id, index) =>
    supabase.from("listing_images").update({ display_order: index }).eq("id", id).eq("listing_id", listingId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) return { success: false, message: "Réorganisation impossible." };

  return { success: true };
}
