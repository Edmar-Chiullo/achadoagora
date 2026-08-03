export const PLATFORM_BADGE_STYLES: Record<string, string> = {
  yellow: "bg-yellow-100 text-yellow-800",
  orange: "bg-orange-100 text-orange-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
  violet: "bg-violet-100 text-violet-800",
  gray: "bg-gray-100 text-gray-700",
};

export const PLATFORM_BADGE_KEYS = Object.keys(PLATFORM_BADGE_STYLES);

export function platformBadgeClass(key?: string | null): string {
  return PLATFORM_BADGE_STYLES[key ?? "gray"] ?? PLATFORM_BADGE_STYLES.gray;
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
