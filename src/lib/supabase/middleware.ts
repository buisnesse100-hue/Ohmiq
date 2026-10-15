import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Rafraîchit le token de session Supabase à chaque requête et le propage
 * dans les cookies de la réponse. Appelé depuis middleware.ts à la racine.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser() pour éviter
  // des bugs aléatoires de déconnexion (recommandation officielle Supabase SSR).
  const { data: { user } } = await supabase.auth.getUser();

  // Protection des routes sensibles côté serveur (en plus des RLS policies, en défense en profondeur).
  const protectedPrefixes = ["/mon-compte", "/mes-annonces", "/publier", "/favoris", "/admin", "/messages", "/pro"];
  const pathname = request.nextUrl.pathname;
  const requiresAuth = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (requiresAuth && !user) {
    const redirectUrl = new URL("/connexion", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
