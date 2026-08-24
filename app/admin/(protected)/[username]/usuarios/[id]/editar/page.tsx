import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-utils";
import { getAdminUserById } from "@/lib/data/users";
import { updateUser } from "@/lib/actions/users";
import { PageHeader } from "@/components/admin/page-header";
import { UserForm, type UserFormData } from "@/components/admin/user-form";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  await requireAdmin();
  const { username, id } = await params;
  const user = await getAdminUserById(id);
  if (!user) notFound();

  const initialData: UserFormData = {
    name: user.name ?? "",
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const action = updateUser.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Editar usuário"
        description={user.name ?? user.email}
      >
        <Link
          href={`/admin/${username}/usuarios`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Voltar
        </Link>
      </PageHeader>
      <div className="rounded-xl border bg-card p-6">
        <UserForm action={action} initialData={initialData} isEdit />
      </div>
    </div>
  );
}
