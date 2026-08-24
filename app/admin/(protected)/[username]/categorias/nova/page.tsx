import Link from "next/link";
import { createCategory } from "@/lib/actions/categories";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nova categoria" description="Cadastre uma nova categoria de produtos.">
        <Link
          href={`/admin/${username}/categorias`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <CategoryForm action={createCategory} />
      </div>
    </div>
  );
}
