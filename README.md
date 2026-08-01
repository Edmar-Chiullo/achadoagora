# Achadinhos

Agregador de produtos com links de afiliados (Mercado Livre, Shopee, Hotmart e outros). Área pública para os visitantes e área administrativa para o dono cadastrar/editar produtos, categorias e acompanhar cliques.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4** (tema via `app/globals.css`)
- **Prisma 7** + **PostgreSQL** (Neon)
- **Auth.js v5** (credentials + JWT) — login administrativo
- **Zod** (validação), **lucide-react**, **PostHog** (opcional)

## Como rodar

Pré-requisitos: Node.js 20+, um banco PostgreSQL (o `.env` aponta para um Neon) e as variáveis de ambiente.

```bash
npm install
cp .env.example .env   # preencha com seus valores
```

### Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Connection string do PostgreSQL (Neon). `sslmode=require` |
| `AUTH_SECRET` | Secret do Auth.js (gere com `npx auth secret`) |
| `AUTH_TRUST_HOST` | `true` para rodar local |
| `NEXT_PUBLIC_APP_URL` | URL pública (ex.: `http://localhost:3000`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Cria o admin no seed (padrão: `admin@achadinhos.com.br` / `admin123`) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog (opcional, pode ficar vazio) |

### Banco de dados

```bash
npm run db:migrate   # aplica as migrações
npm run db:seed      # cria admin + categorias + produtos de exemplo
```

### Desenvolvimento e produção

```bash
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run start      # serve o build
```

### Checagens

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Acesso administrativo

Login em `/admin/login` com o usuário criado pelo seed (veja `ADMIN_EMAIL`/`ADMIN_PASSWORD`). Por padrão: `admin@achadinhos.com.br` / `admin123`.

## Estrutura

```
app/
  (public)/            # Home, categoria/[slug], produto/[slug], buscar
  admin/               # login, dashboard, produtos, categorias (CRUD)
  api/auth/[...nextauth]/  # Auth.js
  go/[slug]/           # redirect de afiliado + rastreio de cliques
  sitemap.ts, robots.ts
components/
  ui/                  # botões, cards, inputs, diálogos, etc.
  product/             # card, grid, imagem, badge de plataforma
  public/              # header, footer, busca, ícones sociais
  admin/               # formulários, ações, sidebar, métricas
  analytics/           # UTM capture + PostHog
lib/
  prisma.ts, auth.ts, auth-utils.ts
  data/                # consultas públicas e do admin
  actions/             # server actions (produtos, categorias, auth)
  validations/         # esquemas Zod
prisma/
  schema.prisma, seed.ts, migrations/
```

## Detalhes técnicos

- **Prisma 7**: usa driver adapter (`@prisma/adapter-pg` + `pg`) e o gerador `prisma-client` com saída em `app/generated/prisma`.
- **Cliques**: `/go/[slug]` grava plataforma, origem (UTM) e user-agent, e redireciona com `302` para o link de afiliado.
- **SEO**: metadata dinâmica, Open Graph, JSON-LD em produtos, `sitemap.xml` e `robots.txt`.
- **Ícones de marcas** (Instagram, Facebook, TikTok, etc.) são SVGs próprios em `components/public/social-icons.tsx`, pois a `lucide-react` v1 não os exporta.
