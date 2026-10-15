"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatFullDate } from "@/lib/utils";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import {
  adminHideListingAction,
  adminRestoreListingAction,
  adminDeleteListingAction,
  adminBanUserAction,
  adminUnbanUserAction,
  adminHandleReportAction,
} from "@/actions/admin";
import type { ReportReason } from "@/types/database";

export function AdminListingRow({
  listing,
}: {
  listing: { id: string; title: string; slug: string; status: string; price: number; city: string; created_at: string };
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <tr className="border-b border-line text-sm">
      <td className="py-2.5 pr-3">
        <Link href={`/annonce/${listing.slug}`} className="font-medium text-ink hover:underline">
          {listing.title}
        </Link>
      </td>
      <td className="py-2.5 pr-3">{formatPrice(listing.price)}</td>
      <td className="py-2.5 pr-3">{listing.city}</td>
      <td className="py-2.5 pr-3">
        <Badge variant={listing.status === "active" ? "signal" : "default"}>{listing.status}</Badge>
      </td>
      <td className="py-2.5 pr-3">{formatFullDate(listing.created_at)}</td>
      <td className="flex flex-wrap gap-1.5 py-2.5">
        {listing.status !== "hidden" && (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await adminHideListingAction(listing.id); })}>
            Masquer
          </Button>
        )}
        {listing.status === "hidden" && (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await adminRestoreListingAction(listing.id); })}>
            Restaurer
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            if (confirm("Supprimer définitivement cette annonce ?")) {
              startTransition(async () => { await adminDeleteListingAction(listing.id); });
            }
          }}
        >
          Supprimer
        </Button>
      </td>
    </tr>
  );
}

export function AdminUserRow({
  user,
}: {
  user: { id: string; username: string; display_name: string; role: string; is_banned: boolean; listing_count: number; created_at: string };
}) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  return (
    <tr className="border-b border-line text-sm">
      <td className="py-2.5 pr-3">
        <Link href={`/profil/${user.username}`} className="font-medium text-ink hover:underline">
          {user.display_name}
        </Link>
        <span className="ml-1 text-muted">@{user.username}</span>
      </td>
      <td className="py-2.5 pr-3">
        <Badge variant={user.role === "admin" ? "signal" : "default"}>{user.role}</Badge>
      </td>
      <td className="py-2.5 pr-3">{user.listing_count}</td>
      <td className="py-2.5 pr-3">
        {user.is_banned ? <Badge variant="outline">Banni</Badge> : "—"}
      </td>
      <td className="py-2.5">
        {user.is_banned ? (
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => startTransition(async () => { await adminUnbanUserAction(user.id); })}>
            Débannir
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              placeholder="Raison"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-8 w-28 rounded-[6px] border border-line-strong px-2 text-xs"
            />
            <Button
              size="sm"
              variant="danger"
              disabled={isPending || !reason}
              onClick={() => startTransition(async () => { await adminBanUserAction(user.id, reason, 7); })}
            >
              Bannir 7j
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={isPending || !reason}
              onClick={() => startTransition(async () => { await adminBanUserAction(user.id, reason); })}
            >
              Bannir définitivement
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export function AdminReportRow({
  report,
}: {
  report: {
    id: string;
    reason: ReportReason;
    message: string | null;
    created_at: string;
    listing: { title: string; slug: string } | null;
    reporter: { username: string } | null;
  };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-ink">
          {report.listing ? (
            <Link href={`/annonce/${report.listing.slug}`} className="hover:underline">
              {report.listing.title}
            </Link>
          ) : (
            "Annonce supprimée"
          )}
        </p>
        <p className="text-xs text-muted">
          Raison : {REPORT_REASON_LABELS[report.reason]} · Signalé par{" "}
          {report.reporter ? `@${report.reporter.username}` : "anonyme"} · {formatFullDate(report.created_at)}
        </p>
        {report.message && <p className="mt-1 text-sm text-ink">{report.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => startTransition(async () => { await adminHandleReportAction(report.id, "resolved"); })}
        >
          Traiter
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => startTransition(async () => { await adminHandleReportAction(report.id, "dismissed"); })}
        >
          Ignorer
        </Button>
      </div>
    </div>
  );
}
