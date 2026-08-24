import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";

export default async function NovaCategoriaShimPage() {
  const session = await requireUser();
  redirect(`/admin/${session.user.username}/categorias/nova`);
}
