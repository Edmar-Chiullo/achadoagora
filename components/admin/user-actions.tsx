"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface UserActionsProps {
  user: {
    id: string;
    name: string | null;
    productCount: number;
    isSelf: boolean;
    isAdminRole: boolean;
  };
}

function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleDelete() {
    setPending(true);
    setError(null);
    const result = await deleteUser(user.id);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setDeleteOpen(false);
    setPending(false);
    router.refresh();
  }

  const selfDisabled = user.isSelf;
  const description = selfDisabled
    ? "Você não pode excluir a sua própria conta."
    : `Tem certeza que deseja excluir ${user.name ?? "este usuário"}?${
        user.productCount > 0
          ? ` Atenção: os ${user.productCount} produto(s) deste usuário e seus cliques também serão excluídos.`
          : ""
      }`;

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
        disabled={selfDisabled}
        aria-label={
          selfDisabled ? "Não é possível excluir a própria conta" : "Excluir usuário"
        }
        title={selfDisabled ? "Você não pode excluir a própria conta" : undefined}
      >
        <Trash2 />
      </Button>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setError(null);
        }}
        title="Excluir usuário"
        description={description}
      >
        {error ? (
          <p className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {!selfDisabled && user.isAdminRole ? (
          <p className="mb-3 text-sm text-muted-foreground">
            Este usuário é administrador.
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending || selfDisabled}
          >
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export { UserActions };
