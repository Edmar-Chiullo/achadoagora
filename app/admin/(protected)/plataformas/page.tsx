import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminPlatforms } from "@/lib/data/admin";
import { platformBadgeClass } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { PlatformActions } from "@/components/admin/platform-actions";
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

export default async function AdminPlatformsPage() {
  const platforms = await getAdminPlatforms();

  return (
    <div>
      <PageHeader
        title="Plataformas"
        description={`${platforms.length} plataforma(s) cadastrada(s).`}
      >
        <Link
          href="/admin/plataformas/nova"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus />
          Nova plataforma
        </Link>
      </PageHeader>

      {platforms.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            Nenhuma plataforma cadastrada. Comece criando a primeira.
          </p>
          <Link
            href="/admin/plataformas/nova"
            className={buttonVariants({ size: "sm", className: "mt-4" })}
          >
            <Plus />
            Criar plataforma
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Atalho</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell>
                    <Link
                      href={`/admin/plataformas/${platform.id}/editar`}
                      className="font-medium hover:underline"
                    >
                      {platform.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {platform.slug}
                  </TableCell>
                  <TableCell>
                    <Badge className={platformBadgeClass(platform.badgeKey)}>
                      {platform.shortLabel ?? platform.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{platform._count.products}</TableCell>
                  <TableCell>
                    <Badge
                      variant={platform.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {platform.status === "ACTIVE" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PlatformActions platform={platform} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
