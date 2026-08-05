import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeParam, hashIp, hashValue, isBot, parseDevice } from "@/lib/tracking";

export const dynamic = "force-dynamic";

const VID_COOKIE = "vid";
const VID_MAX_AGE = 60 * 60 * 24 * 400;

function clampLength(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const text = value.trim().slice(0, max);
  return text || null;
}

function normalizeSource(
  utmSource: string | null,
  referrer: string | null
): string | null {
  if (utmSource) return utmSource;
  if (referrer) {
    try {
      return new URL(referrer).hostname;
    } catch {
      return referrer;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const headerList = request.headers;
  const userAgent = headerList.get("user-agent");
  if (isBot(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const rawPath = typeof body.path === "string" ? body.path.trim() : "";
  if (!rawPath.startsWith("/")) {
    return NextResponse.json({ error: "Path inválido" }, { status: 400 });
  }

  const rawIp =
    headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || null;
  const acceptLanguage = headerList.get("accept-language")?.split(",")[0]?.trim() ?? null;

  const utmSource = clampLength(
    typeof body.utmSource === "string" ? body.utmSource : null,
    200
  );
  const referrer = clampLength(
    typeof body.referrer === "string" ? body.referrer : null,
    500
  );
  const device = parseDevice(userAgent);

  const vid = request.cookies.get(VID_COOKIE)?.value || randomUUID();

  const visit = await prisma.visit.create({
    data: {
      path: rawPath.slice(0, 500),
      referrer,
      source: normalizeSource(utmSource, referrer),
      utmMedium: clampLength(
        typeof body.utmMedium === "string" ? body.utmMedium : null,
        200
      ),
      utmCampaign: clampLength(
        typeof body.utmCampaign === "string" ? body.utmCampaign : null,
        200
      ),
      utmTerm: clampLength(
        typeof body.utmTerm === "string" ? body.utmTerm : null,
        200
      ),
      utmContent: clampLength(
        typeof body.utmContent === "string" ? body.utmContent : null,
        200
      ),
      userAgent: userAgent ? userAgent.slice(0, 500) : null,
      ipHash: hashIp(rawIp),
      vidHash: hashValue(vid),
      country: decodeParam(headerList.get("x-vercel-ip-country")),
      region: decodeParam(headerList.get("x-vercel-ip-country-region")),
      city: decodeParam(headerList.get("x-vercel-ip-city")),
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      deviceBrand: device.deviceBrand,
      locale: acceptLanguage,
    },
  });

  const response = NextResponse.json({ id: visit.id }, { status: 200 });
  response.cookies.set(VID_COOKIE, vid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: VID_MAX_AGE,
  });
  return response;
}
