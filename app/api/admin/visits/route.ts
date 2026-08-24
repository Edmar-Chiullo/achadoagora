import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVisitHistory, getVisitStats } from "@/lib/data/visits";

export const dynamic = "force-dynamic";

function intParam(
  value: string | null,
  fallback: number,
  min = 1,
  max = 100
): number {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
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
  const filters = {
    source: sp.get("source") ?? "all",
    q: sp.get("q")?.trim() || undefined,
    device: sp.get("device") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    sort: sp.get("sort") === "asc" ? ("asc" as const) : ("desc" as const),
    page: intParam(sp.get("page"), 1, 1, 100000),
    pageSize: intParam(sp.get("pageSize"), 20, 1, 100),
  };

  const [history, stats] = await Promise.all([
    getVisitHistory(filters),
    getVisitStats(filters),
  ]);

  return NextResponse.json({
    rows: history.rows,
    total: history.total,
    page: filters.page,
    pageSize: filters.pageSize,
    stats,
  });
}
