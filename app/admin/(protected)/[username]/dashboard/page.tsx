import Link from "next/link";
import { Activity, Clock, Eye, MousePointerClick, Package, Star } from "lucide-react";
import { requireUser, isAdminSession } from "@/lib/auth-utils";
import { getDashboardStats, getAllPlatforms, getPerUserSummaries } from "@/lib/data/admin";
import { getVisitDashboardStats } from "@/lib/data/visits";
import { platformBadgeClass } from "@/lib/constants";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ClicksBySource } from "@/components/admin/clicks-by-source";
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await requireUser();
  const isAdmin = isAdminSession(session);
  const scopedUserId = isAdmin ? null : session.user.id;

  const [{ username }, stats, platforms, visitStats, perUser] = await Promise.all([
    params,
    getDashboardStats(scopedUserId),
    getAllPlatforms(),
    isAdmin ? getVisitDashboardStats() : Promise.resolve(null),
    isAdmin ? getPerUserSummaries() : Promise.resolve(null),
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
        description={
          isAdmin
            ? "Visão geral de todos os produtos e cliques do site."
            : "Visão geral dos seus produtos e cliques."
        }
      >
        <Link
          href={`/admin/${username}/produtos/novo`}
          className={buttonVariants({ size: "sm" })}
        >
          Novo produto
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isAdmin ? "Total de produtos" : "Meus produtos"}
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
        {isAdmin && visitStats ? (
          <>
            <StatCard
              title="Visitas (7 dias)"
              value={formatNumber(visitStats.visitsLast7Days)}
              icon={Eye}
              hint={`${formatNumber(visitStats.uniqueLast7Days)} visitantes únicos`}
            />
            <StatCard
              title="Tempo médio (7 dias)"
              value={formatDuration(visitStats.avgDurationLast7Days)}
              icon={Clock}
            />
          </>
        ) : null}
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
            <ClicksBySource
              sources={stats.clicksBySource.map((item) => ({
                source: item.source,
                count: item._count._all,
              }))}
              platforms={platforms.map((platform) => ({
                slug: platform.slug,
                name: platform.name,
                badgeKey: platform.badgeKey,
              }))}
            />
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
                  {isAdmin ? <TableHead>Autor</TableHead> : null}
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
                    {isAdmin ? (
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        @{click.product.user.username}
                      </TableCell>
                    ) : null}
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
                      {formatDateTime(click.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAdmin && perUser ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumo por usuário</CardTitle>
            <CardDescription>
              Produtos cadastrados por cada usuário do painel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Ativos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perUser.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <span className="font-medium">{user.name ?? user.email}</span>{" "}
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNumber(user.totalProducts)}</TableCell>
                    <TableCell>{formatNumber(user.activeProducts)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
