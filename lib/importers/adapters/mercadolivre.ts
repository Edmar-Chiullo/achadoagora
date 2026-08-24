import type { ProductAdapter } from "../types"

const PRICE_SUFFIX_PATTERN = /\s*[-–—|]\s*R\$\s*[\d.,]+\s*$/

export const mercadolivreAdapter: ProductAdapter = {
  platform: "Mercado Livre",
  hosts: [
    "mercadolivre.com",
    "mercadolivre.com.br",
    "mercadolibre.com",
    "mercadolibre.com.ar",
    "mercadolibre.com.mx",
    "mercadolibre.cl",
    "mercadolibre.com.co",
    "meli.com",
  ],
  profile: {
    userAgent:
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    headers: { "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
  },
  isBlockedPage(html) {
    return !html.includes("application/ld+json") && !html.includes('property="og:')
  },
  sanitize(product) {
    const next = { ...product }

    if (next.title) {
      let title = next.title.trim()
      while (PRICE_SUFFIX_PATTERN.test(title)) {
        title = title.replace(PRICE_SUFFIX_PATTERN, "").trim()
      }
      next.title = title || null
    }

    return next
  },
}
