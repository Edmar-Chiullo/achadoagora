"use client";

import * as React from "react";
import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export interface UserFormData {
  name: string;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
}

interface UserFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initialData?: UserFormData;
  isEdit?: boolean;
}

function UserForm({ action, initialData, isEdit }: UserFormProps) {
  const wrappedAction = React.useCallback(
    (_prev: ActionResult, formData: FormData) => action(formData),
    [action]
  );
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    wrappedAction,
    {}
  );

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name ?? ""}
            placeholder="Ex.: João Silva"
            required
          />
          {fieldError("name") ? (
            <p className="text-sm text-destructive">{fieldError("name")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            defaultValue={initialData?.email ?? ""}
            placeholder="joao@exemplo.com"
            required
          />
          {fieldError("email") ? (
            <p className="text-sm text-destructive">{fieldError("email")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nome de usuário *</Label>
          <Input
            id="username"
            name="username"
            defaultValue={initialData?.username ?? ""}
            placeholder="joao"
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Define a URL do painel: /admin/{initialData?.username || "usuario"}/…
            {isEdit
              ? " Alterar o nome de usuário muda a URL de acesso deste usuário."
              : ""}
          </p>
          {fieldError("username") ? (
            <p className="text-sm text-destructive">{fieldError("username")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Papel *</Label>
          <Select
            id="role"
            name="role"
            defaultValue={initialData?.role ?? "USER"}
          >
            <option value="USER">Usuário — vê apenas o próprio conteúdo</option>
            <option value="ADMIN">Administrador — vê tudo e gerencia usuários</option>
          </Select>
          {fieldError("role") ? (
            <p className="text-sm text-destructive">{fieldError("role")}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="password">
            {isEdit ? "Nova senha" : "Senha *"}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required={!isEdit}
            placeholder={
              isEdit
                ? "Deixe em branco para manter a senha atual"
                : "Mínimo de 6 caracteres"
            }
          />
          {fieldError("password") ? (
            <p className="text-sm text-destructive">{fieldError("password")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : isEdit ? "Salvar usuário" : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}

export { UserForm };
