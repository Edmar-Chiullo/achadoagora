import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPlatformById } from "@/lib/data/admin";
import { updatePlatform } from "@/lib/actions/platforms";
import { PageHeader } from "@/components/admin/page-header";
import { PlatformForm, type PlatformFormData } from "@/components/admin/platform-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditPlatformPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const platform = await getAdminPlatformById(id);
  if (!platform) notFound();

  const initialData: PlatformFormData = {
    name: platform.name,
    slug: platform.slug,
    shortLabel: platform.shortLabel ?? "",
    badgeKey: platform.badgeKey ?? "gray",
    status: platform.status,
  };

  const action = updatePlatform.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Editar plataforma" description={platform.name}>
        <Link
          href="/admin/plataformas"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <PlatformForm action={action} initialData={initialData} />
      </div>
    </div>
  );
}
