"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClicksBySourceDialog } from "@/components/admin/clicks-by-source-dialog";
import { DIRECT_SOURCE } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

interface SourceOption {
  source: string | null;
  count: number;
}

interface PlatformOption {
  slug: string;
  name: string;
  badgeKey?: string | null;
}

interface ClicksBySourceProps {
  sources: SourceOption[];
  platforms: PlatformOption[];
}

export function ClicksBySource({ sources, platforms }: ClicksBySourceProps) {
  const [selected, setSelected] = React.useState<{
    source: string;
    label: string;
  } | null>(null);
  const [openSeq, setOpenSeq] = React.useState(0);

  if (sources.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum clique registrado ainda.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y">
        {sources.map((item) => {
          const value = item.source ?? DIRECT_SOURCE;
          const label = item.source ?? "Sem origem (direto)";
          return (
            <li key={value} className="flex items-center justify-between gap-2 py-1">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-between px-0 py-2.5"
                onClick={() => {
                  setOpenSeq((n) => n + 1);
                  setSelected({ source: value, label });
                }}
              >
                <Badge variant="secondary">{label}</Badge>
                <span className="flex items-center gap-2 font-medium">
                  {formatNumber(item.count)} cliques
                </span>
              </Button>
            </li>
          );
        })}
      </ul>

      <ClicksBySourceDialog
        key={selected ? `${selected.source}:${openSeq}` : "closed"}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        source={selected?.source ?? "all"}
        sourceLabel={selected?.label ?? "Todas"}
        sources={sources}
        platforms={platforms}
      />
    </>
  );
}
