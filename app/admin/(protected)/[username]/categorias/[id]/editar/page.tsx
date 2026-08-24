import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategoryById } from "@/lib/data/admin";
import { updateCategory } from "@/lib/actions/categories";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryForm, type CategoryFormData } from "@/components/admin/category-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  const category = await getAdminCategoryById(id);
  if (!category) notFound();

  const initialData: CategoryFormData = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    status: category.status,
  };

  const action = updateCategory.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Editar categoria" description={category.name}>
        <Link
          href={`/admin/${username}/categorias`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <CategoryForm action={action} initialData={initialData} />
      </div>
    </div>
  );
}
