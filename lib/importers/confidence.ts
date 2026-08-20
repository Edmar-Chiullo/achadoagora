import type { ImportedProduct } from "./types"

interface ConfidenceResult {
  score: number
  missingFields: string[]
}

const FIELD_WEIGHTS: Record<string, number> = {
  title: 30,
  imageUrl: 25,
  price: 25,
  platform: 10,
  description: 10,
}

export function calculateConfidence(product: ImportedProduct): ConfidenceResult {
  const missingFields: string[] = []
  let score = 0

  if (product.title && product.title.trim().length > 0) {
    score += FIELD_WEIGHTS.title
  } else {
    missingFields.push("title")
  }

  if (product.imageUrl && isValidImageUrl(product.imageUrl)) {
    score += FIELD_WEIGHTS.imageUrl
  } else {
    missingFields.push("imageUrl")
  }

  if (product.price !== null && product.price > 0) {
    score += FIELD_WEIGHTS.price
  } else {
    missingFields.push("price")
  }

  if (product.platform && product.platform.trim().length > 0) {
    score += FIELD_WEIGHTS.platform
  } else {
    missingFields.push("platform")
  }

  if (product.description && product.description.trim().length > 0) {
    score += FIELD_WEIGHTS.description
  } else {
    missingFields.push("description")
  }

  return { score: Math.min(score, 100), missingFields }
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false

  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function getConfidenceLabel(score: number): {
  label: string
  color: "green" | "yellow" | "red"
} {
  if (score >= 80) {
    return { label: "Alta", color: "green" }
  }
  if (score >= 50) {
    return { label: "Média", color: "yellow" }
  }
  return { label: "Baixa", color: "red" }
}
