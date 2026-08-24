import Link from "next/link";
import { requireAdmin } from "@/lib/auth-utils";
import { createUser } from "@/lib/actions/users";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewUserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await requireAdmin();
  const { username } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Novo usuário"
        description="Cadastre um novo acesso ao painel. O usuário verá apenas o próprio conteúdo (exceto administradores)."
      >
        <Link
          href={`/admin/${username}/usuarios`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <UserForm action={createUser} />
      </div>
    </div>
  );
}
