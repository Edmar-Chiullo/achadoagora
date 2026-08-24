import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVisitHistory, type VisitFilters } from "@/lib/data/visits";
import { APP_TIME_ZONE } from "@/lib/format";

export const dynamic = "force-dynamic";

const CSV_HEADERS = [
  "Data",
  "Hora",
  "Página",
  "Origem",
  "UTM Medium",
  "UTM Campanha",
  "Referrer",
  "País",
  "Estado",
  "Cidade",
  "Dispositivo",
  "Fabricante",
  "Navegador",
  "Sistema operacional",
  "Idioma",
  "Duração (s)",
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
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso restrito ao administrador." },
      { status: 403 }
    );
  }

  const sp = request.nextUrl.searchParams;
  const filters: VisitFilters = {
    source: sp.get("source") ?? "all",
    q: sp.get("q")?.trim() || undefined,
    device: sp.get("device") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    sort: sp.get("sort") === "asc" ? "asc" : "desc",
    page: 1,
    pageSize: 100000,
  };

  const { rows } = await getVisitHistory(filters);

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
  for (const visit of rows) {
    lines.push(
      [
        csvCell(dateFmt.format(visit.createdAt)),
        csvCell(timeFmt.format(visit.createdAt)),
        csvCell(visit.path),
        csvCell(visit.source ?? "Sem origem (direto)"),
        csvCell(visit.utmMedium),
        csvCell(visit.utmCampaign),
        csvCell(visit.referrer),
        csvCell(visit.country),
        csvCell(visit.region),
        csvCell(visit.city),
        csvCell(visit.deviceType),
        csvCell(visit.deviceBrand),
        csvCell(visit.browser),
        csvCell(visit.os),
        csvCell(visit.locale),
        csvCell(visit.duration),
        csvCell(visit.ipHash),
      ].join(";")
    );
  }

  return new NextResponse("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="visitas.csv"`,
    },
  });
}
