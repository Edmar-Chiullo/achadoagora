import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";

export default async function AdminIndexPage() {
  const session = await requireUser();
  redirect(`/admin/${session.user.username}/dashboard`);
}
