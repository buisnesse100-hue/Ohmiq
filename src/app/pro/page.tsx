import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Euro, Package, CheckCircle2, HandCoins, MessageSquare } from "lucide-react";
import { getCurrentProfile } from "@/services/profiles";
import { getProDashboardStats, getSellerOrders } from "@/services/pro-dashboard";
import { getListingsBySeller } from "@/services/listings";
import { formatPrice, formatFullDate } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard professionnel" };

export default async function ProDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?next=/pro");

  if (!profile.is_professional) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold">Dashboard professionnel</h1>
        <p className="mt-3 text-muted">
          Ce dashboard est réservé aux comptes en mode professionnel. Active-le depuis ton compte
          pour accéder à tes statistiques de vente.
        </p>
        <LinkButton href="/mon-compte" variant="signal" size="lg" className="mt-6">
          Activer le mode professionnel
        </LinkButton>
      </div>
    );
  }

  const [stats, orders, listings] = await Promise.all([
    getProDashboardStats(profile.id),
    getSellerOrders(profile.id),
    getListingsBySeller(profile.id),
  ]);

  const cards = [
    { icon: Euro, label: "Chiffre d'affaires", value: formatPrice(stats.revenueTotal) },
    { icon: CheckCircle2, label: "Ventes conclues", value: String(stats.salesCount) },
    { icon: Package, label: "Annonces en ligne", value: String(stats.activeListingsCount) },
    { icon: HandCoins, label: "Offres en attente", value: String(stats.pendingOffersCount) },
    { icon: MessageSquare, label: "Messages non lus", value: String(stats.unreadMessagesCount) },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            {profile.company_name ?? "Dashboard professionnel"}
          </h1>
          <p className="mt-1 text-sm text-muted">Vue d&apos;ensemble de ton activité sur OHMIQ.</p>
        </div>
        <LinkButton href="/publier" variant="signal" size="sm">
          Publier
        </LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[14px] border border-line p-4">
            <c.icon size={18} className="text-muted" />
            <p className="mt-2 font-display text-xl font-semibold">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Inventaire ({listings.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="px-4 py-2.5">Annonce</th>
                <th className="px-4 py-2.5">Prix</th>
                <th className="px-4 py-2.5">Statut</th>
                <th className="px-4 py-2.5">Vues</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <Link href={`/annonce/${l.slug}`} className="font-medium text-ink hover:underline">
                      {l.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{formatPrice(l.price)}</td>
                  <td className="px-4 py-2.5">{l.status}</td>
                  <td className="px-4 py-2.5">{l.view_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Commandes récentes</h2>
        <div className="mt-3 space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande pour le moment.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-[10px] border border-line p-3 text-sm">
                <span>{(order.listing as { title?: string } | null)?.title ?? "Annonce"}</span>
                <span className="font-medium">{formatPrice(order.amount)}</span>
                <span className="text-muted">{formatFullDate(order.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
