"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/actions/profile";
import { Field, FieldError, Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/types";
import type { Profile } from "@/types";

const initialState: ActionResult = { success: false };

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const [isProfessional, setIsProfessional] = useState(profile.is_professional);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Field htmlFor="displayName">Nom affiché</Field>
        <Input id="displayName" name="displayName" defaultValue={profile.display_name} required />
        <FieldError>{state.fieldErrors?.displayName}</FieldError>
      </div>
      <div>
        <Field htmlFor="city">Ville</Field>
        <Input id="city" name="city" defaultValue={profile.city ?? ""} />
      </div>
      <div>
        <Field htmlFor="phone">Téléphone</Field>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="0600000000" />
        <FieldError>{state.fieldErrors?.phone}</FieldError>
      </div>
      <div>
        <Field htmlFor="bio">Bio</Field>
        <Textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} maxLength={500} />
      </div>

      <div className="rounded-[12px] border border-line bg-paper-muted p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="isProfessional"
            className="accent-signal"
            checked={isProfessional}
            onChange={(e) => setIsProfessional(e.target.checked)}
          />
          Je vends en tant que professionnel
        </label>
        {isProfessional && (
          <div className="mt-3 space-y-3">
            <div>
              <Field htmlFor="companyName">Nom de l&apos;entreprise</Field>
              <Input id="companyName" name="companyName" defaultValue={profile.company_name ?? ""} />
              <FieldError>{state.fieldErrors?.companyName}</FieldError>
            </div>
            <div>
              <Field htmlFor="siret">SIRET</Field>
              <Input id="siret" name="siret" defaultValue={profile.siret ?? ""} placeholder="14 chiffres" />
              <FieldError>{state.fieldErrors?.siret}</FieldError>
            </div>
          </div>
        )}
      </div>

      {state.message && (
        <p className={state.success ? "text-sm text-signal-ink" : "text-sm text-danger"}>
          {state.message}
        </p>
      )}

      <Button type="submit" variant="signal" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
