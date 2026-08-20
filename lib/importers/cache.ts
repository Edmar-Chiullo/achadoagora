import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"
import type { ImportedProduct } from "./types"

const CACHE_TTL_HOURS = 24

export function generateUrlHash(url: string): string {
  return createHash("sha256").update(url.toLowerCase().trim()).digest("hex")
}

export async function getCachedImport(url: string): Promise<ImportedProduct | null> {
  const urlHash = generateUrlHash(url)

  const cached = await prisma.importCache.findUnique({
    where: { urlHash },
  })

  if (!cached) return null

  if (new Date() > cached.expiresAt) {
    await prisma.importCache.delete({ where: { id: cached.id } })
    return null
  }

  return cached.result as unknown as ImportedProduct
}

export async function setCachedImport(
  url: string,
  result: ImportedProduct,
): Promise<void> {
  const urlHash = generateUrlHash(url)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS)

  await prisma.importCache.upsert({
    where: { urlHash },
    create: {
      urlHash,
      url,
      result: result as unknown as object,
      expiresAt,
    },
    update: {
      result: result as unknown as object,
      expiresAt,
    },
  })
}

export async function cleanupExpiredCache(): Promise<number> {
  const result = await prisma.importCache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
