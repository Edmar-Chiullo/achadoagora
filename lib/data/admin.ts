import { prisma } from "@/lib/prisma";

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
