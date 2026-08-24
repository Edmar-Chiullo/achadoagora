import { requireUser } from "@/lib/auth-utils";
import { updateProfile } from "@/lib/actions/profile";
import { PageHeader } from "@/components/admin/page-header";
import { ProfileForm } from "@/components/admin/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Meu perfil"
        description="Atualize seu nome de exibição e gerencie sua senha."
      />
      <div className="rounded-xl border bg-card p-6">
        <ProfileForm
          action={updateProfile}
          initialName={session.user.name ?? ""}
          username={session.user.username}
        />
      </div>
    </div>
  );
}
