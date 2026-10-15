import Link from "next/link";
import { Home, Search, MessageSquare, User as UserIcon, LayoutGrid } from "lucide-react";
import { getSessionUser } from "@/lib/supabase/session";
import { getTotalUnreadCount } from "@/services/messaging";

export async function MobileNav() {
  const user = await getSessionUser();
  const unreadCount = user ? await getTotalUnreadCount(user.id) : 0;

  const items = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/search", label: "Rechercher", icon: Search },
    { href: "/categories", label: "Catégories", icon: LayoutGrid },
    { href: user ? "/messages" : "/connexion", label: "Messages", icon: MessageSquare, badge: unreadCount },
    { href: user ? "/mon-compte" : "/connexion", label: "Compte", icon: UserIcon },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-line bg-paper md:hidden"
      aria-label="Navigation principale"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-ink"
        >
          <span className="relative">
            <item.icon size={20} strokeWidth={1.75} />
            {"badge" in item && item.badge ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-volt px-1 text-[9px] font-semibold text-white">
                {item.badge}
              </span>
            ) : null}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
