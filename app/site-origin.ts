import { headers } from "next/headers";
import { configuredEnv, readWorkerEnv } from "./worker-env";

/**
 * Absolute public origin for metadata and the quick-resume portfolio link.
 * Uses PUBLIC_SITE_URL when it is an http(s) origin. Otherwise uses the Host
 * header. Never reads X-Forwarded-Host.
 */
export async function publicSiteOrigin(fallback = ""): Promise<string> {
  const configured = httpOrigin(configuredEnv(await readWorkerEnv("PUBLIC_SITE_URL")));
  if (configured) return configured;

  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(",")[0]?.trim();
  if (!host) return fallback;
  const forwarded = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const protocol = forwarded === "http" || forwarded === "https" ? forwarded : "http";
  return httpOrigin(`${protocol}://${host}`) ?? fallback;
}

function httpOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}
