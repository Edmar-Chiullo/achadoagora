"use client";

import * as React from "react";
import { useActionState } from "react";
import { Wand2, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

interface ImportedData {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  platform: string | null;
  confidence: number;
  missingFields: string[];
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
  const [importUrl, setImportUrl] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<ImportedData | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const formRef = React.useRef<HTMLFormElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);
  const priceRef = React.useRef<HTMLInputElement>(null);
  const platformIdRef = React.useRef<HTMLSelectElement>(null);
  const sourceTypeRef = React.useRef<HTMLInputElement>(null);
  const sourceUrlRef = React.useRef<HTMLInputElement>(null);

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

  async function handleImport() {
    if (!importUrl.trim()) return;

    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImportError(data.errorMessage || "Erro ao importar produto.");
        return;
      }

      if (data.success && data.data) {
        const imported: ImportedData = {
          title: data.data.title,
          description: data.data.description,
          imageUrl: data.data.imageUrl,
          price: data.data.price,
          platform: data.data.platform,
          confidence: data.data.confidence,
          missingFields: data.data.missingFields || [],
        };

        setImportResult(imported);

        if (imported.title && titleRef.current) {
          titleRef.current.value = imported.title;
          setTitle(imported.title);
          if (!slugTouched) {
            setSlug(slugify(imported.title));
          }
        }

        if (imported.description && descriptionRef.current) {
          descriptionRef.current.value = imported.description;
        }

        if (imported.imageUrl && imageRef.current) {
          imageRef.current.value = imported.imageUrl;
        }

        if (imported.price !== null && priceRef.current) {
          priceRef.current.value = String(imported.price);
        }

        if (imported.platform && platformIdRef.current) {
          const matchedPlatform = platforms.find(
            (p) => p.name.toLowerCase() === imported.platform!.toLowerCase()
          );
          if (matchedPlatform) {
            platformIdRef.current.value = matchedPlatform.id;
          }
        }

        if (sourceTypeRef.current) {
          sourceTypeRef.current.value = "IMPORTED";
        }
        if (sourceUrlRef.current) {
          sourceUrlRef.current.value = importUrl.trim();
        }
      }
    } catch {
      setImportError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setImporting(false);
    }
  }

  function getConfidenceColor(score: number): string {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  function getConfidenceLabel(score: number): string {
    if (score >= 80) return "Alta";
    if (score >= 50) return "Média";
    return "Baixa";
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-4 w-4 text-primary" />
          <Label className="font-medium text-primary">Importar por URL</Label>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Cole a URL do produto para preencher os campos automaticamente.
        </p>
        <div className="flex gap-2">
          <Input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://www.mercadolivre.com.br/produto/..."
            className="flex-1"
            disabled={importing}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleImport}
            disabled={importing || !importUrl.trim()}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </div>

        {importError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {importError}
          </div>
        )}

        {importResult && (
          <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Produto importado com sucesso
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Confiança:</span>
              <span className={`font-medium ${getConfidenceColor(importResult.confidence)}`}>
                {importResult.confidence}% — {getConfidenceLabel(importResult.confidence)}
              </span>
            </div>
            {importResult.missingFields.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Campos não encontrados: {importResult.missingFields.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            ref={titleRef}
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
            ref={descriptionRef}
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
            ref={imageRef}
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
            ref={priceRef}
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
            ref={platformIdRef}
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
        <input type="hidden" ref={sourceTypeRef} name="sourceType" value="MANUAL" />
        <input type="hidden" ref={sourceUrlRef} name="sourceUrl" value="" />
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar produto"}
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
