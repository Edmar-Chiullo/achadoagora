import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";

export default async function CategoriasShimPage() {
  const session = await requireUser();
  redirect(`/admin/${session.user.username}/categorias`);
}
