import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser UNIQUEMENT dans les Client Components ("use client").
 * Pour les Server Components / Server Actions, utiliser lib/supabase/server.ts.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
