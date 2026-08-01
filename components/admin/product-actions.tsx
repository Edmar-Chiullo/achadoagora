"use client";

import * as React from "react";
import { Star, Trash2 } from "lucide-react";
import {
  toggleProductFeatured,
  toggleProductStatus,
  deleteProduct,
} from "@/lib/actions/products";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ProductActionsProps {
  product: {
    id: string;
    status: "ACTIVE" | "INACTIVE";
    featured: boolean;
  };
}

function ProductActions({ product }: ProductActionsProps) {
  const [status, setStatus] = React.useState(product.status);
  const [featured, setFeatured] = React.useState(product.featured);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleToggleStatus(value: boolean) {
    setStatus(value ? "ACTIVE" : "INACTIVE");
    await toggleProductStatus(product.id);
  }

  async function handleToggleFeatured() {
    setFeatured((v) => !v);
    await toggleProductFeatured(product.id);
  }

  async function handleDelete() {
    setPending(true);
    await deleteProduct(product.id);
    setPending(false);
    setDeleteOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleToggleFeatured}
        title={featured ? "Remover destaque" : "Destacar produto"}
        aria-label={featured ? "Remover destaque" : "Destacar produto"}
      >
        <Star
          className={featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
        />
      </Button>
      <Switch
        checked={status === "ACTIVE"}
        onCheckedChange={handleToggleStatus}
        aria-label="Ativar ou desativar produto"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
        aria-label="Excluir produto"
      >
        <Trash2 />
      </Button>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
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

export { ProductActions };
