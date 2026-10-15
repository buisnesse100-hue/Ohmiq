import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-ink">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold">Cette page ou cette annonce n&apos;existe plus.</h1>
      <p className="mt-2 text-muted">
        Elle a peut-être été vendue, supprimée par son auteur, ou l&apos;adresse est incorrecte.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/" variant="primary">
          Retour à l&apos;accueil
        </LinkButton>
        <LinkButton href="/search" variant="outline">
          Chercher une annonce
        </LinkButton>
      </div>
      <Link href="/contact" className="mt-4 text-sm text-muted underline">
        Signaler un problème
      </Link>
    </div>
  );
}
