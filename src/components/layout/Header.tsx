import Link from "next/link";
import { Plus, User as UserIcon, MessageSquare } from "lucide-react";
import { getSessionUser } from "@/lib/supabase/session";
import { getTotalUnreadCount } from "@/services/messaging";
import { LinkButton } from "@/components/ui/Button";
import { SITE_NAME } from "@/lib/constants";

export async function Header() {
  const user = await getSessionUser();
  const unreadCount = user ? await getTotalUnreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] font-medium text-ink md:flex">
          <Link href="/search" className="hover:text-signal-ink">
            Rechercher
          </Link>
          <Link href="/categories" className="hover:text-signal-ink">
            Catégories
          </Link>
          {user && (
            <>
              <Link href="/favoris" className="hover:text-signal-ink">
                Favoris
              </Link>
              <Link href="/messages" className="relative flex items-center gap-1.5 hover:text-signal-ink">
                <MessageSquare size={16} /> Messages
                {unreadCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-volt px-1 text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <LinkButton href="/publier" variant="signal" size="sm">
                <Plus size={16} /> Publier une annonce
              </LinkButton>
              <Link
                href="/mon-compte"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink hover:bg-paper-muted"
                aria-label="Mon compte"
              >
                <UserIcon size={18} />
              </Link>
            </>
          ) : (
            <>
              <LinkButton href="/connexion" variant="ghost" size="sm">
                Connexion
              </LinkButton>
              <LinkButton href="/inscription" variant="primary" size="sm">
                Inscription
              </LinkButton>
            </>
          )}
        </div>

        <LinkButton href="/publier" variant="signal" size="sm" className="md:hidden">
          <Plus size={16} /> Publier
        </LinkButton>
      </div>
    </header>
  );
}
