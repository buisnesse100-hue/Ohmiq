import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, Package, CheckCircle2, Flag } from "lucide-react";
import {
  requireAdminProfile,
  getAdminStats,
  getPendingReports,
  searchAdminListings,
  searchAdminUsers,
} from "@/services/admin";
import { AdminListingRow, AdminUserRow, AdminReportRow } from "@/components/admin/AdminRows";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = { title: "Administration" };

interface AdminPageProps {
  searchParams: Promise<{ listingQuery?: string; userQuery?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Défense en profondeur : re-vérifié aussi côté RLS et dans chaque Server Action admin.
  const admin = await requireAdminProfile();
  if (!admin) redirect("/");

  const { listingQuery = "", userQuery = "" } = await searchParams;

  const [stats, reports, listings, users] = await Promise.all([
    getAdminStats(),
    getPendingReports(),
    searchAdminListings(listingQuery),
    searchAdminUsers(userQuery),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Administration</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Users, label: "Utilisateurs", value: stats.totalUsers },
          { icon: Package, label: "Annonces (total)", value: stats.totalListings },
          { icon: CheckCircle2, label: "Annonces actives", value: stats.activeListings },
          { icon: Flag, label: "Signalements en attente", value: stats.pendingReports },
        ].map((s) => (
          <div key={s.label} className="rounded-[14px] border border-line p-4">
            <s.icon size={18} className="text-muted" />
            <p className="mt-2 font-display text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">
          Signalements en attente ({reports.length})
        </h2>
        <div className="mt-3">
          {reports.length === 0 ? (
            <p className="text-sm text-muted">Aucun signalement en attente.</p>
          ) : (
            reports.map((report) => (
              // @ts-expect-error -- relation typing simplifié pour le dashboard admin
              <AdminReportRow key={report.id} report={report} />
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Annonces</h2>
        </div>
        <form className="mt-3">
          <Input name="listingQuery" defaultValue={listingQuery} placeholder="Rechercher une annonce..." />
        </form>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="py-2">Titre</th>
                <th className="py-2">Prix</th>
                <th className="py-2">Ville</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Créée le</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <AdminListingRow key={listing.id} listing={listing} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Utilisateurs</h2>
        <form className="mt-3">
          <Input name="userQuery" defaultValue={userQuery} placeholder="Rechercher un utilisateur..." />
        </form>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="py-2">Utilisateur</th>
                <th className="py-2">Rôle</th>
                <th className="py-2">Annonces</th>
                <th className="py-2">Banni</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <AdminUserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
