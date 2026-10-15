"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { Field, FieldError, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-[12px] bg-signal-soft p-5 text-signal-ink">
        <p className="font-medium">{state.message}</p>
        <Link href="/connexion" className="mt-3 inline-block text-sm underline">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Field htmlFor="displayName">Nom affiché</Field>
        <Input id="displayName" name="displayName" placeholder="Marie D." required />
        <FieldError>{state.fieldErrors?.displayName}</FieldError>
      </div>
      <div>
        <Field htmlFor="username">Nom d&apos;utilisateur</Field>
        <Input id="username" name="username" placeholder="marie.d" required />
        <FieldError>{state.fieldErrors?.username}</FieldError>
      </div>
      <div>
        <Field htmlFor="email">Email</Field>
        <Input id="email" name="email" type="email" placeholder="vous@exemple.com" required />
        <FieldError>{state.fieldErrors?.email}</FieldError>
      </div>
      <div>
        <Field htmlFor="password">Mot de passe</Field>
        <Input id="password" name="password" type="password" required minLength={8} />
        <FieldError>{state.fieldErrors?.password}</FieldError>
      </div>
      <div>
        <Field htmlFor="confirmPassword">Confirmer le mot de passe</Field>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
      </div>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" name="acceptTerms" required className="mt-0.5 accent-signal" />
        <span>
          J&apos;accepte les{" "}
          <Link href="/conditions" className="underline">
            conditions d&apos;utilisation
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <FieldError>{state.fieldErrors?.acceptTerms}</FieldError>

      {state.message && !state.success && <p className="text-sm text-danger">{state.message}</p>}

      <Button type="submit" variant="signal" fullWidth size="lg" disabled={isPending}>
        {isPending ? "Création..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
