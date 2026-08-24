import type { ProductAdapter } from "../types"
import { mercadolivreAdapter } from "./mercadolivre"
import { shopeeAdapter } from "./shopee"
import { amazonAdapter } from "./amazon"

export const ADAPTERS: ProductAdapter[] = [
  mercadolivreAdapter,
  shopeeAdapter,
  amazonAdapter,
]

export function findAdapter(hostname: string): ProductAdapter | null {
  const lowerHostname = hostname.toLowerCase()

  for (const adapter of ADAPTERS) {
    if (adapter.hosts.some((host) => lowerHostname === host || lowerHostname.endsWith(`.${host}`))) {
      return adapter
    }
  }

  return null
}
