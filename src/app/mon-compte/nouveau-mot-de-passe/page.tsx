"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/actions/auth";
import { Field, FieldError, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function NewPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <div className="mx-auto max-w-sm px-4 py-14 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Nouveau mot de passe</h1>
      {state.success ? (
        <p className="mt-6 rounded-[12px] bg-signal-soft p-5 text-signal-ink">{state.message}</p>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <Field htmlFor="password">Nouveau mot de passe</Field>
            <Input id="password" name="password" type="password" required minLength={8} />
            <FieldError>{state.fieldErrors?.password}</FieldError>
          </div>
          <div>
            <Field htmlFor="confirmPassword">Confirmer</Field>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
            <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
          </div>
          {state.message && !state.success && <p className="text-sm text-danger">{state.message}</p>}
          <Button type="submit" variant="signal" fullWidth size="lg" disabled={isPending}>
            {isPending ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </form>
      )}
    </div>
  );
}
