"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/actions/auth";
import { Field, FieldError, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return <p className="rounded-[12px] bg-signal-soft p-5 text-signal-ink">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Field htmlFor="email">Email</Field>
        <Input id="email" name="email" type="email" placeholder="vous@exemple.com" required />
        <FieldError>{state.fieldErrors?.email}</FieldError>
      </div>
      {state.message && !state.success && <p className="text-sm text-danger">{state.message}</p>}
      <Button type="submit" variant="signal" fullWidth size="lg" disabled={isPending}>
        {isPending ? "Envoi..." : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
