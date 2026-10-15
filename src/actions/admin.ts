"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";
import type { ReportStatus } from "@/types/database";

/**
 * Vérifie côté serveur que l'utilisateur courant est bien admin avant toute action.
 * Ne fait JAMAIS confiance à un état ou un rôle transmis depuis le frontend :
 * relit le rôle en base à chaque appel.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("UNAUTHENTICATED");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_banned) {
    throw new Error("FORBIDDEN");
  }

  return { supabase, adminId: auth.user.id };
}

async function logAdminAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  actionType: string,
  targetType: string,
  targetId: string,
  reason?: string
) {
  await supabase.from("admin_actions").insert({
    admin_id: adminId,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    reason: reason ?? null,
  });
}

export async function adminHideListingAction(listingId: string, reason?: string): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const { error } = await supabase.from("listings").update({ status: "hidden" }).eq("id", listingId);
    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(supabase, adminId, "hide_listing", "listing", listingId, reason);
    revalidatePath("/admin");
    return { success: true, message: "Annonce masquée." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}

export async function adminRestoreListingAction(listingId: string): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const { error } = await supabase.from("listings").update({ status: "active" }).eq("id", listingId);
    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(supabase, adminId, "restore_listing", "listing", listingId);
    revalidatePath("/admin");
    return { success: true, message: "Annonce restaurée." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}

export async function adminDeleteListingAction(listingId: string, reason?: string): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const { error } = await supabase.from("listings").update({ status: "deleted" }).eq("id", listingId);
    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(supabase, adminId, "delete_listing", "listing", listingId, reason);
    revalidatePath("/admin");
    return { success: true, message: "Annonce supprimée." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}

export async function adminBanUserAction(
  userId: string,
  reason: string,
  durationDays?: number
): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const bannedUntil = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null; // null = définitif

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true, banned_until: bannedUntil, ban_reason: reason })
      .eq("id", userId);

    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(
      supabase,
      adminId,
      durationDays ? "ban_user_temporary" : "ban_user_permanent",
      "user",
      userId,
      reason
    );
    revalidatePath("/admin");
    return { success: true, message: "Utilisateur banni." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}

export async function adminUnbanUserAction(userId: string): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: false, banned_until: null, ban_reason: null })
      .eq("id", userId);

    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(supabase, adminId, "unban_user", "user", userId);
    revalidatePath("/admin");
    return { success: true, message: "Utilisateur débanni." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}

export async function adminHandleReportAction(
  reportId: string,
  status: ReportStatus
): Promise<ActionResult> {
  try {
    const { supabase, adminId } = await requireAdmin();
    const { error } = await supabase
      .from("reports")
      .update({ status, handled_by: adminId, handled_at: new Date().toISOString() })
      .eq("id", reportId);

    if (error) return { success: false, message: "Action impossible." };

    await logAdminAction(supabase, adminId, `report_${status}`, "report", reportId);
    revalidatePath("/admin");
    return { success: true, message: "Signalement traité." };
  } catch {
    return { success: false, message: "Accès refusé." };
  }
}
