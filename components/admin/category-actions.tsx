"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  deleteCategory,
  toggleCategoryStatus,
} from "@/lib/actions/categories";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface CategoryActionsProps {
  category: {
    id: string;
    status: "ACTIVE" | "INACTIVE";
  };
}

function CategoryActions({ category }: CategoryActionsProps) {
  const [status, setStatus] = React.useState(category.status);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleToggleStatus(value: boolean) {
    setStatus(value ? "ACTIVE" : "INACTIVE");
    await toggleCategoryStatus(category.id);
  }

  async function handleDelete() {
    setPending(true);
    await deleteCategory(category.id);
    setPending(false);
    setDeleteOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={status === "ACTIVE"}
        onCheckedChange={handleToggleStatus}
        aria-label="Ativar ou desativar categoria"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
        aria-label="Excluir categoria"
      >
        <Trash2 />
      </Button>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir categoria"
        description="Tem certeza que deseja excluir esta categoria? Os produtos continuarão, mas ficarão sem categoria."
      >
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

export { CategoryActions };
