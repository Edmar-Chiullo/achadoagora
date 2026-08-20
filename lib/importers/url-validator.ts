import type { ImportErrorCode } from "./types"

export interface UrlValidationResult {
  valid: boolean
  url?: URL
  error?: ImportErrorCode
  errorMessage?: string
}

const BLOCKED_HOSTNAMES = [
  "localhost",
  "0.0.0.0",
  "::1",
  "[::1]",
  "metadata.google.internal",
  "169.254.169.254",
]

const PRIVATE_IP_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^100\.(6[4-9]|[7-9]\d|1[0-2][0-7])\.\d{1,3}\.\d{1,3}$/,
  /^198\.1[89]\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
]

const BLOCKED_IPV6 = [
  "::1",
  "fc00::",
  "fd00::",
  "fe80::",
  "::ffff:127.0.0.0",
  "::ffff:10.0.0.0",
  "::ffff:172.16.0.0",
  "::ffff:192.168.0.0",
]

export const IMPORT_CONFIG = {
  TIMEOUT_MS: 10_000,
  MAX_REDIRECTS: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_CONTENT_TYPES: ["text/html", "text/html; charset=utf-8", "text/html;charset=utf-8", "application/xhtml+xml"],
} as const

function isPrivateIP(hostname: string): boolean {
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) return true
  }

  const lowerHostname = hostname.toLowerCase()
  for (const blocked of BLOCKED_IPV6) {
    if (lowerHostname === blocked || lowerHostname.startsWith(blocked)) return true
  }

  return false
}

function isNumericHostname(hostname: string): boolean {
  const parts = hostname.split(".")
  return parts.every((part) => /^\d{1,3}$/.test(part))
}

export function validateUrl(input: string): UrlValidationResult {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(input.trim())
  } catch {
    return {
      valid: false,
      error: "INVALID_URL",
      errorMessage: "URL inválida. Verifique o formato e tente novamente.",
    }
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      valid: false,
      error: "INVALID_URL",
      errorMessage: "Apenas URLs HTTP e HTTPS são aceitas.",
    }
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return {
      valid: false,
      error: "BLOCKED_IP",
      errorMessage: "Esta URL não pode ser acessada por segurança.",
    }
  }

  if (isPrivateIP(hostname)) {
    return {
      valid: false,
      error: "BLOCKED_IP",
      errorMessage: "Esta URL aponta para um endereço privado e não pode ser acessada.",
    }
  }

  if (isNumericHostname(hostname)) {
    return {
      valid: false,
      error: "BLOCKED_IP",
      errorMessage: "URLs com endereços IP literais não são permitidas.",
    }
  }

  if (parsedUrl.port && parsedUrl.port !== "80" && parsedUrl.port !== "443") {
    const port = parseInt(parsedUrl.port, 10)
    if (port < 1 || port > 65535) {
      return {
        valid: false,
        error: "INVALID_URL",
        errorMessage: "Porta inválida na URL.",
      }
    }
  }

  return { valid: true, url: parsedUrl }
}

export async function fetchWithProtection(
  url: URL,
): Promise<{ response: Response; redirectCount: number }> {
  let redirectCount = 0
  let currentUrl = url.href

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), IMPORT_CONFIG.TIMEOUT_MS)

  try {
    let response: Response

    while (true) {
      response = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "AchadinhosBot/1.0 (Product Importer)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "manual",
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")
        if (!location) {
          throw new Error("Redirect sem localização")
        }

        redirectCount++
        if (redirectCount > IMPORT_CONFIG.MAX_REDIRECTS) {
          throw new Error("REDIRECT_LIMIT")
        }

        const nextUrl = new URL(location, currentUrl)
        if (nextUrl.hostname !== url.hostname) {
          throw new Error("Redirect para domínio diferente não é permitido")
        }

        currentUrl = nextUrl.href
        continue
      }

      break
    }

    const contentType = response.headers.get("content-type") || ""
    const isValidContentType = IMPORT_CONFIG.ALLOWED_CONTENT_TYPES.some((ct) =>
      contentType.toLowerCase().includes(ct.toLowerCase()),
    )

    if (!isValidContentType && !contentType.includes("text/html")) {
      throw new Error("INVALID_CONTENT_TYPE")
    }

    const contentLength = response.headers.get("content-length")
    if (contentLength && parseInt(contentLength, 10) > IMPORT_CONFIG.MAX_SIZE_BYTES) {
      throw new Error("SIZE_LIMIT")
    }

    return { response, redirectCount }
  } finally {
    clearTimeout(timeout)
  }
}
