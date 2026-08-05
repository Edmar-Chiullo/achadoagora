import { createHash } from "crypto";
import { UAParser } from "ua-parser-js";

const IP_HASH_SALT = process.env.IP_HASH_SALT ?? "achadinhos-ip-salt";

const BOT_REGEX =
  /bot|crawl|spider|slurp|preview|headless|puppeteer|phantomjs|curl|wget|httpclient/i;

export function hashIp(rawIp: string | null): string | null {
  if (!rawIp) return null;
  const ip = rawIp.split(",")[0].trim();
  if (!ip) return null;
  return createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex");
}

export function hashValue(value: string): string {
  return createHash("sha256").update(`${IP_HASH_SALT}:${value}`).digest("hex");
}

export function decodeParam(value: string | null): string | null {
  if (!value || !value.includes("%")) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseDevice(userAgent: string | null) {
  if (!userAgent) return { browser: null, os: null, deviceType: null, deviceBrand: null };
  const result = new UAParser(userAgent).getResult();
  return {
    browser: result.browser.name ?? null,
    os: result.os.name ?? null,
    deviceType: result.device.type ?? "desktop",
    deviceBrand: result.device.vendor ?? null,
  };
}

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}
