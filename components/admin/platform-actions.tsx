"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  deletePlatform,
  togglePlatformStatus,
} from "@/lib/actions/platforms";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface PlatformActionsProps {
  platform: {
    id: string;
    slug: string;
    status: "ACTIVE" | "INACTIVE";
  };
}

function PlatformActions({ platform }: PlatformActionsProps) {
  const [status, setStatus] = React.useState(platform.status);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleToggleStatus(value: boolean) {
    setStatus(value ? "ACTIVE" : "INACTIVE");
    await togglePlatformStatus(platform.id);
  }

  async function handleDelete() {
    setPending(true);
    setDeleteError(null);
    const result = await deletePlatform(platform.id);
    setPending(false);
    if (result?.error) {
      setDeleteError(result.error);
      return;
    }
    setDeleteOpen(false);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Switch
        checked={status === "ACTIVE"}
        onCheckedChange={handleToggleStatus}
        aria-label="Ativar ou desativar plataforma"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => {
          setDeleteError(null);
          setDeleteOpen(true);
        }}
        aria-label="Excluir plataforma"
      >
        <Trash2 />
      </Button>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir plataforma"
        description="Tem certeza que deseja excluir esta plataforma? Produtos vinculados impedem a exclusão."
      >
        {deleteError ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {deleteError}
          </div>
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
            disabled={pending}
          >
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export { PlatformActions };
