import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { DIRECT_SOURCE } from "@/lib/constants";
import { APP_TIME_ZONE } from "@/lib/format";

export interface VisitFilters {
  source?: string;
  q?: string;
  device?: string;
  from?: string;
  to?: string;
  sort?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

function buildVisitWhere(f: VisitFilters): Prisma.VisitWhereInput {
  const where: Prisma.VisitWhereInput = {};

  if (f.source === DIRECT_SOURCE) {
    where.source = null;
  } else if (f.source && f.source !== "all") {
    where.source = f.source;
  }

  if (f.device) where.deviceType = f.device;

  if (f.from || f.to) {
    where.createdAt = {};
    if (f.from) where.createdAt.gte = new Date(f.from);
    if (f.to) where.createdAt.lte = new Date(f.to);
  }

  if (f.q) {
    where.OR = [
      { path: { contains: f.q, mode: "insensitive" } },
      { referrer: { contains: f.q, mode: "insensitive" } },
      { source: { contains: f.q, mode: "insensitive" } },
      { city: { contains: f.q, mode: "insensitive" } },
      { region: { contains: f.q, mode: "insensitive" } },
      { country: { contains: f.q, mode: "insensitive" } },
      { browser: { contains: f.q, mode: "insensitive" } },
      { os: { contains: f.q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getVisitHistory(f: VisitFilters) {
  const where = buildVisitWhere(f);
  const page = f.page ?? 1;
  const pageSize = f.pageSize ?? 20;
  const [rows, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      orderBy: { createdAt: f.sort === "asc" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.visit.count({ where }),
  ]);
  return { rows, total };
}

export async function getVisitStats(f: VisitFilters) {
  const where = buildVisitWhere(f);

  const top = (
    field: "path" | "source" | "referrer" | "city" | "region" | "country" | "browser" | "os",
    required = false
  ) =>
    prisma.visit.groupBy({
      where: required ? where : { ...where, [field]: { not: null } },
      by: [field],
      _count: { _all: true },
      orderBy: { _count: { [field]: "desc" } },
      take: 5,
    });

  const [
    total,
    unique,
    byDevice,
    topPages,
    topSources,
    topReferrers,
    topCities,
    topRegions,
    topCountries,
    topBrowsers,
    topOs,
    durationAgg,
    allTimes,
    sources,
  ] = await Promise.all([
    prisma.visit.count({ where }),
    prisma.visit.findMany({
      where: { ...where, vidHash: { not: null } },
      distinct: ["vidHash"],
      select: { vidHash: true },
    }),
    prisma.visit.groupBy({ where, by: ["deviceType"], _count: { _all: true } }),
    top("path", true),
    top("source"),
    top("referrer"),
    top("city"),
    top("region"),
    top("country"),
    top("browser"),
    top("os"),
    prisma.visit.aggregate({ where, _avg: { duration: true }, _sum: { duration: true } }),
    prisma.visit.findMany({ where, select: { createdAt: true } }),
    prisma.visit.groupBy({
      by: ["source"],
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
  ]);

  const hourFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  });
  const dayFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hourCount = new Map<number, number>();
  const dayCount = new Map<string, number>();
  for (const visit of allTimes) {
    const hour = Number(hourFmt.format(visit.createdAt));
    hourCount.set(hour, (hourCount.get(hour) ?? 0) + 1);
    const day = dayFmt.format(visit.createdAt);
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
  const byDay = [...dayCount.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    total,
    unique: unique.length,
    byDevice,
    topPages,
    topSources,
    topReferrers,
    topCities,
    topRegions,
    topCountries,
    topBrowsers,
    topOs,
    avgDuration: durationAgg._avg.duration,
    totalDuration: durationAgg._sum.duration ?? 0,
    peakHours,
    peakDays,
    byDay,
    sources,
  };
}

function brToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getVisitDashboardStats() {
  const today = new Date(`${brToday()}T00:00:00-03:00`);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    total,
    visitsToday,
    visitsLast7Days,
    uniqueLast7Days,
    duration7,
  ] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.count({ where: { createdAt: { gte: today } } }),
    prisma.visit.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.visit.findMany({
      where: { createdAt: { gte: weekAgo }, vidHash: { not: null } },
      distinct: ["vidHash"],
      select: { vidHash: true },
    }),
    prisma.visit.aggregate({
      where: { createdAt: { gte: weekAgo } },
      _avg: { duration: true },
    }),
  ]);

  return {
    total,
    visitsToday,
    visitsLast7Days,
    uniqueLast7Days: uniqueLast7Days.length,
    avgDurationLast7Days: duration7._avg.duration,
  };
}
