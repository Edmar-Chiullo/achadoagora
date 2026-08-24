import Link from "next/link";
import { createPlatform } from "@/lib/actions/platforms";
import { PageHeader } from "@/components/admin/page-header";
import { PlatformForm } from "@/components/admin/platform-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewPlatformPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Nova plataforma" description="Cadastre uma nova plataforma de afiliados.">
        <Link
          href={`/admin/${username}/plataformas`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <PlatformForm action={createPlatform} />
      </div>
    </div>
  );
}
