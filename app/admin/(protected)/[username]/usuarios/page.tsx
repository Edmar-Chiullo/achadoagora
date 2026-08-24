import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth-utils";
import { getAdminUsers } from "@/lib/data/users";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { UserActions } from "@/components/admin/user-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await requireAdmin();
  const [{ username }, users] = await Promise.all([params, getAdminUsers()]);

  return (
    <div>
      <PageHeader
        title="Usuários"
        description={`${users.length} usuário(s) cadastrado(s). Apenas administradores acessam este módulo.`}
      >
        <Link
          href={`/admin/${username}/usuarios/novo`}
          className={buttonVariants({ size: "sm" })}
        >
          <Plus />
          Novo usuário
        </Link>
      </PageHeader>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>URL do painel</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/admin/${username}/usuarios/${user.id}/editar`}
                    className="font-medium hover:underline"
                  >
                    {user.name ?? "—"}
                  </Link>
                  {user.id === session.user.id ? (
                    <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                  ) : null}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  /admin/{user.username}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.products}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions
                    user={{
                      id: user.id,
                      name: user.name,
                      productCount: user._count.products,
                      isSelf: user.id === session.user.id,
                      isAdminRole: user.role === "ADMIN",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
