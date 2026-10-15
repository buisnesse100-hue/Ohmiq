import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/categories",
    "/publier",
    "/a-propos",
    "/comment-ca-marche",
    "/securite",
    "/regles",
    "/confidentialite",
    "/conditions",
    "/mentions-legales",
    "/contact",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const { data: categories } = await supabase.from("categories").select("slug").eq("is_active", true);
  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${siteUrl}/categorie/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const { data: listings } = await supabase
    .from("listings")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${siteUrl}/annonce/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
