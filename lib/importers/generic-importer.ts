import * as cheerio from "cheerio"
import type { ImportedProduct } from "./types"
import { fetchWithProtection } from "./url-validator"
import { calculateConfidence } from "./confidence"
import { findAdapter } from "./adapters"
import { MarketplaceBlockedError } from "./errors"

interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  url?: string
  price?: string
  currency?: string
}

interface JsonLdProduct {
  "@type": string
  name?: string
  description?: string
  image?: string | string[]
  url?: string
  brand?: string | { name?: string }
  offers?: {
    price?: string | number
    priceCurrency?: string
    availability?: string
    lowPrice?: string | number
    highPrice?: string | number
  }
}

function extractOpenGraph($: cheerio.CheerioAPI): OpenGraphData {
  const getMetaContent = (property: string): string | undefined => {
    const content =
      $(`meta[property="${property}"]`).attr("content") ||
      $(`meta[name="${property}"]`).attr("content")
    return content?.trim() || undefined
  }

  return {
    title: getMetaContent("og:title") || getMetaContent("twitter:title"),
    description:
      getMetaContent("og:description") || getMetaContent("twitter:description") || getMetaContent("description"),
    image: getMetaContent("og:image") || getMetaContent("twitter:image"),
    url: getMetaContent("og:url"),
    price: getMetaContent("product:price:amount") || getMetaContent("og:price:amount"),
    currency:
      getMetaContent("product:price:currency") || getMetaContent("og:price:currency"),
  }
}

function extractJsonLd($: cheerio.CheerioAPI): JsonLdProduct | null {
  const scripts = $("script[type='application/ld+json']")

  for (let i = 0; i < scripts.length; i++) {
    const content = $(scripts[i]).html()
    if (!content) continue

    try {
      const data = JSON.parse(content)

      if (data["@type"] === "Product") {
        return data as JsonLdProduct
      }

      if (Array.isArray(data["@graph"])) {
        const product = data["@graph"].find(
          (item: { "@type": string }) => item["@type"] === "Product",
        )
        if (product) return product as JsonLdProduct
      }

      if (Array.isArray(data)) {
        const product = data.find(
          (item: { "@type": string }) => item["@type"] === "Product",
        )
        if (product) return product as JsonLdProduct
      }
    } catch {
      continue
    }
  }

  return null
}

function extractMetaTags($: cheerio.CheerioAPI): OpenGraphData {
  const title = $("title").text().trim() || undefined
  const description = $('meta[name="description"]').attr("content")?.trim() || undefined
  const image =
    $('link[rel="image_src"]').attr("href") ||
    $('meta[name="image"]')?.attr("content")?.trim() ||
    undefined

  return { title, description, image }
}

function parsePrice(priceStr: string | number | undefined): number | null {
  if (priceStr === undefined || priceStr === null) return null

  const str = String(priceStr).trim()
  if (!str) return null

  const cleaned = str.replace(/[^\d.,]/g, "")
  if (!/\d/.test(cleaned)) return null

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")

  let normalized: string

  if (hasComma && hasDot) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "")
  } else if (hasComma) {
    const parts = cleaned.split(",")
    normalized =
      parts.length === 2 && parts[1].length !== 3
        ? cleaned.replace(",", ".")
        : cleaned.replace(/,/g, "")
  } else {
    const parts = cleaned.split(".")
    normalized =
      parts.length > 2 && parts[1].length === 3
        ? cleaned.replace(/\./g, "")
        : cleaned
  }

  const price = parseFloat(normalized)
  return isNaN(price) ? null : price
}

function normalizeCurrency(currency: string | undefined): string {
  if (!currency) return "BRL"
  const upper = currency.toUpperCase()
  if (["BRL", "USD", "EUR", "ARS", "COP", "CLP", "MXN"].includes(upper)) {
    return upper
  }
  return "BRL"
}

function extractImages($: cheerio.CheerioAPI, ogImage: string | undefined): string[] {
  const images: string[] = []

  if (ogImage) {
    images.push(ogImage)
  }

  const galleryImages = $('meta[property="og:image"]').toArray()
  for (const img of galleryImages) {
    const content = $(img).attr("content")
    if (content && !images.includes(content)) {
      images.push(content)
    }
  }

  return images
}

function detectPlatform(url: URL, $: cheerio.CheerioAPI): string | null {
  const hostname = url.hostname.toLowerCase()

  const platformMap: Record<string, string[]> = {
    "Mercado Livre": [
      "mercadolivre.com.br",
      "mercadolibre.com",
      "mercadolibre.com.ar",
      "mercadolibre.com.mx",
      "meli.com",
    ],
    Shopee: ["shopee.com", "shopee.com.br", "shopee.com.sg", "shopee.com.my"],
    Amazon: [
      "amazon.com",
      "amazon.com.br",
      "amazon.co.uk",
      "amazon.de",
      "amzn.to",
    ],
    Hotmart: ["hotmart.com", "hotmart.com.br", "hmtrk.io"],
    AliExpress: ["aliexpress.com", "aliexpress.us"],
    "Magazine Luiza": ["magazineluiza.com.br", "magalu.com.br"],
    Americanas: ["americanas.com.br"],
    "Casas Bahia": ["casasbahia.com.br"],
    "Extra (Lojas Americanas)": ["extra.com.br"],
    Submarino: ["submarino.com.br"],
  }

  for (const [platform, domains] of Object.entries(platformMap)) {
    if (domains.some((domain) => hostname.includes(domain))) {
      return platform
    }
  }

  const bodyText = $("body").text().toLowerCase()
  if (bodyText.includes("mercado livre") || bodyText.includes("mercadolivre")) {
    return "Mercado Livre"
  }
  if (bodyText.includes("shopee")) {
    return "Shopee"
  }

  return null
}

export function parseProductHtml(html: string, url: URL): ImportedProduct {
  const $ = cheerio.load(html)

  const ogData = extractOpenGraph($)
  const jsonLd = extractJsonLd($)
  const metaTags = extractMetaTags($)

  let extractionMethod: ImportedProduct["extractionMethod"] = "og"
  let title: string | null = null
  let description: string | null = null
  let imageUrl: string | null = null
  let price: number | null = null
  let previousPrice: number | null = null
  let currency: string | null = null
  let brand: string | null = null
  let availability: string | null = null

  if (ogData.title) title = ogData.title
  if (ogData.description) description = ogData.description
  if (ogData.image) imageUrl = ogData.image
  if (ogData.price) price = parsePrice(ogData.price)
  if (ogData.currency) currency = normalizeCurrency(ogData.currency)

  if (jsonLd) {
    extractionMethod = title && jsonLd.name ? "mixed" : "jsonld"

    if (!title && jsonLd.name) title = jsonLd.name
    if (!description && jsonLd.description) description = jsonLd.description
    if (!brand && jsonLd.brand) {
      brand = typeof jsonLd.brand === "string" ? jsonLd.brand : jsonLd.brand.name || null
    }
    if (jsonLd.offers) {
      if (!price && jsonLd.offers.price) {
        price = parsePrice(jsonLd.offers.price)
      }
      if (!price && jsonLd.offers.lowPrice) {
        price = parsePrice(jsonLd.offers.lowPrice)
        if (jsonLd.offers.highPrice) {
          previousPrice = parsePrice(jsonLd.offers.highPrice)
        }
      }
      if (!currency && jsonLd.offers.priceCurrency) {
        currency = normalizeCurrency(jsonLd.offers.priceCurrency)
      }
      availability = jsonLd.offers.availability || null
    }

    if (!imageUrl && jsonLd.image) {
      imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image
    }
  }

  if (!title || !description) {
    extractionMethod = title ? "mixed" : "meta"
    if (!title && metaTags.title) title = metaTags.title
    if (!description && metaTags.description) description = metaTags.description
    if (!imageUrl && metaTags.image) imageUrl = metaTags.image
  }

  if (!currency) {
    currency = "BRL"
  }

  const additionalImages: string[] = []
  const pushImage = (img?: string | null) => {
    if (!img || img === imageUrl) return
    if (!additionalImages.includes(img)) additionalImages.push(img)
  }

  if (jsonLd?.image) {
    const jsonLdImages = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image]
    for (const img of jsonLdImages) pushImage(img)
  }
  for (const img of extractImages($, imageUrl ?? undefined)) pushImage(img)

  const platform = detectPlatform(url, $)

  const importedProduct: ImportedProduct = {
    sourceUrl: url.href,
    platform,
    title,
    description,
    imageUrl,
    additionalImages,
    price,
    previousPrice,
    currency,
    brand,
    availability,
    extractionMethod,
    confidence: 0,
    missingFields: [],
  }

  const { score, missingFields } = calculateConfidence(importedProduct)
  importedProduct.confidence = score
  importedProduct.missingFields = missingFields

  return importedProduct
}

export async function importFromUrl(url: URL): Promise<ImportedProduct> {
  const adapter = findAdapter(url.hostname)
  const { response } = await fetchWithProtection(url, adapter?.profile)

  const html = await response.text()

  if (adapter?.isBlockedPage?.(html)) {
    throw new MarketplaceBlockedError(adapter.platform)
  }

  let product = parseProductHtml(html, url)

  if (adapter) {
    product = adapter.sanitize ? adapter.sanitize(product) : product
    product = { ...product, platform: adapter.platform }

    const { score, missingFields } = calculateConfidence(product)
    product.confidence = score
    product.missingFields = missingFields
  }

  return product
}
