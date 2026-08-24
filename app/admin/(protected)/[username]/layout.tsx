import { redirect } from "next/navigation";
import { requireUser, isAdminSession } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function UsernameLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const session = await requireUser();
  const { username } = await params;

  if (!session.user.username) {
    redirect("/admin/login");
  }

  if (username !== session.user.username) {
    redirect(`/admin/${session.user.username}/dashboard`);
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <AdminSidebar
        username={username}
        isAdmin={isAdminSession(session)}
        userName={session.user.name ?? session.user.email ?? username}
        userEmail={session.user.email ?? ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
