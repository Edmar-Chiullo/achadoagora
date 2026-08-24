import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClickHistory, type ClickFilters } from "@/lib/data/admin";
import { APP_TIME_ZONE } from "@/lib/format";

export const dynamic = "force-dynamic";

const CSV_HEADERS = [
  "Data",
  "Hora",
  "Origem (UTM)",
  "UTM Medium",
  "UTM Campanha",
  "UTM Termo",
  "UTM Conteúdo",
  "Produto",
  "Marketplace",
  "Página acessada",
  "País",
  "Estado",
  "Cidade",
  "Dispositivo",
  "Fabricante",
  "Navegador",
  "Sistema operacional",
  "Referrer",
  "Idioma",
  "IP (hash)",
];

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const filters: ClickFilters = {
    source: sp.get("source") ?? "all",
    q: sp.get("q")?.trim() || undefined,
    device: sp.get("device") || undefined,
    platform: sp.get("platform") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    sort: sp.get("sort") === "asc" ? "asc" : "desc",
    page: 1,
    pageSize: 100000,
    userId: session.user.role === "ADMIN" ? null : session.user.id,
  };

  const { rows } = await getClickHistory(filters);

  const dateFmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const lines = [CSV_HEADERS.join(";")];
  for (const click of rows) {
    lines.push(
      [
        csvCell(dateFmt.format(click.createdAt)),
        csvCell(timeFmt.format(click.createdAt)),
        csvCell(click.source ?? "Sem origem (direto)"),
        csvCell(click.utmMedium),
        csvCell(click.utmCampaign),
        csvCell(click.utmTerm),
        csvCell(click.utmContent),
        csvCell(click.product.title),
        csvCell(click.platform),
        csvCell(click.pageUrl),
        csvCell(click.country),
        csvCell(click.region),
        csvCell(click.city),
        csvCell(click.deviceType),
        csvCell(click.deviceBrand),
        csvCell(click.browser),
        csvCell(click.os),
        csvCell(click.referrer),
        csvCell(click.locale),
        csvCell(click.ipHash),
      ].join(";")
    );
  }

  return new NextResponse("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cliques.csv"`,
    },
  });
}
