import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function clampSeconds(value: unknown): number | null {
  const seconds = Math.floor(Number(value));
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.min(7200, seconds);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const seconds = clampSeconds(body.seconds);
  if (!id || seconds === null) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  await prisma.visit.updateMany({
    where: { id, duration: null },
    data: { duration: seconds },
  });

  return new NextResponse(null, { status: 204 });
}
