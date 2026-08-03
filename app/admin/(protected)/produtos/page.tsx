import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/data/admin";
import { platformBadgeClass } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { ProductActions } from "@/components/admin/product-actions";
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
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div>
      <PageHeader
        title="Produtos"
        description={`${products.length} produto(s) cadastrado(s).`}
      >
        <Link
          href="/admin/produtos/novo"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus />
          Novo produto
        </Link>
      </PageHeader>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            Nenhum produto cadastrado. Comece criando o primeiro.
          </p>
          <Link
            href="/admin/produtos/novo"
            className={cn(buttonVariants({ size: "sm" }), "mt-4")}
          >
            <Plus />
            Criar produto
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produtos/${product.id}/editar`}
                          className="line-clamp-1 font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          /produto/{product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? product.category.name : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={platformBadgeClass(product.platform.badgeKey)}
                    >
                      {product.platform.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatPrice(product.price) ?? "—"}
                  </TableCell>
                  <TableCell>{product._count.clicks}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {product.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductActions product={product} />
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
