"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";
import { zodFieldErrors } from "@/lib/validations/format-errors";
import type { ActionResult } from "@/types";

export async function signUpAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { email, password, displayName, username } = parsed.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/connexion`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        success: false,
        fieldErrors: { email: ["Un compte existe déjà avec cet email."] },
      };
    }
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.",
  };
}

export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      message: "Email ou mot de passe incorrect.",
    };
  }

  const nextPath = formData.get("next");
  revalidatePath("/", "layout");
  redirect(typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/mon-compte");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/mon-compte/nouveau-mot-de-passe`,
  });

  // Message volontairement identique que l'email existe ou non (anti-énumération de comptes).
  return {
    success: true,
    message: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function updatePasswordAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Mot de passe mis à jour." };
}
