import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Créer un compte</h1>
      <p className="mt-1 text-sm text-muted">Gratuit, en moins d&apos;une minute.</p>
      <div className="mt-6">
        <SignUpForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-ink underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
