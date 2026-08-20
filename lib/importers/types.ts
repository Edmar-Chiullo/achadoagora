export interface ImportedProduct {
  sourceUrl: string
  platform: string | null
  title: string | null
  description: string | null
  imageUrl: string | null
  additionalImages: string[]
  price: number | null
  previousPrice: number | null
  currency: string | null
  brand: string | null
  availability: string | null
  extractionMethod: "og" | "jsonld" | "meta" | "mixed"
  confidence: number
  missingFields: string[]
}

export interface ProductImporter {
  canHandle(url: URL): boolean
  import(url: URL): Promise<ImportedProduct>
}

export interface ImportLogEntry {
  id: string
  sourceUrl: string
  platform: string | null
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "PARTIAL" | "FAILED"
  errorCode: string | null
  errorMessage: string | null
  extractionMethod: string | null
  confidence: number | null
  result: unknown
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
}

export interface ImportCacheEntry {
  id: string
  urlHash: string
  url: string
  result: ImportedProduct
  createdAt: Date
  expiresAt: Date
}

export type ImportErrorCode =
  | "INVALID_URL"
  | "BLOCKED_IP"
  | "FETCH_TIMEOUT"
  | "FETCH_ERROR"
  | "REDIRECT_LIMIT"
  | "SIZE_LIMIT"
  | "INVALID_CONTENT_TYPE"
  | "PARSE_ERROR"
  | "CACHE_ERROR"
  | "UNKNOWN_ERROR"
