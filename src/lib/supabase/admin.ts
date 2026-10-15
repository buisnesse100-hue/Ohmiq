import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client Supabase avec la clé service_role : contourne RLS.
 * À utiliser UNIQUEMENT dans du code serveur de confiance (actions admin déjà
 * vérifiées côté serveur, webhooks Stripe, jobs de fond). Ne jamais importer
 * ce module depuis un Client Component : le package "server-only" lèvera une
 * erreur de build si c'est le cas par erreur.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant. Vérifie ton .env.local."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
