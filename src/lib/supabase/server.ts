import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser dans les Server Components, Server Actions et Route Handlers.
 * Respecte la session utilisateur (via cookies) et donc les policies RLS "auth.uid()".
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll appelé depuis un Server Component : ignorable si le middleware
            // rafraîchit déjà la session.
          }
        },
      },
    }
  );
}
