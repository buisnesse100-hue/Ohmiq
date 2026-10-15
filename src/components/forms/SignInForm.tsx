"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { Field, FieldError, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <Field htmlFor="email">Email</Field>
        <Input id="email" name="email" type="email" placeholder="vous@exemple.com" required />
        <FieldError>{state.fieldErrors?.email}</FieldError>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Field htmlFor="password">Mot de passe</Field>
          <Link href="/mot-de-passe-oublie" className="mb-1.5 text-sm text-muted underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <Input id="password" name="password" type="password" required />
        <FieldError>{state.fieldErrors?.password}</FieldError>
      </div>

      {state.message && !state.success && <p className="text-sm text-danger">{state.message}</p>}

      <Button type="submit" variant="signal" fullWidth size="lg" disabled={isPending}>
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
