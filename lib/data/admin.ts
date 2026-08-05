import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { DIRECT_SOURCE } from "@/lib/constants";

export async function getDashboardStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalClicks,
    clicksLast7Days,
    clicksByPlatform,
    clicksBySource,
    recentClicks,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE", featured: true } }),
    prisma.click.count(),
    prisma.click.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.click.groupBy({
      by: ["platform"],
      _count: { _all: true },
      orderBy: { _count: { platform: "desc" } },
    }),
    prisma.click.groupBy({
      by: ["source"],
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
    prisma.click.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: { select: { id: true, title: true, slug: true } } },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    featuredProducts,
    totalClicks,
    clicksLast7Days,
    clicksByPlatform,
    clicksBySource,
    recentClicks,
  };
}

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      platform: { select: { id: true, name: true, slug: true, badgeKey: true } },
      _count: { select: { clicks: true } },
    },
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, platform: true },
  });
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getAdminCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getAdminPlatforms() {
  return prisma.platform.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getAdminPlatformById(id: string) {
  return prisma.platform.findUnique({ where: { id } });
}

export async function getAllPlatforms() {
  return prisma.platform.findMany({
    orderBy: { name: "asc" },
  });
}

export interface ClickFilters {
  source?: string;
  q?: string;
  device?: string;
  platform?: string;
  from?: string;
  to?: string;
  sort?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function buildClickWhere(f: ClickFilters): Prisma.ClickWhereInput {
  const where: Prisma.ClickWhereInput = {};

  if (f.source === DIRECT_SOURCE) {
    where.source = null;
  } else if (f.source && f.source !== "all") {
    where.source = f.source;
  }

  if (f.platform) where.platform = f.platform;
  if (f.device) where.deviceType = f.device;

  if (f.from || f.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = new Date(f.from);
    if (f.to) where.createdAt.lte = new Date(f.to);
  }

  if (f.q) {
    where.OR = [
      { product: { title: { contains: f.q, mode: "insensitive" } } },
      { platform: { contains: f.q, mode: "insensitive" } },
      { city: { contains: f.q, mode: "insensitive" } },
      { region: { contains: f.q, mode: "insensitive" } },
      { country: { contains: f.q, mode: "insensitive" } },
      { browser: { contains: f.q, mode: "insensitive" } },
      { os: { contains: f.q, mode: "insensitive" } },
      { referrer: { contains: f.q, mode: "insensitive" } },
      { source: { contains: f.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getClickHistory(f: ClickFilters) {
  const where = buildClickWhere(f);
  const page = f.page ?? 1;
  const pageSize = f.pageSize ?? 20;
  const [rows, total] = await Promise.all([
    prisma.click.findMany({
      where,
      orderBy: { createdAt: f.sort === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { product: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.click.count({ where }),
  ]);
  return { rows, total };
}

export async function getClickStats(f: ClickFilters) {
  const where = buildClickWhere(f);

  const top = (field: "browser" | "os" | "city" | "region" | "country") =>
    prisma.click.groupBy({
      where: { ...where, [field]: { not: null } },
      by: [field],
      _count: { _all: true },
      orderBy: { _count: { [field]: "desc" } },
      take: 5,
    });

  const [
    total,
    unique,
    byDevice,
    topBrowsers,
    topOs,
    topCities,
    topRegions,
    topCountries,
    topPlatforms,
    topProducts,
    allTimes,
  ] = await Promise.all([
    prisma.click.count({ where }),
    prisma.click.findMany({
      where: { ...where, ipHash: { not: null } },
      distinct: ["ipHash", "productId"],
      select: { ipHash: true },
    }),
    prisma.click.groupBy({ where, by: ["deviceType"], _count: { _all: true } }),
    top("browser"),
    top("os"),
    top("city"),
    top("region"),
    top("country"),
    prisma.click.groupBy({
      where,
      by: ["platform"],
      _count: { _all: true },
      orderBy: { _count: { platform: "desc" } },
      take: 5,
    }),
    prisma.click.groupBy({
      where,
      by: ["productId"],
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
    prisma.click.findMany({ where, select: { createdAt: true } }),
  ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true },
      })
    : [];
  const productTitle = new Map(products.map((p) => [p.id, p.title]));

  const hourFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const dayFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hourCount = new Map<number, number>();
  const dayCount = new Map<string, number>();
  for (const click of allTimes) {
    const hour = Number(hourFmt.format(click.createdAt));
    hourCount.set(hour, (hourCount.get(hour) ?? 0) + 1);
    const day = dayFmt.format(click.createdAt);
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }
  const peakHours = [...hourCount.entries()]
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const peakDays = [...dayCount.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    unique: unique.length,
    byDevice,
    topBrowsers,
    topOs,
    topCities,
    topRegions,
    topCountries,
    topPlatforms,
    topProducts: topProducts.map((p) => ({
      title: productTitle.get(p.productId) ?? p.productId,
      count: p._count._all,
    })),
    topProduct: topProducts[0]
      ? {
          title: productTitle.get(topProducts[0].productId) ?? topProducts[0].productId,
          count: topProducts[0]._count._all,
        }
      : null,
    topMarketplace: topPlatforms[0] ?? null,
    peakHours,
    peakDays,
  };
}
