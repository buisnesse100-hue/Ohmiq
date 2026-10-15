import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Exécute le middleware sur toutes les routes sauf :
     * - fichiers statiques (_next/static, _next/image)
     * - favicon, images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)",
  ],
};
