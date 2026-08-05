"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DIRECT_SOURCE, platformBadgeClass } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

interface SourceOption {
  source: string | null;
  count: number;
}

interface PlatformOption {
  slug: string;
  name: string;
  badgeKey?: string | null;
}

interface ClickRow {
  id: string;
  source: string | null;
  platform: string;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  deviceType: string | null;
  deviceBrand: string | null;
  browser: string | null;
  os: string | null;
  createdAt: string;
  product: { id: string; title: string; slug: string };
}

interface StatsResponse {
  total: number;
  unique: number;
  byDevice: { deviceType: string | null; _count: { _all: number } }[];
  topBrowsers: { browser: string; _count: { _all: number } }[];
  topOs: { os: string; _count: { _all: number } }[];
  topCities: { city: string; _count: { _all: number } }[];
  topRegions: { region: string; _count: { _all: number } }[];
  topCountries: { country: string; _count: { _all: number } }[];
  topPlatforms: { platform: string; _count: { _all: number } }[];
  topProducts: { title: string; count: number }[];
  topProduct: { title: string; count: number } | null;
  topMarketplace: { platform: string; _count: { _all: number } } | null;
  peakHours: { hour: number; count: number }[];
  peakDays: { date: string; count: number }[];
}

interface ApiResponse {
  rows: ClickRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: StatsResponse;
}

interface FiltersState {
  source: string;
  q: string;
  device: string;
  platform: string;
  period: string;
  sort: "asc" | "desc";
}

interface ClicksBySourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  sourceLabel: string;
  sources: SourceOption[];
  platforms: PlatformOption[];
}

function brToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysAgoBrUtc(days: number): string {
  const date = new Date(`${brToday()}T00:00:00-03:00`);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function periodFrom(period: string): string | null {
  if (period === "today") return new Date(`${brToday()}T00:00:00-03:00`).toISOString();
  if (period === "7") return daysAgoBrUtc(6);
  if (period === "30") return daysAgoBrUtc(29);
  return null;
}

function MiniCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">{value}</p>
    </div>
  );
}

function TopList({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium text-muted-foreground">{title}</h4>
      <ul className="space-y-0.5 text-sm">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between gap-2"
          >
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-medium text-muted-foreground">
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClicksBySourceDialog({
  open,
  onOpenChange,
  source,
  sourceLabel,
  sources,
  platforms,
}: ClicksBySourceDialogProps) {
  const [state, setState] = React.useState<FiltersState>(() => ({
    source,
    q: "",
    device: "",
    platform: "",
    period: "all",
    sort: "desc",
  }));
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastLoadedQuery, setLastLoadedQuery] = React.useState<string | null>(null);

  const query = React.useMemo(() => {
    const params = new URLSearchParams({
      source: state.source,
      page: String(page),
      pageSize: "20",
      sort: state.sort,
    });
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.device) params.set("device", state.device);
    if (state.platform) params.set("platform", state.platform);
    const from = periodFrom(state.period);
    if (from) params.set("from", from);
    return params.toString();
  }, [state, page]);

  const loading = data === null || query !== lastLoadedQuery;

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(`/api/admin/clicks?${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar os dados.");
        return (await res.json()) as ApiResponse;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLastLoadedQuery(query);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro inesperado.");
          setLastLoadedQuery(query);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, query]);

  const exportUrl = React.useMemo(() => {
    const params = new URLSearchParams({ source: state.source });
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.device) params.set("device", state.device);
    if (state.platform) params.set("platform", state.platform);
    const from = periodFrom(state.period);
    if (from) params.set("from", from);
    return `/api/admin/clicks/csv?${params.toString()}`;
  }, [state]);

  const platformMap = React.useMemo(
    () => new Map(platforms.map((platform) => [platform.slug, platform])),
    [platforms]
  );

  const deviceCount = (type: string) =>
    data?.stats.byDevice.find((item) => item.deviceType === type)?._count._all ?? 0;

  const sourceOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [
      { value: "all", label: "Todas as origens" },
      { value: DIRECT_SOURCE, label: "Sem origem (direto)" },
      ...sources
        .filter((item) => item.source !== null)
        .map((item) => ({ value: item.source!, label: item.source! })),
    ];
    return list.filter(
      (option, index, arr) => arr.findIndex((o) => o.value === option.value) === index
    );
  }, [sources]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Histórico de cliques — ${sourceLabel}`}
      description="Registros completos dos acessos desta origem, com filtros e estatísticas."
      className="max-w-6xl"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Input
            value={state.q}
            onChange={(event) => {
              setState((s) => ({ ...s, q: event.target.value }));
              setPage(1);
            }}
            placeholder="Buscar produto, cidade, navegador…"
            aria-label="Buscar"
          />
          <Select
            value={state.period}
            onChange={(event) => {
              setState((s) => ({ ...s, period: event.target.value }));
              setPage(1);
            }}
            aria-label="Período"
          >
            <option value="all">Todo o período</option>
            <option value="today">Hoje</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
          </Select>
          <Select
            value={state.device}
            onChange={(event) => {
              setState((s) => ({ ...s, device: event.target.value }));
              setPage(1);
            }}
            aria-label="Dispositivo"
          >
            <option value="">Todos os dispositivos</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </Select>
          <Select
            value={state.platform}
            onChange={(event) => {
              setState((s) => ({ ...s, platform: event.target.value }));
              setPage(1);
            }}
            aria-label="Plataforma"
          >
            <option value="">Todas as plataformas</option>
            {platforms.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Select
            value={state.source}
            onChange={(event) => {
              setState((s) => ({ ...s, source: event.target.value }));
              setPage(1);
            }}
            aria-label="Origem"
          >
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setState((s) => ({ ...s, sort: s.sort === "asc" ? "desc" : "asc" }));
              setPage(1);
            }}
          >
            <ArrowUpDown aria-hidden />
            {state.sort === "desc" ? "Mais recentes" : "Mais antigas"}
          </Button>
          <a href={exportUrl} className={buttonVariants({ variant: "outline" })}>
            <Download aria-hidden />
            Exportar CSV
          </a>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando…
          </div>
        ) : data ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <MiniCard label="Total de cliques" value={data.stats.total} />
              <MiniCard label="Cliques únicos" value={data.stats.unique} />
              <MiniCard label="Desktop" value={deviceCount("desktop")} />
              <MiniCard label="Mobile" value={deviceCount("mobile")} />
              <MiniCard label="Tablet" value={deviceCount("tablet")} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <TopList
                title="Top navegadores"
                items={data.stats.topBrowsers.map((item) => ({
                  label: item.browser,
                  count: item._count._all,
                }))}
              />
              <TopList
                title="Top sistemas"
                items={data.stats.topOs.map((item) => ({
                  label: item.os,
                  count: item._count._all,
                }))}
              />
              <TopList
                title="Top cidades"
                items={data.stats.topCities.map((item) => ({
                  label: item.city,
                  count: item._count._all,
                }))}
              />
              <TopList
                title="Top estados"
                items={data.stats.topRegions.map((item) => ({
                  label: item.region,
                  count: item._count._all,
                }))}
              />
              <TopList
                title="Top países"
                items={data.stats.topCountries.map((item) => ({
                  label: item.country,
                  count: item._count._all,
                }))}
              />
              <TopList
                title="Marketplaces"
                items={data.stats.topPlatforms.map((item) => ({
                  label: platformMap.get(item.platform)?.name ?? item.platform,
                  count: item._count._all,
                }))}
              />
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-2">
              {data.stats.topProduct ? (
                <p className="truncate">
                  <span className="text-muted-foreground">Produto mais clicado: </span>
                  <span className="font-medium">{data.stats.topProduct.title}</span>{" "}
                  <span className="text-muted-foreground">({data.stats.topProduct.count})</span>
                </p>
              ) : null}
              {data.stats.topMarketplace ? (
                <p>
                  <span className="text-muted-foreground">Marketplace mais acessado: </span>
                  <span className="font-medium">
                    {platformMap.get(data.stats.topMarketplace.platform)?.name ??
                      data.stats.topMarketplace.platform}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({data.stats.topMarketplace._count._all})
                  </span>
                </p>
              ) : null}
              {data.stats.peakHours[0] ? (
                <p>
                  <span className="text-muted-foreground">Pico de horário: </span>
                  <span className="font-medium">
                    {String(data.stats.peakHours[0].hour).padStart(2, "0")}h
                  </span>{" "}
                  <span className="text-muted-foreground">({data.stats.peakHours[0].count})</span>
                </p>
              ) : null}
              {data.stats.peakDays[0] ? (
                <p>
                  <span className="text-muted-foreground">Pico de dia: </span>
                  <span className="font-medium">{data.stats.peakDays[0].date}</span>{" "}
                  <span className="text-muted-foreground">({data.stats.peakDays[0].count})</span>
                </p>
              ) : null}
            </div>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>UTM</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Navegador / SO</TableHead>
                    <TableHead>Referrer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        Nenhum clique encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.rows.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(click.createdAt)}
                        </TableCell>
                        <TableCell className="max-w-[16rem]">
                          <Link
                            href={`/produto/${click.product.slug}`}
                            target="_blank"
                            className="line-clamp-1 hover:underline"
                          >
                            {click.product.title}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="secondary">
                            {click.source ?? "Sem origem (direto)"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {click.utmMedium || click.utmCampaign
                            ? [click.utmMedium, click.utmCampaign]
                                .filter(Boolean)
                                .join(" / ")
                            : "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            className={platformBadgeClass(
                              platformMap.get(click.platform)?.badgeKey
                            )}
                          >
                            {platformMap.get(click.platform)?.name ?? click.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {[click.country, click.region, click.city]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {[click.deviceType, click.deviceBrand]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {[click.browser, click.os].filter(Boolean).join(" · ") || "—"}
                        </TableCell>
                        <TableCell className="max-w-[14rem] truncate text-xs text-muted-foreground">
                          {click.referrer ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Mostrando {data.rows.length} de {data.total} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft aria-hidden />
                  Anterior
                </Button>
                <span className="text-muted-foreground">
                  Página {data.page} de {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}
