import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Contact</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink">
        <p className="rounded-[10px] bg-paper-muted p-4 text-sm text-muted">
          Placeholder : remplace par une vraie adresse email de support avant la mise en production.
        </p>
        <p>
          Une question, un problème technique, ou besoin de signaler un contenu ? Écris-nous à{" "}
          <a href="mailto:support@contacta.exemple" className="underline">
            support@contacta.exemple
          </a>
          .
        </p>
      </div>
    </div>
  );
}
