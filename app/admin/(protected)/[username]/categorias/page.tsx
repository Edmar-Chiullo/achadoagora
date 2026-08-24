import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCategories } from "@/lib/data/admin";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryActions } from "@/components/admin/category-actions";
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

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [{ username }, categories] = await Promise.all([
    params,
    getAdminCategories(),
  ]);

  return (
    <div>
      <PageHeader
        title="Categorias"
        description={`${categories.length} categoria(s) cadastrada(s).`}
      >
        <Link
          href={`/admin/${username}/categorias/nova`}
          className={buttonVariants({ size: "sm" })}
        >
          <Plus />
          Nova categoria
        </Link>
      </PageHeader>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            Nenhuma categoria cadastrada. Comece criando a primeira.
          </p>
          <Link
            href={`/admin/${username}/categorias/nova`}
            className={buttonVariants({ size: "sm", className: "mt-4" })}
          >
            <Plus />
            Criar categoria
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Link
                      href={`/admin/${username}/categorias/${category.id}/editar`}
                      className="font-medium hover:underline"
                    >
                      {category.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    /categoria/{category.slug}
                  </TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>
                    <Badge
                      variant={category.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {category.status === "ACTIVE" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CategoryActions category={category} />
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
