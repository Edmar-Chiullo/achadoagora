import { prisma } from "@/lib/prisma"
import type { ImportedProduct, ImportErrorCode } from "./types"
import { validateUrl } from "./url-validator"
import { getCachedImport, setCachedImport } from "./cache"
import { importFromUrl } from "./generic-importer"
import { calculateConfidence } from "./confidence"

export interface ImportResult {
  success: boolean
  data?: ImportedProduct
  error?: ImportErrorCode
  errorMessage?: string
}

export async function importProduct(urlString: string): Promise<ImportResult> {
  const validation = validateUrl(urlString)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      errorMessage: validation.errorMessage,
    }
  }

  const url = validation.url!

  const cached = await getCachedImport(url.href)
  if (cached) {
    return { success: true, data: cached }
  }

  const log = await prisma.productImportLog.create({
    data: {
      sourceUrl: url.href,
      status: "PROCESSING",
      startedAt: new Date(),
    },
  })

  try {
    const importedProduct = await importFromUrl(url)

    const { score } = calculateConfidence(importedProduct)
    const status = score >= 50 ? "SUCCESS" : "PARTIAL"

    await prisma.productImportLog.update({
      where: { id: log.id },
      data: {
        status,
        platform: importedProduct.platform,
        extractionMethod: importedProduct.extractionMethod,
        confidence: importedProduct.confidence,
        result: importedProduct as unknown as object,
        completedAt: new Date(),
      },
    })

    await setCachedImport(url.href, importedProduct)

    return { success: true, data: importedProduct }
  } catch (error) {
    let errorCode: ImportErrorCode = "UNKNOWN_ERROR"
    let errorMessage = "Erro ao importar produto. Tente novamente."

    if (error instanceof Error) {
      switch (error.message) {
        case "REDIRECT_LIMIT":
          errorCode = "REDIRECT_LIMIT"
          errorMessage = "Muitos redirecionamentos. A URL pode não ser válida."
          break
        case "INVALID_CONTENT_TYPE":
          errorCode = "INVALID_CONTENT_TYPE"
          errorMessage = "O conteúdo não é uma página HTML válida."
          break
        case "SIZE_LIMIT":
          errorCode = "SIZE_LIMIT"
          errorMessage = "A página é muito grande para ser processada."
          break
        case "AbortError":
          errorCode = "FETCH_TIMEOUT"
          errorMessage = "A requisição expirou. O site pode estar lento ou indisponível."
          break
        default:
          if (error.message.includes("fetch failed")) {
            errorCode = "FETCH_ERROR"
            errorMessage = "Não foi possível acessar a URL. Verifique se o link está correto."
          }
      }
    }

    await prisma.productImportLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorCode,
        errorMessage,
        completedAt: new Date(),
      },
    })

    return { success: false, error: errorCode, errorMessage }
  }
}

export async function findPlatformByName(
  platformName: string,
): Promise<{ id: string } | null> {
  const platform = await prisma.platform.findFirst({
    where: {
      name: {
        contains: platformName,
        mode: "insensitive",
      },
      status: "ACTIVE",
    },
    select: { id: true },
  })

  return platform
}

export async function getRecentImports(limit: number = 20) {
  return prisma.productImportLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getImportStats() {
  const total = await prisma.productImportLog.count()
  const successful = await prisma.productImportLog.count({
    where: { status: "SUCCESS" },
  })
  const partial = await prisma.productImportLog.count({
    where: { status: "PARTIAL" },
  })
  const failed = await prisma.productImportLog.count({
    where: { status: "FAILED" },
  })

  const avgConfidence = await prisma.productImportLog.aggregate({
    where: { confidence: { not: null } },
    _avg: { confidence: true },
  })

  return {
    total,
    successful,
    partial,
    failed,
    successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
    averageConfidence: avgConfidence._avg.confidence
      ? Math.round(avgConfidence._avg.confidence)
      : 0,
  }
}
