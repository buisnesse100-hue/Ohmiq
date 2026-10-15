import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/forms/SignInForm";

export const metadata: Metadata = { title: "Connexion" };

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted">Content de te revoir sur OHMIQ.</p>
      <div className="mt-6">
        <SignInForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-ink underline">
          Inscris-toi
        </Link>
      </p>
    </div>
  );
}
