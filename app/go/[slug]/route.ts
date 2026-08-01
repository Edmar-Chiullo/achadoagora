import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
  });

  if (!product) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const url = new URL(request.url);
  const source =
    url.searchParams.get("utm_source") ||
    (await cookies()).get("utm_source")?.value ||
    null;
  const userAgent = (await headers()).get("user-agent");

  await prisma.click.create({
    data: {
      productId: product.id,
      platform: product.platform,
      source,
      userAgent,
    },
  });

  return NextResponse.redirect(product.affiliateLink, 302);
}
