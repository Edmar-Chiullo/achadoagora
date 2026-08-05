export function formatPrice(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const APP_TIME_ZONE = "America/Sao_Paulo";

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function truncate(text: string | null | undefined, length: number): string {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
