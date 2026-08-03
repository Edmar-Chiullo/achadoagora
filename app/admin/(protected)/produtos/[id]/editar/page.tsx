import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getAllPlatforms, getAdminProductById } from "@/lib/data/admin";
import { updateProduct } from "@/lib/actions/products";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  const [categories, platforms] = await Promise.all([
    getAllCategories(),
    getAllPlatforms(),
  ]);

  const initialData: ProductFormData = {
    title: product.title,
    slug: product.slug,
    description: product.description ?? "",
    image: product.image ?? "",
    price: product.price != null ? String(product.price) : "",
    categoryId: product.categoryId ?? "",
    platformId: product.platformId,
    affiliateLink: product.affiliateLink,
    status: product.status,
    featured: product.featured,
  };

  const action = updateProduct.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Editar produto"
        description={product.title}
      >
        <Link
          href="/admin/produtos"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <ProductForm
          action={action}
          categories={categories}
          platforms={platforms}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
