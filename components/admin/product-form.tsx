"use client";

import * as React from "react";
import { useActionState } from "react";
import { Wand2 } from "lucide-react";
import type { Category, Platform } from "@/app/generated/prisma/client";
import { slugify } from "@/lib/slug";
import type { ActionResult } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  image: string;
  price: string;
  categoryId: string;
  platformId: string;
  affiliateLink: string;
  status: "ACTIVE" | "INACTIVE";
  featured: boolean;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  categories: Category[];
  platforms: Platform[];
  initialData?: ProductFormData;
}

function ProductForm({ action, categories, platforms, initialData }: ProductFormProps) {
  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [slug, setSlug] = React.useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialData));

  const defaultPlatformId =
    platforms.find((platform) => platform.slug === "outro")?.id ?? "";

  const wrappedAction = React.useCallback(
    (_prev: ActionResult, formData: FormData) => action(formData),
    [action]
  );
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    wrappedAction,
    {}
  );

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleRegenerateSlug() {
    setSlug(slugify(title));
    setSlugTouched(true);
  }

  function fieldError(name: string) {
    const errors = state.fieldErrors?.[name];
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Ex.: Furadeira de impacto 650W"
            required
          />
          {fieldError("title") ? (
            <p className="text-sm text-destructive">{fieldError("title")}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              placeholder="furadeira-de-impacto"
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRegenerateSlug}
              title="Gerar slug a partir do título"
              aria-label="Gerar slug a partir do título"
            >
              <Wand2 />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Deixe vazio para gerar automaticamente a partir do título.
          </p>
          {fieldError("slug") ? (
            <p className="text-sm text-destructive">{fieldError("slug")}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={initialData?.description ?? ""}
            rows={4}
            placeholder="Descreva o produto e por que você recomenda…"
          />
          {fieldError("description") ? (
            <p className="text-sm text-destructive">{fieldError("description")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL da imagem</Label>
          <Input
            id="image"
            name="image"
            type="url"
            defaultValue={initialData?.image ?? ""}
            placeholder="https://exemplo.com/imagem.jpg"
          />
          {fieldError("image") ? (
            <p className="text-sm text-destructive">{fieldError("image")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initialData?.price ?? ""}
            placeholder="199,90"
          />
          {fieldError("price") ? (
            <p className="text-sm text-destructive">{fieldError("price")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={initialData?.categoryId ?? ""}
          >
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {fieldError("categoryId") ? (
            <p className="text-sm text-destructive">{fieldError("categoryId")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platformId">Plataforma *</Label>
          <Select
            id="platformId"
            name="platformId"
            defaultValue={initialData?.platformId ?? defaultPlatformId}
            required
          >
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </Select>
          {fieldError("platformId") ? (
            <p className="text-sm text-destructive">{fieldError("platformId")}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="affiliateLink">Link de afiliado *</Label>
          <Input
            id="affiliateLink"
            name="affiliateLink"
            type="url"
            defaultValue={initialData?.affiliateLink ?? ""}
            placeholder="https://mercadolivre.com.br/…?tracking_id=SEU_ID"
            required
          />
          {fieldError("affiliateLink") ? (
            <p className="text-sm text-destructive">
              {fieldError("affiliateLink")}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? "ACTIVE"}
          >
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </Select>
        </div>

        <div className="flex items-end gap-2 pb-1">
          <Checkbox
            id="featured"
            name="featured"
            defaultChecked={initialData?.featured ?? false}
          />
          <Label htmlFor="featured" className="font-normal">
            Destacar na página inicial
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar produto"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
