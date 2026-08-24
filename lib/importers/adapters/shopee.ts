import type { ProductAdapter } from "../types"

const TITLE_SUFFIX_PATTERN = /\s*[-–—|]\s*Shopee(\s+(Brasil|BR))?$/i

export const shopeeAdapter: ProductAdapter = {
  platform: "Shopee",
  hosts: [
    "shopee.com.br",
    "shopee.com",
    "shopee.com.sg",
    "shopee.com.my",
    "shopee.co.id",
    "shopee.co.th",
    "shopee.ph",
    "shopee.vn",
    "shopee.tw",
  ],
  profile: {
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    headers: { "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
  },
  isBlockedPage(html) {
    return !html.includes("application/ld+json") && !html.includes('property="og:')
  },
  sanitize(product) {
    const next = { ...product }

    if (next.title) {
      const title = next.title.replace(TITLE_SUFFIX_PATTERN, "").trim()
      next.title = title || null
    }

    return next
  },
}
