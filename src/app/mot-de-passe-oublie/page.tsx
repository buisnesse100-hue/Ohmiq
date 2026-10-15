import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted">
        Indique ton email, on t&apos;envoie un lien pour en créer un nouveau.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
