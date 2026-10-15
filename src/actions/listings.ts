"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { listingFormSchema } from "@/lib/validations/listing";
import { zodFieldErrors } from "@/lib/validations/format-errors";
import type { ActionResult } from "@/types";

const MAX_LISTINGS_PER_DAY = 10; // anti-spam : limite raisonnable de créations par 24h

function parseListingFormData(formData: FormData) {
  const attributesRaw = formData.get("attributesJson");
  let attributes: Record<string, string> = {};
  if (typeof attributesRaw === "string" && attributesRaw) {
    try {
      attributes = JSON.parse(attributesRaw);
    } catch {
      attributes = {};
    }
  }

  return {
    title: formData.get("title"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    isNegotiable: formData.get("isNegotiable") === "on",
    categoryId: formData.get("categoryId"),
    subcategoryId: formData.get("subcategoryId") || null,
    brandId: formData.get("brandId") || null,
    modelId: formData.get("modelId") || null,
    city: formData.get("city"),
    postalCode: formData.get("postalCode") ?? "",
    condition: formData.get("condition"),
    deliveryAvailable: formData.get("deliveryAvailable") === "on",
    hasInvoice: formData.get("hasInvoice") === "on",
    hasWarranty: formData.get("hasWarranty") === "on",
    warrantyUntil: formData.get("warrantyUntil") ?? "",
    purchaseDate: formData.get("purchaseDate") ?? "",
    knownDefects: formData.get("knownDefects") ?? "",
    accessoriesIncluded: formData.get("accessoriesIncluded") ?? "",
    serialNumber: formData.get("serialNumber") ?? "",
    attributes,
    contactPhone: formData.get("contactPhone") ?? "",
    contactPhonePublic: formData.get("contactPhonePublic") === "on",
    contactWhatsapp: formData.get("contactWhatsapp") ?? "",
    contactWhatsappPublic: formData.get("contactWhatsappPublic") === "on",
    contactEmail: formData.get("contactEmail") ?? "",
    contactEmailPublic: formData.get("contactEmailPublic") === "on",
  };
}

/** Remplace toutes les valeurs d'attributs dynamiques d'une annonce (upsert simple). */
async function saveListingAttributes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  attributes: Record<string, string>
) {
  const entries = Object.entries(attributes).filter(([, value]) => value !== undefined && value !== "");
  if (entries.length === 0) return;

  await supabase.from("listing_attribute_values").delete().eq("listing_id", listingId);
  const rows = entries.map(([attributeId, value]) => ({
    listing_id: listingId,
    attribute_id: attributeId,
    value: String(value),
  }));
  await supabase.from("listing_attribute_values").insert(rows);
}

export async function createListingAction(
  _prev: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = listingFormSchema.safeParse(parseListingFormData(formData));
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { success: false, message: "Tu dois être connecté pour publier une annonce." };
  }

  // Anti-spam : limite raisonnable de créations par jour (défense en profondeur, en plus des RLS).
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", auth.user.id)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_LISTINGS_PER_DAY) {
    return {
      success: false,
      message: `Tu as atteint la limite de ${MAX_LISTINGS_PER_DAY} annonces par 24h. Réessaie plus tard.`,
    };
  }

  const d = parsed.data;
  const { data: inserted, error } = await supabase
    .from("listings")
    .insert({
      seller_id: auth.user.id,
      title: d.title,
      description: d.description,
      price: d.price,
      is_negotiable: d.isNegotiable,
      category_id: d.categoryId,
      subcategory_id: d.subcategoryId || null,
      brand_id: d.brandId || null,
      model_id: d.modelId || null,
      city: d.city,
      postal_code: d.postalCode || null,
      condition: d.condition,
      delivery_available: d.deliveryAvailable,
      has_invoice: d.hasInvoice,
      has_warranty: d.hasWarranty,
      warranty_until: d.warrantyUntil || null,
      purchase_date: d.purchaseDate || null,
      known_defects: d.knownDefects || null,
      accessories_included: d.accessoriesIncluded || null,
      serial_number: d.serialNumber || null,
      contact_phone: d.contactPhone || null,
      contact_phone_public: d.contactPhonePublic,
      contact_whatsapp: d.contactWhatsapp || null,
      contact_whatsapp_public: d.contactWhatsappPublic,
      contact_email: d.contactEmail || null,
      contact_email_public: d.contactEmailPublic,
      status: "active",
    })
    .select("id, slug")
    .single();

  if (error || !inserted) {
    console.error("[createListingAction]", error?.message);
    return { success: false, message: "Une erreur est survenue lors de la publication." };
  }

  await saveListingAttributes(supabase, inserted.id, d.attributes);

  revalidatePath("/");
  revalidatePath("/mes-annonces");
  // Pas de redirect() ici : le client doit d'abord uploader les photos avec cet id,
  // puis redirige lui-même vers la page de l'annonce (voir PublishListingClient).
  return { success: true, data: { id: inserted.id, slug: inserted.slug } };
}

export async function updateListingAction(
  listingId: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = listingFormSchema.safeParse(parseListingFormData(formData));
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const d = parsed.data;

  const { data: slugRow, error } = await supabase
    .from("listings")
    .update({
      title: d.title,
      description: d.description,
      price: d.price,
      is_negotiable: d.isNegotiable,
      category_id: d.categoryId,
      subcategory_id: d.subcategoryId || null,
      brand_id: d.brandId || null,
      model_id: d.modelId || null,
      city: d.city,
      postal_code: d.postalCode || null,
      condition: d.condition,
      delivery_available: d.deliveryAvailable,
      has_invoice: d.hasInvoice,
      has_warranty: d.hasWarranty,
      warranty_until: d.warrantyUntil || null,
      purchase_date: d.purchaseDate || null,
      known_defects: d.knownDefects || null,
      accessories_included: d.accessoriesIncluded || null,
      serial_number: d.serialNumber || null,
      contact_phone: d.contactPhone || null,
      contact_phone_public: d.contactPhonePublic,
      contact_whatsapp: d.contactWhatsapp || null,
      contact_whatsapp_public: d.contactWhatsappPublic,
      contact_email: d.contactEmail || null,
      contact_email_public: d.contactEmailPublic,
    })
    .eq("id", listingId)
    .select("id, slug")
    .single();
  // Sécurité : RLS "listings_update_own" garantit que seul le vendeur (ou un admin) peut modifier.

  if (error || !slugRow) {
    return { success: false, message: "Impossible de modifier cette annonce." };
  }

  await saveListingAttributes(supabase, slugRow.id, d.attributes);

  revalidatePath(`/annonce/${slugRow.slug}`);
  revalidatePath("/mes-annonces");
  return { success: true, message: "Annonce mise à jour." };
}

export async function markListingAsSoldAction(listingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status: "sold" }).eq("id", listingId);
  if (error) return { success: false, message: "Action impossible." };

  revalidatePath("/mes-annonces");
  return { success: true, message: "Annonce marquée comme vendue." };
}

export async function republishListingAction(listingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("listings").update({ status: "active" }).eq("id", listingId);
  if (error) return { success: false, message: "Action impossible." };

  revalidatePath("/mes-annonces");
  return { success: true, message: "Annonce republiée." };
}

export async function deleteListingAction(listingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  // Soft-delete : on conserve la ligne (statistiques, signalements) mais on la masque partout.
  const { error } = await supabase.from("listings").update({ status: "deleted" }).eq("id", listingId);
  if (error) return { success: false, message: "Action impossible." };

  revalidatePath("/mes-annonces");
  return { success: true, message: "Annonce supprimée." };
}
