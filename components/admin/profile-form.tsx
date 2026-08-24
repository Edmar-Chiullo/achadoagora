"use client";

import * as React from "react";
import { useActionState } from "react";
import type { ProfileActionResult } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormProps {
  action: (formData: FormData) => Promise<ProfileActionResult>;
  initialName: string;
  username: string;
}

function ProfileForm({ action, initialName, username }: ProfileFormProps) {
  const wrappedAction = React.useCallback(
    (_prev: ProfileActionResult, formData: FormData) => action(formData),
    [action]
  );
  const [state, formAction, pending] = useActionState<
    ProfileActionResult,
    FormData
  >(wrappedAction, {});

  function fieldError(field: string) {
    const errors = state.fieldErrors?.[field];
    return errors && errors.length > 0 ? errors[0] : null;
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}
      {state.successMessage ? (
        <div className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {state.successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username-display">Nome de usuário</Label>
          <Input id="username-display" value={username} disabled className="font-mono" />
          <p className="text-xs text-muted-foreground">
            O nome de usuário define sua URL de acesso e só pode ser alterado por um
            administrador.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialName}
            placeholder="Seu nome"
            required
          />
          {fieldError("name") ? (
            <p className="text-sm text-destructive">{fieldError("name")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha atual *</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Confirme com sua senha atual"
          />
          {fieldError("currentPassword") ? (
            <p className="text-sm text-destructive">{fieldError("currentPassword")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova senha</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Deixe em branco para manter a senha atual"
          />
          {fieldError("newPassword") ? (
            <p className="text-sm text-destructive">{fieldError("newPassword")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

export { ProfileForm };
