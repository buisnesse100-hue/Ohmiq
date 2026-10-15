import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("[getProfileByUsername]", error.message);
    return null;
  }
  return data;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    console.error("[getCurrentProfile]", error.message);
    return null;
  }
  return data;
}
