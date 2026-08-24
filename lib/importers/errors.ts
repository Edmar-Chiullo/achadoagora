import type { ImportErrorCode } from "./types"

export class MarketplaceBlockedError extends Error {
  readonly code: ImportErrorCode = "MARKETPLACE_BLOCKED"
  readonly platform: string

  constructor(platform: string) {
    super(`${platform} bloqueou o acesso automatizado a esta página.`)
    this.name = "MarketplaceBlockedError"
    this.platform = platform
  }
}
