import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminProfile() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;
  return profile;
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [{ count: totalUsers }, { count: totalListings }, { count: activeListings }, { count: pendingReports }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }).neq("status", "deleted"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalListings: totalListings ?? 0,
    activeListings: activeListings ?? 0,
    pendingReports: pendingReports ?? 0,
  };
}

export async function getPendingReports() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select(`
      *,
      listing:listings!reports_listing_id_fkey ( id, title, slug, status ),
      reporter:profiles!reports_reporter_id_fkey ( username )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function searchAdminListings(query: string) {
  const supabase = await createClient();
  let q = supabase
    .from("listings")
    .select("id, title, slug, status, price, city, created_at, seller:profiles!listings_seller_id_fkey(username)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (query) q = q.ilike("title", `%${query}%`);

  const { data } = await q;
  return data ?? [];
}

export async function searchAdminUsers(query: string) {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select("id, username, display_name, role, is_banned, listing_count, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (query) q = q.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`);

  const { data } = await q;
  return data ?? [];
}
