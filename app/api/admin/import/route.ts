import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { importProduct } from "@/lib/importers"
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const rateLimitKey = getRateLimitKey(ip, "import")
  const rateLimit = checkRateLimit(rateLimitKey, 10, 60_000)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Muitas requisições. Aguarde antes de tentar novamente.",
        retryIn: rateLimit.resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetIn),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1000) + rateLimit.resetIn),
        },
      },
    )
  }

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    )
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      { error: "URL é obrigatória." },
      { status: 400 },
    )
  }

  const url = body.url.trim()
  if (url.length < 10 || url.length > 2048) {
    return NextResponse.json(
      { error: "URL inválida. Verifique o formato." },
      { status: 400 },
    )
  }

  const result = await importProduct(url)

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        errorMessage: result.errorMessage,
      },
      { status: 422 },
    )
  }

  return NextResponse.json({
    success: true,
    data: result.data,
  })
}
