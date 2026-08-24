import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";

export default async function EditarProdutoShimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, requireUser()]);
  redirect(`/admin/${session.user.username}/produtos/${id}/editar`);
}
