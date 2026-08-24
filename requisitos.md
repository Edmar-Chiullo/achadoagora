ACHADO AGORA SaaS
Plataforma de criação, gerenciamento e divulgação de vitrines de afiliados

Módulo central: Importador Inteligente de Produtos

1. Visão do produto

O Achado Agora SaaS será uma plataforma multiusuário destinada a afiliados que desejam centralizar, organizar e divulgar seus produtos e links de afiliados em uma vitrine digital própria.

O usuário poderá criar sua própria vitrine, cadastrar produtos manualmente ou utilizar o Importador Inteligente de Produtos, acompanhar cliques e acessos e compartilhar sua página através das redes sociais.

A plataforma deverá permitir que diferentes usuários utilizem a mesma infraestrutura, mantendo isolamento completo dos dados entre as contas.

A atual loja Achado Agora será o primeiro tenant da plataforma.

2. Problema que o produto resolve

Atualmente, um afiliado normalmente precisa:

copiar informações dos produtos;
salvar imagens (URLs);
cadastrar títulos;
copiar preços;
organizar links (Afiliado e Imagens);
divulgar manualmente;
utilizar ferramentas diferentes para acompanhar resultados.

O Achado Agora SaaS pretende centralizar esse processo.

Fluxo desejado
Afiliado
   │
   │ cola URL
   ▼
Importador Inteligente
   │
   ├── identifica produto
   ├── identifica imagem
   ├── identifica preço
   ├── identifica marketplace
   └── identifica metadados
   │
   ▼
Revisão
   │
   ▼
Produto publicado
   │
   ▼
Vitrine do afiliado
   │
   ▼
Redes sociais / WhatsApp / tráfego orgânico
   │
   ▼
Cliques
   │
   ▼
Analytics
3. Modelo de negócio

Inicialmente:

Free

Para aquisição de usuários e validação.

Possíveis limites:

1 vitrine;
limite de produtos;
analytics básico;
importações limitadas.
Pro

Para usuários que realmente utilizam a plataforma.

Possíveis recursos:

produtos ilimitados;
importações ampliadas;
analytics avançado;
banners;
personalização;
domínio personalizado;
pixels;
UTM;
importação em massa.
Business

Futuro:

múltiplos usuários;
equipes;
múltiplas vitrines;
permissões;
API;
automações;
recursos avançados.

Não precisamos definir preços agora.

Primeiro precisamos validar o produto.

4. Arquitetura geral

A arquitetura conceitual será:

                    ACHADO AGORA SaaS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Usuários          Tenants         Admin
          │                │
          │                ├── Produtos
          │                ├── Categorias
          │                ├── Plataformas
          │                ├── Banners
          │                ├── Analytics
          │                └── Configurações
          │
          ▼
       Autenticação
          │
          ▼
      Controle de acesso
          │
          ▼
       Aplicação
          │
     ┌────┴───────────┐
     │                │
 Importador       Dashboard
 Inteligente      Analytics
     │
     ├── Genérico
     ├── Mercado Livre
     ├── Shopee
     ├── Amazon
     ├── Hotmart
     └── Outros
5. Multi-tenancy

Essa é a fundação do projeto.

Teremos:

User
Tenant
Membership

Não devemos simplesmente considerar:

User = Loja

O correto é:

Usuário
   │
   └── pertence a um Tenant
             │
             ├── Produtos
             ├── Categorias
             ├── Banners
             └── Analytics

Isso permite evolução futura para equipes.

6. Usuários
User
id
name
email
avatar
status
createdAt
updatedAt
7. Tenants
Tenant
id
name
slug
description
logo
status
planId
ownerId
createdAt
updatedAt

Exemplo:

Tenant
id: 001
name: Achado Agora
slug: achado-agora

Outro usuário:

Tenant
id: 002
name: Ofertas do João
slug: ofertas-do-joao
8. Membership

Para preparar o sistema para equipes:

Membership
├── id
├── tenantId
├── userId
├── role
├── status
├── createdAt
└── updatedAt

Roles iniciais:

SUPER_ADMIN
TENANT_ADMIN
TENANT_MEMBER
9. Regra fundamental de segurança

Todo dado privado deverá possuir vínculo com o tenant.

Exemplo:

Product
├── id
├── tenantId
├── title
├── imageUrl
└── affiliateUrl

O backend deverá sempre verificar:

usuário autenticado
       ↓
membership
       ↓
tenant
       ↓
recurso

Nunca confiar no tenantId enviado pelo cliente.

10. Produtos

Estrutura:

Product


id
tenantId


title
slug
description


imageUrl
additionalImages


sourceUrl
affiliateUrl


platformId
categoryId


price
previousPrice
discountPercentage
currency


brand
sku
gtin


status


sourceType


createdAt
updatedAt

sourceType:

MANUAL
IMPORTED
API
11. Categorias

As categorias precisam ser separadas entre:

Globais

Controladas pelo administrador.

Exemplo:

Eletrônicos
Ferramentas
Roupas
Cursos
Casa
Acessórios
Personalizadas

Futuramente cada tenant poderá criar categorias próprias.

Isso deve ser previsto desde o início.

12. Plataformas

Nada de lista fixa no código.

Teremos:

Platform


id
name
slug
logo
baseUrl
status
importerType
createdAt
updatedAt

Exemplo:

Mercado Livre
Shopee
Amazon
Hotmart
Outros

Isso preserva aquela decisão que você já tomou anteriormente: novas plataformas devem poder ser cadastradas sem alterar o código da aplicação.

13. Importador Inteligente de Produtos

Este será um dos módulos mais importantes.

Entrada

O usuário fornece:

URL do anúncio

Exemplo:

https://www.exemplo.com/produto/123
14. Processo de importação
URL
 ↓
Validação
 ↓
Detecção da plataforma
 ↓
Escolha do importer
 ↓
Busca da página
 ↓
Extração
 ↓
Normalização
 ↓
Validação
 ↓
Score de confiança
 ↓
Preview
 ↓
Revisão
 ↓
Salvar
15. Camadas do Importador
GenericImporter

Tenta identificar:

og:title
og:image
og:description
og:url

Depois:

JSON-LD

Procurando:

Product
Offer
AggregateOffer

Depois metatags específicas.

16. Importadores específicos

Arquitetura:

importers/


├── generic
├── mercadolivre
├── shopee
├── amazon
└── hotmart

Cada adapter implementará uma interface comum:

interface ProductImporter {
  canHandle(url: URL): boolean


  import(url: URL): Promise<ImportedProduct>
}

Isso permite adicionar novas plataformas sem reescrever o módulo.

17. Resultado intermediário

O sistema não grava diretamente no produto.

Primeiro cria:

ImportedProduct

Exemplo:

{
  sourceUrl,
  platform,
  title,
  description,
  imageUrl,
  additionalImages,
  price,
  previousPrice,
  currency,
  discountPercentage,
  brand,
  sku,
  gtin,
  category,
  availability,
  extractionMethod,
  confidence
}
18. Score de confiança

O sistema deverá indicar a qualidade da importação.

Exemplo:

Importação concluída


Confiança: 94%

Ou:

Confiança: 61%


⚠ Alguns dados precisam ser revisados.

Isso é especialmente útil quando estamos lidando com páginas diferentes.

19. Preview

Depois da importação:

┌─────────────────────────────────┐
│ Produto encontrado              │
│                                 │
│ [ IMAGEM ]                      │
│                                 │
│ Título                          │
│ [________________________]      │
│                                 │
│ Preço                           │
│ [ R$ 99,90 ]                    │
│                                 │
│ Plataforma                      │
│ [ Shopee ]                      │
│                                 │
│ Categoria                       │
│ [ Eletrônicos ]                 │
│                                 │
│ [Cancelar] [Salvar rascunho]   │
└─────────────────────────────────┘
20. Imagens
Primeira versão

Armazenar:

imageUrl

apontando para a origem.

Não teremos servidor próprio de imagens.

Arquitetura preparada para evolução
imageSource


EXTERNAL
STORAGE

Futuramente:

URL externa
     ↓
Object Storage
     ↓
CDN

Isso pode ser implementado com R2 posteriormente.

21. Fallback manual

Se o importador não encontrar tudo:

Título ✓
Imagem ✓
Preço ✕
Categoria ✕

O usuário poderá completar:

Preço: [________]


Categoria: [________]

Assim uma falha parcial nunca bloqueia o cadastro.

22. Segurança do importador

Obrigatório:

validação de URL;
somente HTTP/HTTPS;
proteção contra SSRF;
bloqueio de IPs privados;
timeout;
limite de redirecionamentos;
limite de tamanho;
validação de Content-Type;
sanitização;
rate limiting.

O importador não pode ser transformado em uma ferramenta para o usuário fazer o backend acessar recursos internos.

23. Cache

Criar mecanismo de cache:

URL
 ↓
Hash
 ↓
Cache
 ↓
Resultado

Evita consultar a mesma página repetidamente.

24. Logs do importador

Criar:

ProductImportLog


id
tenantId
userId


sourceUrl
platform


status
errorCode


extractionMethod
confidence


startedAt
completedAt
createdAt

Status:

PENDING
PROCESSING
SUCCESS
PARTIAL
FAILED
25. Vitrine pública

Cada tenant terá uma página pública.

Exemplo:

achadoagora.com.br/loja/achado-agora

Outro:

achadoagora.com.br/loja/ofertas-do-joao

A página deverá apresentar:

logo;
nome;
descrição;
redes sociais;
categorias;
produtos;
ofertas;
busca;
compartilhamento.
26. Futuro domínio personalizado

A arquitetura deverá permitir posteriormente:

ofertasdojoao.com.br

ou:

joao.achadoagora.com.br

Não precisa ser implementado no MVP.

27. Dashboard do afiliado
Dashboard


┌──────────────────────────────────┐
│ Visitantes       1.248           │
│ Cliques          3.421           │
│ Produtos           87            │
│ Conversão         12,4%          │
└──────────────────────────────────┘

Depois:

Cliques por origem


Instagram
WhatsApp
Google
Facebook
TikTok
Direto
28. Analytics detalhado

Cada clique poderá registrar:

clickId
tenantId
productId


timestamp


source
medium
campaign


referrer


country
region
city


device
browser
os


platform

O usuário poderá clicar na origem e abrir:

Data
Hora
Localidade
Região
Dispositivo
Navegador
Sistema operacional
Produto
Plataforma
UTM
Referrer

Isso aproveita exatamente a funcionalidade que você já estava planejando.

29. Privacidade

Aqui precisamos ter cuidado.

Não devemos transformar o analytics em coleta indiscriminada de dados pessoais.

A implementação deverá considerar:

minimização de dados;
finalidade;
retenção;
anonimização quando aplicável;
transparência;
controles de privacidade.

Especialmente porque o produto será utilizado por terceiros.

Eu não colocaria IP completo como informação visível para o afiliado por padrão.

30. Painel administrativo

Você terá um painel diferente.

ADMIN


Dashboard
│
├── Usuários
├── Tenants
├── Produtos
├── Plataformas
├── Categorias
├── Planos
├── Assinaturas
├── Importações
├── Analytics
├── Logs
├── Moderação
└── Configurações
31. Onboarding

Essa será uma funcionalidade crítica.

Novo usuário:

Criar conta
     ↓
Criar vitrine
     ↓
Escolher nome
     ↓
Escolher slug
     ↓
Adicionar primeiro produto
     ↓
Importar produto
     ↓
Publicar

O objetivo deve ser:

Do cadastro à primeira vitrine publicada em poucos minutos.

32. Plano de desenvolvimento

Eu dividiria a transformação completa em 10 fases.

Fase 0 — Auditoria

Antes de alterar código:

mapear arquitetura atual;
banco;
autenticação;
rotas;
painel;
analytics;
entidades;
dependências.

Não pular esta fase.

Fase 1 — Fundação SaaS
User;
Tenant;
Membership;
Roles;
autenticação;
isolamento;
tenantId.
Fase 2 — Migração do Achado Agora

Transformar a loja atual no:

Tenant #1

Migrar:

produtos;
categorias;
plataformas;
banners;
configurações;
analytics.
Fase 3 — Importador
URL validator;
generic importer;
OpenGraph;
JSON-LD;
normalização;
preview;
fallback;
logs.
Fase 4 — Adapters

Adicionar os primeiros marketplaces prioritários.

Eu começaria com 2, validaríamos o processo e depois expandiríamos.

Fase 5 — Vitrine
perfil;
slug;
produtos;
categorias;
SEO;
compartilhamento;
responsividade.
Fase 6 — Analytics
eventos;
origem;
dispositivo;
localização;
UTM;
dashboard;
detalhamento.
Fase 7 — Onboarding
criação de loja;
configuração;
primeiro produto;
primeiro compartilhamento;
checklist de conclusão.
Fase 8 — Monetização
planos;
limites;
assinatura;
cobrança;
controle de recursos.
Fase 9 — Segurança e observabilidade
rate limiting;
logs;
auditoria;
monitoramento;
erros;
métricas;
proteção de APIs.
Fase 10 — Beta

Convidar inicialmente:

5–10 afiliados.

Não milhares.

Queremos observar:

onde eles travam;
quais plataformas usam;
quantos produtos cadastram;
quantas importações falham;
quais funcionalidades pedem;
se entendem o produto;
se voltam a utilizá-lo.
33. MVP real

Para não cair no erro de construir um produto enorme antes de validar, nosso primeiro MVP seria:

                    MVP
                     │
       ┌─────────────┼─────────────┐
       │             │             │
    Conta          Loja        Produtos
       │             │             │
       │             │       Importador
       │             │             │
       └─────────────┼─────────────┘
                     │
                  Analytics

Com:

cadastro/login;
tenant;
painel;
vitrine;
produtos;
categorias;
plataformas;
importador;
analytics básico;
isolamento dos dados.

Sem cobrança inicialmente.

34. NÃO fazer no primeiro MVP

Eu deixaria para depois:

❌ aplicativo mobile;

❌ domínio personalizado;

❌ equipe/múltiplos membros;

❌ API pública;

❌ marketplace de afiliados;

❌ IA para descrição de produtos;

❌ automação de posts;

❌ integração com todos os marketplaces;

❌ sistema financeiro complexo;

❌ programa de indicação;

❌ dezenas de planos.

Tudo isso pode vir depois.

35. Critério de sucesso do MVP

Eu consideraria o MVP validado quando conseguirmos:

Usuário
 ↓
Cria conta
 ↓
Cria vitrine
 ↓
Cola URL
 ↓
Produto é importado
 ↓
Revisa
 ↓
Publica
 ↓
Compartilha
 ↓
Recebe visitantes
 ↓
Visualiza cliques

E, principalmente:

Outro afiliado consegue fazer isso sem precisar da sua ajuda.

Esse será um dos indicadores mais importantes.

36. Stack

Eu manteria a stack que você já vem utilizando, evitando uma reescrita desnecessária:

Frontend
Next.js
TypeScript
Tailwind CSS


Backend
Next.js
Route Handlers / Server Actions


Auth
Firebase Auth


Database
Firebase Realtime Database

Para o SaaS, porém, precisamos avaliar se o Realtime Database continua sendo a melhor escolha para analytics e consultas multi-tenant. Não mudaria isso por antecipação, mas colocaria essa avaliação na Fase 0.

Se o volume de eventos crescer bastante, provavelmente será interessante separar:

Dados operacionais
        ↓
Database principal


Eventos / Analytics
        ↓
estrutura otimizada para eventos
37. Estrutura de módulos

Eu organizaria o projeto aproximadamente assim:

src/
│
├── app/
│   ├── (public)/
│   ├── dashboard/
│   ├── admin/
│   ├── loja/
│   └── api/
│
├── modules/
│   ├── auth/
│   ├── tenants/
│   ├── products/
│   ├── categories/
│   ├── platforms/
│   ├── storefront/
│   ├── analytics/
│   ├── importers/
│   ├── banners/
│   ├── plans/
│   └── subscriptions/
│
├── components/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── security/
│   ├── analytics/
│   └── importers/
│
└── types/

Isso separa claramente o domínio do produto.

38. O diferencial do Achado Agora SaaS

Eu não venderia a plataforma simplesmente como:

"Crie sua página de links."

Existem muitas soluções desse tipo.

O diferencial deveria ser:

"Cole o link do produto. Nós montamos sua oferta."

E depois:

"Publique, compartilhe e descubra de onde vêm seus cliques."

Isso transforma o produto em uma ferramenta de trabalho para afiliados.

39. Visão futura

A longo prazo, eu enxergo:

                 ACHADO AGORA
                      │
       ┌──────────────┼───────────────┐
       │              │               │
     Criar           Gerenciar       Analisar
       │              │               │
   Vitrines       Produtos         Analytics
       │              │               │
       └──────────────┼───────────────┘
                      │
                 Automatizar
                      │
               Importação
               Divulgação
               Campanhas
                      │
                      ▼
               MAIS CONVERSÕES

Isso é muito mais interessante comercialmente do que simplesmente disponibilizar uma página de links.

Próximo passo que eu recomendo

Não começaria a implementar tudo isso ainda.

O próximo passo técnico correto é fazermos a Fase 0 — Auditoria e especificação da aplicação atual.

Precisamos pegar o que você já tem e produzir uma matriz:

Módulo atual	Situação	Mudança SaaS
Autenticação	Existente	Multi-tenant
Produtos	Existente	tenantId
Categorias	Existente	Global + tenant
Plataformas	Existente	Global
Banners	Existente	tenantId
Analytics	Existente	tenantId
ADM	Existente	Admin global
Vitrine	Existente	Storefront por tenant
Imagens	URL externa	Importador
Importação	Inexistente	Novo módulo