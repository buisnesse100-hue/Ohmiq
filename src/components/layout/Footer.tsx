import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "OHMIQ",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/comment-ca-marche", label: "Comment ça marche" },
      { href: "/securite", label: "Sécurité" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/regles", label: "Règles" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/conditions", label: "Conditions" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2">
            <Logo onDark />
            <p className="mt-4 max-w-xs text-sm text-paper/60">
              La seconde vie de la tech. Achetez et vendez de l&apos;électronique d&apos;occasion en
              toute confiance.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-paper">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-paper/60 transition-colors hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-paper/45">
          © {new Date().getFullYear()} OHMIQ. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
