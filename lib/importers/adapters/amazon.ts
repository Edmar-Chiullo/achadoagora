import type { ProductAdapter } from "../types"
import { DEFAULT_FETCH_PROFILE } from "../url-validator"

export const amazonAdapter: ProductAdapter = {
  platform: "Amazon",
  hosts: [
    "amazon.com",
    "amazon.com.br",
    "amazon.co.uk",
    "amazon.de",
    "amazon.es",
    "amazon.fr",
    "amazon.it",
    "amazon.ca",
    "amazon.com.mx",
    "amzn.to",
  ],
  profile: DEFAULT_FETCH_PROFILE,
}
