export const siteConfig = {
  name: "Achadinhos",
  tagline: "Os melhores achados em um só lugar",
  description:
    "Curadoria de produtos recomendados com links de afiliados do Mercado Livre, Shopee e Hotmart. Encontre os melhores achados, ofertas e cursos.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
