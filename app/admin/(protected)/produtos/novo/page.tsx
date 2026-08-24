import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-utils";

export default async function NovoProdutoShimPage() {
  const session = await requireUser();
  redirect(`/admin/${session.user.username}/produtos/novo`);
}
