"use client";

import * as React from "react";
import { useActionState } from "react";
import { Wand2 } from "lucide-react";
import { slugify } from "@/lib/slug";
import { PLATFORM_BADGE_STYLES } from "@/lib/constants";
import type { ActionResult } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface PlatformFormData {
  name: string;
  slug: string;
  shortLabel: string;
  badgeKey: string;
  status: "ACTIVE" | "INACTIVE";
}

interface PlatformFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initialData?: PlatformFormData;
}

function PlatformForm({ action, initialData }: PlatformFormProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [slug, setSlug] = React.useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(Boolean(initialData));
  const [badgeKey, setBadgeKey] = React.useState(initialData?.badgeKey ?? "gray");

  const wrappedAction = React.useCallback(
    (_prev: ActionResult, formData: FormData) => action(formData),
    [action]
  );
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    wrappedAction,
    {}
  );

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleRegenerateSlug() {
    setSlug(slugify(name));
    setSlugTouched(true);
  }

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
            value={name}
            onChange={handleNameChange}
            placeholder="Ex.: Amazon"
            required
          />
          {fieldError("name") ? (
            <p className="text-sm text-destructive">{fieldError("name")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
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
              placeholder="amazon"
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRegenerateSlug}
              title="Gerar slug a partir do nome"
              aria-label="Gerar slug a partir do nome"
            >
              <Wand2 />
            </Button>
          </div>
          {fieldError("slug") ? (
            <p className="text-sm text-destructive">{fieldError("slug")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortLabel">Atalho</Label>
          <Input
            id="shortLabel"
            name="shortLabel"
            defaultValue={initialData?.shortLabel ?? ""}
            maxLength={10}
            placeholder="AMZ"
          />
          {fieldError("shortLabel") ? (
            <p className="text-sm text-destructive">{fieldError("shortLabel")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="badgeKey">Cor do selo</Label>
          <Select
            id="badgeKey"
            name="badgeKey"
            value={badgeKey}
            onChange={(event) => setBadgeKey(event.target.value)}
          >
            {Object.entries(PLATFORM_BADGE_STYLES).map(([key]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2 pt-1">
            <Badge className={PLATFORM_BADGE_STYLES[badgeKey] ?? PLATFORM_BADGE_STYLES.gray}>
              Prévia
            </Badge>
            <span className="text-xs text-muted-foreground">
              {badgeKey || "gray"}
            </span>
          </div>
          {fieldError("badgeKey") ? (
            <p className="text-sm text-destructive">{fieldError("badgeKey")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? "ACTIVE"}
          >
            <option value="ACTIVE">Ativa</option>
            <option value="INACTIVE">Inativa</option>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar plataforma"}
        </Button>
      </div>
    </form>
  );
}

export { PlatformForm };
