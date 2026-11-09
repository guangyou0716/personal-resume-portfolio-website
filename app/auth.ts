import { verifyAccessJwt, type AccessIdentity } from "./access-jwt";
import { configuredEnv, readWorkerEnv } from "./worker-env";

export { verifyAccessJwt };
export type { AccessIdentity };

export const ACCESS_SIGN_IN_PATH = "/customize";
export const ACCESS_SIGN_OUT_PATH = "/cdn-cgi/access/logout";

const JWKS_CACHE_MS = 10 * 60 * 1000;
const jwksCache = new Map<string, { expiresAt: number; value: unknown }>();

export async function isAccessConfigured(): Promise<boolean> {
  const config = await readAccessConfig();
  return config !== null;
}

/** Verified Access identity, or null when Access is not configured or the token fails. */
export async function getAccessUser(): Promise<AccessIdentity | null> {
  const config = await readAccessConfig();
  if (!config) return null;
  try {
    const { headers } = await import("next/headers");
    const token = (await headers()).get("cf-access-jwt-assertion");
    if (!token) return null;
    return await verifyAccessJwt(token, {
      teamDomain: config.teamDomain,
      aud: config.aud,
      fetchJwks: fetchAccessJwks,
    });
  } catch {
    return null;
  }
}

async function readAccessConfig(): Promise<{ teamDomain: string; aud: string; editorEmail: string } | null> {
  const [teamDomain, aud, editorEmail] = await Promise.all([
    readWorkerEnv("CF_ACCESS_TEAM_DOMAIN"),
    readWorkerEnv("CF_ACCESS_AUD"),
    readWorkerEnv("PORTFOLIO_EDITOR_EMAIL"),
  ]);
  const domain = configuredEnv(teamDomain);
  const audience = configuredEnv(aud);
  const editor = configuredEnv(editorEmail);
  if (!domain || !audience || !editor) return null;
  return { teamDomain: domain, aud: audience, editorEmail: editor };
}

async function fetchAccessJwks(url: string): Promise<unknown> {
  const now = Date.now();
  const cached = jwksCache.get(url);
  if (cached && cached.expiresAt > now) return cached.value;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Cloudflare Access certificate request failed (${response.status})`);
  const value: unknown = await response.json();
  jwksCache.set(url, { expiresAt: now + JWKS_CACHE_MS, value });
  return value;
}
