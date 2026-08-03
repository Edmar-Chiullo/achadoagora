import Link from "next/link";
import { Activity, MousePointerClick, Package, Star } from "lucide-react";
import { getDashboardStats, getAllPlatforms } from "@/lib/data/admin";
import { platformBadgeClass } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, platforms] = await Promise.all([
    getDashboardStats(),
    getAllPlatforms(),
  ]);

  const platformBySlug = new Map(
    platforms.map((platform) => [platform.slug, platform])
  );

  const totalPlatformClicks = stats.clicksByPlatform.reduce(
    (acc, item) => acc + item._count._all,
    0
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos produtos e cliques."
      >
        <Link
          href="/admin/produtos/novo"
          className={buttonVariants({ size: "sm" })}
        >
          Novo produto
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de produtos"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
        />
        <StatCard
          title="Produtos ativos"
          value={formatNumber(stats.activeProducts)}
          icon={Activity}
          hint={`${formatNumber(stats.featuredProducts)} em destaque`}
        />
        <StatCard
          title="Produtos destacados"
          value={formatNumber(stats.featuredProducts)}
          icon={Star}
        />
        <StatCard
          title="Total de cliques"
          value={formatNumber(stats.totalClicks)}
          icon={MousePointerClick}
          hint={`${formatNumber(stats.clicksLast7Days)} nos últimos 7 dias`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliques por plataforma</CardTitle>
            <CardDescription>Distribuição dos cliques registrados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalPlatformClicks === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum clique registrado ainda.
              </p>
            ) : (
              stats.clicksByPlatform.map((item) => {
                const count = item._count._all;
                const percentage = Math.round((count / totalPlatformClicks) * 100);
                const label = platformBySlug.get(item.platform)?.name ?? item.platform;
                return (
                  <div key={item.platform}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(count)} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliques por origem (UTM)</CardTitle>
            <CardDescription>
              De qual rede social ou fonte os cliques vieram.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.clicksBySource.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum clique registrado ainda.
              </p>
            ) : (
              <ul className="divide-y">
                {stats.clicksBySource.map((item) => (
                  <li
                    key={item.source ?? "direct"}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <Badge variant="secondary">
                      {item.source ?? "Sem origem (direto)"}
                    </Badge>
                    <span className="font-medium">
                      {formatNumber(item._count._all)} cliques
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Últimos cliques</CardTitle>
          <CardDescription>Os 10 cliques mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentClicks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum clique registrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentClicks.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell>
                      <Link
                        href={`/produto/${click.product.slug}`}
                        target="_blank"
                        className="line-clamp-1 hover:underline"
                      >
                        {click.product.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={platformBadgeClass(
                          platformBySlug.get(click.platform)?.badgeKey
                        )}
                      >
                        {platformBySlug.get(click.platform)?.name ?? click.platform}
                      </Badge>
                    </TableCell>
                    <TableCell>{click.source ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(click.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
