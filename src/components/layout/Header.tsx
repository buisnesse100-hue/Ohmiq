import Link from "next/link";
import { Plus, User as UserIcon, MessageSquare } from "lucide-react";
import { getSessionUser } from "@/lib/supabase/session";
import { getTotalUnreadCount } from "@/services/messaging";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

const navLink =
  "relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100";

export async function Header() {
  const user = await getSessionUser();
  const unreadCount = user ? await getTotalUnreadCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-ink md:flex" aria-label="Navigation">
          <Link href="/search" className={navLink}>
            Rechercher
          </Link>
          <Link href="/categories" className={navLink}>
            Catégories
          </Link>
          {user && (
            <>
              <Link href="/favoris" className={navLink}>
                Favoris
              </Link>
              <Link href="/messages" className={`${navLink} flex items-center gap-1.5`}>
                <MessageSquare size={15} /> Messages
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:bg-paper-muted"
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
