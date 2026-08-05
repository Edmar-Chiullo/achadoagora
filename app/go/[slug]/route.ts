import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { decodeParam, hashIp, parseDevice } from "@/lib/tracking";

export const dynamic = "force-dynamic";

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
      country: decodeParam(headerList.get("x-vercel-ip-country")),
      region: decodeParam(headerList.get("x-vercel-ip-country-region")),
      city: decodeParam(headerList.get("x-vercel-ip-city")),
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
