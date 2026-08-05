import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "achadinhos-ip-salt";

function hashIp(rawIp: string | null): string | null {
  if (!rawIp) return null;
  const ip = rawIp.split(",")[0].trim();
  if (!ip) return null;
  return createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex");
}

function parseDevice(userAgent: string | null) {
  if (!userAgent) return { browser: null, os: null, deviceType: null, deviceBrand: null };
  const result = new UAParser(userAgent).getResult();
  return {
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
    deviceType: result.device.type ?? "desktop",
    deviceBrand: result.device.vendor ?? null,
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: { platform: { select: { slug: true } } },
  });

  if (!product) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const url = new URL(request.url);
  const source =
    url.searchParams.get("utm_source") ||
    (await cookies()).get("utm_source")?.value ||
    null;

  const headerList = await headers();
  const userAgent = headerList.get("user-agent");
  const rawIp =
    headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || null;
  const acceptLanguage = headerList.get("accept-language")?.split(",")[0]?.trim() ?? null;

  const device = parseDevice(userAgent);

  await prisma.click.create({
    data: {
      productId: product.id,
      platform: product.platform.slug,
      source,
      userAgent,
      ipHash: hashIp(rawIp),
      country: headerList.get("x-vercel-ip-country") || null,
      region: headerList.get("x-vercel-ip-country-region") || null,
      city: headerList.get("x-vercel-ip-city") || null,
      referrer: headerList.get("referer") || null,
      pageUrl: url.pathname,
      utmMedium: url.searchParams.get("utm_medium"),
      utmCampaign: url.searchParams.get("utm_campaign"),
      utmTerm: url.searchParams.get("utm_term"),
      utmContent: url.searchParams.get("utm_content"),
      locale: acceptLanguage,
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      deviceBrand: device.deviceBrand,
    },
  });

  return NextResponse.redirect(product.affiliateLink, 302);
}
