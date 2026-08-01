export const PLATFORM_META: Record<
  "MERCADO_LIVRE" | "SHOPEE" | "HOTMART" | "OUTRO",
  { label: string; short: string; badge: string }
> = {
  MERCADO_LIVRE: {
    label: "Mercado Livre",
    short: "ML",
    badge: "bg-yellow-100 text-yellow-800",
  },
  SHOPEE: {
    label: "Shopee",
    short: "SP",
    badge: "bg-orange-100 text-orange-800",
  },
  HOTMART: {
    label: "Hotmart",
    short: "HM",
    badge: "bg-blue-100 text-blue-800",
  },
  OUTRO: {
    label: "Outro",
    short: "OU",
    badge: "bg-gray-100 text-gray-700",
  },
};

export const PLATFORM_VALUES = [
  "MERCADO_LIVRE",
  "SHOPEE",
  "HOTMART",
  "OUTRO",
] as const;

export type PlatformKey = (typeof PLATFORM_VALUES)[number];

export function platformLabel(platform: string): string {
  return PLATFORM_META[platform as PlatformKey]?.label ?? platform;
}

export const DEFAULT_CATEGORIES = [
  { name: "Casa", slug: "casa" },
  { name: "Ferramentas", slug: "ferramentas" },
  { name: "Tecnologia", slug: "tecnologia" },
  { name: "Moda", slug: "moda" },
  { name: "Automotivo", slug: "automotivo" },
  { name: "Eletrônicos", slug: "eletronicos" },
  { name: "Cursos", slug: "cursos" },
  { name: "Ofertas", slug: "ofertas" },
];
