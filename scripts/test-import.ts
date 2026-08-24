import { validateUrl } from "../lib/importers/url-validator"
import { importFromUrl } from "../lib/importers/generic-importer"
import type { ImportedProduct } from "../lib/importers/types"

const PROFILE_UA: Record<string, string> = {
  "bot-atual": "AchadinhosBot/1.0 (Product Importer)",
  googlebot:
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "mobile-android":
    "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
  "chrome-desktop":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
}

function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "-"
  return value.length > max ? `${value.slice(0, max)}...` : value
}

function line(char = "-", length = 70): void {
  console.log(char.repeat(length))
}

async function testProfiles(rawUrl: string): Promise<void> {
  console.log(`\nURL: ${truncate(rawUrl, 90)}`)
  line("=")
  console.log(
    "perfil".padEnd(16),
    "http".padEnd(6),
    "bytes".padEnd(9),
    "og".padEnd(4),
    "ld+json",
  )

  for (const [name, userAgent] of Object.entries(PROFILE_UA)) {
    try {
      const response = await fetch(rawUrl, {
        headers: {
          "user-agent": userAgent,
          accept: "text/html,application/xhtml+xml",
          "accept-language": "pt-BR,pt;q=0.9",
        },
        redirect: "follow",
      })
      const html = await response.text()
      const ogCount = (html.match(/property="og:/g) ?? []).length
      const ldCount = (html.match(/application\/ld\+json/g) ?? []).length

      console.log(
        name.padEnd(16),
        String(response.status).padEnd(6),
        String(html.length).padEnd(9),
        String(ogCount).padEnd(4),
        ldCount,
      )
    } catch (error) {
      console.log(
        name.padEnd(16),
        "ERRO:".padEnd(6),
        error instanceof Error ? error.message : String(error),
      )
    }
  }
}

function printProduct(product: ImportedProduct): void {
  const rows: Array<[string, string]> = [
    ["Plataforma", product.platform ?? "-"],
    ["Título", truncate(product.title, 80)],
    ["Descrição", truncate(product.description, 80)],
    ["Imagem", truncate(product.imageUrl, 80)],
    ["Imagens extras", `${product.additionalImages.length}`],
    ["Preço", product.price !== null ? `${product.currency} ${product.price}` : "-"],
    ["Preço anterior", product.previousPrice !== null ? `${product.currency} ${product.previousPrice}` : "-"],
    ["Marca", product.brand ?? "-"],
    ["Disponibilidade", product.availability ?? "-"],
    ["Método", product.extractionMethod],
    ["Confiança", `${product.confidence}/100`],
    [
      "Campos faltantes",
      product.missingFields.length ? product.missingFields.join(", ") : "nenhum",
    ],
  ]

  const width = Math.max(...rows.map(([label]) => label.length))
  for (const [label, value] of rows) {
    console.log(`  ${label.padEnd(width)} : ${value}`)
  }
}

async function testImport(rawUrl: string): Promise<void> {
  console.log(`\nURL: ${truncate(rawUrl, 90)}`)
  line("=")

  const validation = validateUrl(rawUrl)
  if (!validation.valid || !validation.url) {
    console.log(`  URL inválida: ${validation.errorMessage}`)
    return
  }

  try {
    const product = await importFromUrl(validation.url)
    printProduct(product)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`  ERRO: ${message}`)
    if (process.env.DEBUG && error instanceof Error && error.stack) {
      console.log(error.stack)
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const profilesMode = args.includes("--profiles")
  const urls = args.filter((arg) => !arg.startsWith("--"))

  if (urls.length === 0) {
    console.log("Uso: npm run import:test -- <url1> [url2...] [--profiles]")
    console.log("  --profiles   compara perfis de User-Agent (para onboarding de novos marketplaces)")
    process.exit(1)
  }

  for (const url of urls) {
    if (profilesMode) {
      await testProfiles(url)
    } else {
      await testImport(url)
    }
  }
}

main().catch((error) => {
  console.error("Falha inesperada:", error)
  process.exit(1)
})
