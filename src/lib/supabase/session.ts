import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  return profile;
}
