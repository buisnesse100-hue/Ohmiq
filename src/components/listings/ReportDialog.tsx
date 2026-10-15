"use client";

import { useActionState, useState } from "react";
import { Flag, X } from "lucide-react";
import { submitReportAction } from "@/actions/interactions";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export function ReportDialog({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(submitReportAction, initialState);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line-strong px-4 text-sm font-medium text-muted hover:bg-paper-muted"
      >
        <Flag size={16} /> Signaler
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-[16px] bg-paper p-5 sm:rounded-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Signaler cette annonce</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>

            {state.success ? (
              <p className="mt-4 rounded-[10px] bg-signal-soft p-3 text-sm text-signal-ink">
                {state.message}
              </p>
            ) : (
              <form action={formAction} className="mt-4 space-y-4">
                <input type="hidden" name="listingId" value={listingId} />
                <div>
                  <Field>Raison</Field>
                  <div className="space-y-2">
                    {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm text-ink">
                        <input type="radio" name="reason" value={value} required className="accent-signal" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Field htmlFor="message">Détails (optionnel)</Field>
                  <Textarea id="message" name="message" rows={3} maxLength={1000} />
                </div>
                {state.message && !state.success && (
                  <p className="text-sm text-danger">{state.message}</p>
                )}
                <Button type="submit" variant="primary" fullWidth disabled={isPending}>
                  {isPending ? "Envoi..." : "Envoyer le signalement"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
