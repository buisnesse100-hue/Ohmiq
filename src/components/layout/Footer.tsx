import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

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
    <footer className="border-t border-line bg-paper-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2">
            <p className="font-display text-lg font-semibold text-ink">{SITE_NAME}</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              La seconde vie de la tech. Achetez et vendez de l&apos;électronique
              d&apos;occasion en toute confiance.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-ink">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">
          © {new Date().getFullYear()} {SITE_NAME}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
