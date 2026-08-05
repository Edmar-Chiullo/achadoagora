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
import { DIRECT_SOURCE } from "@/lib/constants";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/format";

interface VisitRow {
  id: string;
  path: string;
  referrer: string | null;
  source: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  deviceBrand: string | null;
  browser: string | null;
  os: string | null;
  duration: number | null;
  createdAt: string;
}

interface StatsResponse {
  total: number;
  unique: number;
  byDevice: { deviceType: string | null; _count: { _all: number } }[];
  topPages: { path: string; _count: { _all: number } }[];
  topSources: { source: string; _count: { _all: number } }[];
  topReferrers: { referrer: string; _count: { _all: number } }[];
  topCities: { city: string; _count: { _all: number } }[];
  topRegions: { region: string; _count: { _all: number } }[];
  topCountries: { country: string; _count: { _all: number } }[];
  topBrowsers: { browser: string; _count: { _all: number } }[];
  topOs: { os: string; _count: { _all: number } }[];
  avgDuration: number | null;
  peakHours: { hour: number; count: number }[];
  byDay: { date: string; count: number }[];
  sources: { source: string | null; _count: { _all: number } }[];
}

interface ApiResponse {
  rows: VisitRow[];
  total: number;
  page: number;
  pageSize: number;
  stats: StatsResponse;
}

interface FiltersState {
  q: string;
  device: string;
  period: string;
  source: string;
  sort: "asc" | "desc";
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

function DayChart({ byDay }: { byDay: { date: string; count: number }[] }) {
  const max = Math.max(1, ...byDay.map((item) => item.count));
  const maxBars = 30;
  const data = byDay.slice(-maxBars);
  if (data.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-xs font-medium text-muted-foreground">
        Visitas por dia
      </h4>
      <div className="flex items-end gap-1">
        {data.map((item) => (
          <div key={item.date} className="group flex flex-1 flex-col items-center">
            <div className="flex h-28 w-full items-end">
              <div
                className="w-full rounded-t bg-primary/70 group-hover:bg-primary"
                style={{ height: `${Math.max(4, (item.count / max) * 100)}%` }}
                title={`${item.date}: ${item.count}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisitsPanel() {
  const [state, setState] = React.useState<FiltersState>({
    q: "",
    device: "",
    period: "all",
    source: "all",
    sort: "desc",
  });
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
    const from = periodFrom(state.period);
    if (from) params.set("from", from);
    return params.toString();
  }, [state, page]);

  const loading = data === null || query !== lastLoadedQuery;

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/visits?${query}`)
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
  }, [query]);

  const exportUrl = React.useMemo(() => {
    const params = new URLSearchParams({ source: state.source });
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.device) params.set("device", state.device);
    const from = periodFrom(state.period);
    if (from) params.set("from", from);
    return `/api/admin/visits/csv?${params.toString()}`;
  }, [state]);

  const deviceCount = (type: string) =>
    data?.stats.byDevice.find((item) => item.deviceType === type)?._count._all ?? 0;

  const sourceOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [
      { value: "all", label: "Todas as origens" },
      { value: DIRECT_SOURCE, label: "Sem origem (direto)" },
      ...(data?.stats.sources ?? [])
        .filter((item) => item.source !== null)
        .map((item) => ({ value: item.source!, label: item.source! })),
    ];
    return list.filter(
      (option, index, arr) => arr.findIndex((o) => o.value === option.value) === index
    );
  }, [data?.stats.sources]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          value={state.q}
          onChange={(event) => {
            setState((s) => ({ ...s, q: event.target.value }));
            setPage(1);
          }}
          placeholder="Buscar página, cidade, navegador…"
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
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
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

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Carregando…
        </div>
      ) : data ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <MiniCard label="Total de visitas" value={formatNumber(data.stats.total)} />
            <MiniCard label="Visitantes únicos" value={formatNumber(data.stats.unique)} />
            <MiniCard
              label="Tempo médio"
              value={formatDuration(data.stats.avgDuration)}
            />
            <MiniCard label="Desktop" value={deviceCount("desktop")} />
            <MiniCard label="Mobile" value={deviceCount("mobile")} />
          </div>

          <div className="mt-4 rounded-lg border bg-muted/40 p-3">
            <DayChart byDay={data.stats.byDay} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <TopList
              title="Páginas mais vistas"
              items={data.stats.topPages.map((item) => ({
                label: item.path,
                count: item._count._all,
              }))}
            />
            <TopList
              title="Principais origens"
              items={data.stats.topSources.map((item) => ({
                label: item.source,
                count: item._count._all,
              }))}
            />
            <TopList
              title="Referrers"
              items={data.stats.topReferrers.map((item) => ({
                label: item.referrer,
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
          </div>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Navegador / SO</TableHead>
                  <TableHead>Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhuma visita encontrada para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.rows.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(visit.createdAt)}
                      </TableCell>
                      <TableCell className="max-w-[14rem]">
                        <Link
                          href={visit.path}
                          target="_blank"
                          className="line-clamp-1 text-xs hover:underline"
                        >
                          {visit.path}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary">
                          {visit.source ?? "Sem origem (direto)"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {[visit.country, visit.region, visit.city]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {[visit.deviceType, visit.deviceBrand]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {[visit.browser, visit.os].filter(Boolean).join(" · ") || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDuration(visit.duration)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Mostrando {data.rows.length} de {formatNumber(data.total)} registros
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
  );
}
