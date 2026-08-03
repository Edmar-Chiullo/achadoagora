import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PLATFORMS = [
  { name: "Mercado Livre", slug: "mercado-livre", shortLabel: "ML", badgeKey: "yellow" },
  { name: "Shopee", slug: "shopee", shortLabel: "SP", badgeKey: "orange" },
  { name: "Hotmart", slug: "hotmart", shortLabel: "HM", badgeKey: "blue" },
  { name: "Outro", slug: "outro", shortLabel: "OU", badgeKey: "gray" },
];

const DEFAULT_CATEGORIES = [
  { name: "Casa", slug: "casa" },
  { name: "Ferramentas", slug: "ferramentas" },
  { name: "Tecnologia", slug: "tecnologia" },
  { name: "Moda", slug: "moda" },
  { name: "Automotivo", slug: "automotivo" },
  { name: "Eletrônicos", slug: "eletronicos" },
  { name: "Cursos", slug: "cursos" },
  { name: "Ofertas", slug: "ofertas" },
];

const SAMPLE_PRODUCTS = [
  {
    title: "Furadeira de Impacto 650W",
    slug: "furadeira-de-impacto-650w",
    description:
      "Furadeira de impacto ideal para pequenos reparos e trabalhos domésticos. Acompanha maleta com acessórios e vem com mandril de 13mm.",
    category: "ferramentas",
    platform: "mercado-livre",
    affiliateLink: "https://www.mercadolivre.com.br/",
    price: "189.9",
    image: "https://picsum.photos/seed/furadeira/640/480",
    featured: true,
  },
  {
    title: "Cafeteira Elétrica 40 xícaras",
    slug: "cafeteira-eletrica-40-xicaras",
    description:
      "Cafeteira elétrica com jarra de vidro para até 40 xícaras. Perfeita para receber visitas e facilitar o dia a dia.",
    category: "casa",
    platform: "shopee",
    affiliateLink: "https://shopee.com.br/",
    price: "149.9",
    image: "https://picsum.photos/seed/cafeteira/640/480",
    featured: true,
  },
  {
    title: "Caixa de Som Bluetooth 40W",
    slug: "caixa-de-som-bluetooth-40w",
    description:
      "Caixa de som portátil com 40W de potência, bateria de longa duração e resistente a respingos d'água.",
    category: "eletronicos",
    platform: "shopee",
    affiliateLink: "https://shopee.com.br/",
    price: "129.9",
    image: "https://picsum.photos/seed/caixadesom/640/480",
    featured: true,
  },
  {
    title: "Curso Completo de Marketing Digital",
    slug: "curso-completo-marketing-digital",
    description:
      "Aprenda do zero a divulgar produtos e construir presença digital. Curso com certificado e acesso vitalício.",
    category: "cursos",
    platform: "hotmart",
    affiliateLink: "https://hotmart.com/",
    price: "97",
    image: "https://picsum.photos/seed/curso/640/480",
    featured: true,
  },
  {
    title: "Kit de Organizadores para Cozinha",
    slug: "kit-organizadores-cozinha",
    description:
      "Conjunto com 6 organizadores para manter sua cozinha limpa e organizada. Fácil instalação.",
    category: "casa",
    platform: "mercado-livre",
    affiliateLink: "https://www.mercadolivre.com.br/",
    price: "79.9",
    image: "https://picsum.photos/seed/organizador/640/480",
    featured: false,
  },
  {
    title: "Tênis de Corrida Leve",
    slug: "tenis-de-corrida-leve",
    description:
      "Tênis de corrida com amortecimento responsivo e cabedal respirável. Disponível em várias cores e tamanhos.",
    category: "moda",
    platform: "shopee",
    affiliateLink: "https://shopee.com.br/",
    price: "159.9",
    image: "https://picsum.photos/seed/tenis/640/480",
    featured: true,
  },
  {
    title: "Multímetro Digital Profissional",
    slug: "multimetro-digital-profissional",
    description:
      "Multímetro digital com display LCD e função de teste de continuidade. Ideal para eletricistas e hobistas.",
    category: "ferramentas",
    platform: "mercado-livre",
    affiliateLink: "https://www.mercadolivre.com.br/",
    price: "89.9",
    image: "https://picsum.photos/seed/multimetro/640/480",
    featured: false,
  },
  {
    title: "Suporte Veicular Magnético",
    slug: "suporte-veicular-magnetico",
    description:
      "Suporte magnético para celular no carro com fixação forte e ângulo ajustável. Instalação em segundos.",
    category: "automotivo",
    platform: "mercado-livre",
    affiliateLink: "https://www.mercadolivre.com.br/",
    price: "39.9",
    image: "https://picsum.photos/seed/suporte/640/480",
    featured: false,
  },
];

async function main() {
  console.log("Seeding database…");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@achadinhos.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrador",
      password: passwordHash,
    },
  });
  console.log(`✓ Usuário administrador: ${user.email} (senha: ${adminPassword})`);

  for (const category of DEFAULT_CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
        description: `Produtos recomendados da categoria ${category.name}.`,
        status: "ACTIVE",
      },
    });
    console.log(`✓ Categoria: ${created.name}`);
  }

  for (const platform of DEFAULT_PLATFORMS) {
    const created = await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: {
        name: platform.name,
        shortLabel: platform.shortLabel,
        badgeKey: platform.badgeKey,
      },
      create: {
        name: platform.name,
        slug: platform.slug,
        shortLabel: platform.shortLabel,
        badgeKey: platform.badgeKey,
        status: "ACTIVE",
      },
    });
    console.log(`✓ Plataforma: ${created.name}`);
  }

  for (const sample of SAMPLE_PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: sample.category },
    });
    const platform = await prisma.platform.findUnique({
      where: { slug: sample.platform },
    });

    const created = await prisma.product.upsert({
      where: { slug: sample.slug },
      update: {},
      create: {
        title: sample.title,
        slug: sample.slug,
        description: sample.description,
        image: sample.image,
        price: sample.price,
        categoryId: category?.id ?? null,
        platformId: platform?.id ?? "",
        affiliateLink: sample.affiliateLink,
        status: "ACTIVE",
        featured: sample.featured,
      },
    });
    console.log(`✓ Produto: ${created.title}`);
  }

  console.log("Seed concluído!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
