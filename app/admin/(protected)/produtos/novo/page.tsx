import Link from "next/link";
import { getAllCategories } from "@/lib/data/admin";
import { createProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Novo produto" description="Cadastre um novo produto recomendado.">
        <Link href="/admin/produtos" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <ProductForm action={createProduct} categories={categories} />
      </div>
    </div>
  );
}
