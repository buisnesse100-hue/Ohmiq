"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations/misc";
import { zodFieldErrors } from "@/lib/validations/format-errors";
import type { ActionResult } from "@/types";

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = profileUpdateSchema.safeParse({
    displayName: formData.get("displayName"),
    city: formData.get("city") ?? "",
    bio: formData.get("bio") ?? "",
    phone: formData.get("phone") ?? "",
    isProfessional: formData.get("isProfessional") === "on",
    companyName: formData.get("companyName") ?? "",
    siret: formData.get("siret") ?? "",
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { success: false, message: "Non authentifié." };

  const d = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: d.displayName,
      city: d.city || null,
      bio: d.bio || null,
      phone: d.phone || null,
      is_professional: d.isProfessional,
      company_name: d.companyName || null,
      siret: d.siret || null,
    })
    .eq("id", auth.user.id);

  if (error) return { success: false, message: "Impossible de mettre à jour le profil." };

  revalidatePath("/mon-compte");
  revalidatePath("/pro");
  return { success: true, message: "Profil mis à jour." };
}
