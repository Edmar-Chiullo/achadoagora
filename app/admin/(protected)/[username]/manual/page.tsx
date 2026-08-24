import type { Metadata } from "next";
import {
  BarChart3,
  BookOpen,
  Import,
  LayoutDashboard,
  Package,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth-utils";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Manual",
};

export const dynamic = "force-dynamic";

const sections = [
  { id: "visao-geral", label: "Visão geral", icon: BookOpen },
  { id: "perfis-e-acesso", label: "Perfis e acesso", icon: Users },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "importador", label: "Importador por URL", icon: Import },
  { id: "categorias-plataformas", label: "Categorias e plataformas", icon: Tags },
  { id: "estatisticas", label: "Estatísticas", icon: BarChart3 },
  { id: "perfil", label: "Meu perfil", icon: UserCircle },
];

function Step({ children }: { children: React.ReactNode }) {
  return <li className="ml-4 list-decimal space-y-1">{children}</li>;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
      💡 {children}
    </p>
  );
}

export default async function ManualPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await requireUser();
  const { username } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Manual"
        description="Como o painel funciona: guia completo de todos os módulos."
      />

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Sumário do manual">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <section.icon className="size-3.5" aria-hidden />
            {section.label}
          </a>
        ))}
      </nav>

      <div className="space-y-6">
        <Card id="visao-geral" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" aria-hidden />
              Visão geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              Este site é um agregador de achadinhos: cada pessoa cadastrada publica
              produtos com links de afiliados, e a página pública{" "}
              <Badge variant="secondary">achadoagora.com.br</Badge> exibe os produtos de
              todos os usuários juntos.
            </p>
            <p>
              O painel administrativo fica em <code>/admin/SEU-USUARIO</code>. Cada
              usuário tem seu próprio espaço: o que você cadastra aparece na sua lista,
              nas suas estatísticas e no site público.
            </p>
            <Tip>
              Guarde a URL do seu painel (ex.: /admin/joao). É por ela que você acessa
              após fazer login.
            </Tip>
          </CardContent>
        </Card>

        <Card id="perfis-e-acesso" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" aria-hidden />
              Perfis e acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <ul className="space-y-2">
              <li className="ml-4 list-disc">
                <strong>Usuário</strong> — acessa todos os módulos do painel
                (dashboard, produtos, categorias, plataformas, manual e perfil), mas vê{" "}
                <strong>somente o próprio conteúdo</strong>.
              </li>
              <li className="ml-4 list-disc">
                <strong>Administrador</strong> — vê tudo: produtos de todos os usuários,
                estatísticas globais, visitas do site e o módulo exclusivo de{" "}
                <strong>Usuários</strong>, onde novas contas são criadas.
              </li>
            </ul>
            <p>
              Não existe cadastro público: quem cria contas é o administrador, em{" "}
              <code>/admin/{username}/usuarios → Novo usuário</code>.
            </p>
          </CardContent>
        </Card>

        <Card id="dashboard" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="size-5" aria-hidden />
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              É a primeira tela após o login. Mostra o total de produtos, ativos,
              destacados e cliques — sempre com escopo do seu perfil (o administrador vê
              os números de todo o site, além de um resumo por usuário).
            </p>
            <p>
              Os gráficos de <strong>cliques por plataforma</strong> e{" "}
              <strong>cliques por origem (UTM)</strong> ajudam a entender de onde vem o
              tráfego dos seus links. A tabela de últimos cliques mostra os 10 mais
              recentes.
            </p>
          </CardContent>
        </Card>

        <Card id="produtos" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" aria-hidden />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>Aqui você cadastra e gerencia os seus achadinhos.</p>
            <ol className="space-y-1">
              <Step>
                Vá em <strong>Produtos → Novo produto</strong>.
              </Step>
              <Step>
                Preencha título, link de afiliado e plataforma (obrigatórios). Preço,
                categoria, imagem e descrição são opcionais, mas melhoram a aparência no
                site.
              </Step>
              <Step>
                Marque <strong>Destaque</strong> para aparecer entre os destaques da home
                e deixe o status <strong>Ativo</strong> para publicar.
              </Step>
            </ol>
            <p>
              Na lista, use os atalhos para ativar/desativar rapidamente, destacar ou
              excluir. Produtos inativos continuam salvos, mas não aparecem no site.
            </p>
            <Tip>
              O slug é gerado automaticamente pelo título e se torna a URL pública do
              produto (/produto/seu-titulo).
            </Tip>
          </CardContent>
        </Card>

        <Card id="importador" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="size-5" aria-hidden />
              Importador por URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              No formulário de produto, cole a URL do marketplace no campo de importação:
              o sistema extrai título, descrição, preço e imagem automaticamente (funciona
              com Mercado Livre, Shopee e Amazon; outras lojas podem funcionar parcialmente).
            </p>
            <ol className="space-y-1">
              <Step>Cole a URL do produto no campo indicado.</Step>
              <Step>
                Clique em <strong>Importar</strong> e revise os dados preenchidos.
              </Step>
              <Step>
                Substitua o link extraído pelo seu <strong>link de afiliado</strong>{" "}
                antes de salvar.
              </Step>
            </ol>
            <Tip>
              Há um limite de 10 importações por minuto para evitar bloqueios dos
              marketplaces.
            </Tip>
          </CardContent>
        </Card>

        <Card id="categorias-plataformas" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-5" aria-hidden />
              Categorias e plataformas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              São <strong>compartilhadas entre todos os usuários</strong>: as categorias
              organizam o menu do site público, e as plataformas identificam a loja de
              origem (Mercado Livre, Shopee, Hotmart…) com sua etiqueta colorida.
            </p>
            <p>
              Qualquer usuário pode criar ou editar, então prefira reutilizar uma
              categoria existente antes de criar outra igual.
            </p>
          </CardContent>
        </Card>

        <Card id="estatisticas" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" aria-hidden />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              Cada clique em <code>/go/…</code> é registrado com plataforma, origem (UTM),
              geolocalização aproximada e dispositivo.
            </p>
            <ul className="space-y-2">
              <li className="ml-4 list-disc">
                <strong>Usuários</strong> veem os cliques dos próprios produtos nos cards
                e gráficos do dashboard.
              </li>
              <li className="ml-4 list-disc">
                <strong>Administradores</strong> têm acesso extra ao módulo{" "}
                <strong>Visitas</strong>, com histórico completo de visitas ao site,
                filtros e exportação CSV.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card id="perfil" className="scroll-mt-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-5" aria-hidden />
              Meu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p>
              Em <strong>Meu perfil</strong> você altera seu nome de exibição e sua senha
              (confirmando com a senha atual).
            </p>
            <p>
              O nome de usuário define a URL do painel e só pode ser alterado por um
              administrador, em <strong>Usuários → Editar</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
