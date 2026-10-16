import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

// phone / ban_reason / banned_until ne sont pas lisibles via l'API publique (voir migration).
const PROFILE_COLUMNS =
  "id, username, display_name, avatar_url, city, bio, phone_verified, email_verified, role, is_banned, listing_count, rating, is_professional, company_name, siret, professional_verified, sales_count, rating_average, rating_count, created_at, updated_at";

const PRIVATE_NULLS = { phone: null, ban_reason: null, banned_until: null };

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[getProfileByUsername]", error.message);
    return null;
  }
  return data ? ({ ...(data as object), ...PRIVATE_NULLS } as Profile) : null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    console.error("[getCurrentProfile]", error.message);
    return null;
  }
  if (!data) return null;

  // Le téléphone du profil n'est lisible que par son propriétaire, via une fonction dédiée.
  const { data: phone } = await supabase.rpc("get_my_phone");
  return { ...(data as object), ...PRIVATE_NULLS, phone: phone ?? null } as Profile;
}
