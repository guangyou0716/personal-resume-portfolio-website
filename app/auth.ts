import { isEditorEmail, verifyAccessJwt, type AccessIdentity } from "./access-jwt";
import { isPasswordLoginConfigured, readPasswordLoginSecrets, readSessionTokenFromCookieHeader, verifySessionToken } from "./editor-session";
import { configuredEnv, readWorkerEnv } from "./worker-env";

export { verifyAccessJwt };
export type { AccessIdentity };
export { isPasswordLoginConfigured };

export const ACCESS_SIGN_IN_PATH = "/customize";
export const ACCESS_SIGN_OUT_PATH = "/cdn-cgi/access/logout";

export type EditorUser = { email: string; method: "access" | "password" };

/** Password sessions are the exact objects issued here. A plain `{ method: "password" }` is not a member. */
const passwordEditorSessions = new WeakSet<object>();

export function isPasswordEditorSession(user: object): boolean {
  return passwordEditorSessions.has(user);
}

function passwordEditorUser(email: string): EditorUser {
  const user: EditorUser = { email, method: "password" };
  passwordEditorSessions.add(user);
  return user;
}

const JWKS_CACHE_MS = 10 * 60 * 1000;
const jwksCache = new Map<string, { expiresAt: number; value: unknown }>();

export async function isAccessConfigured(): Promise<boolean> {
  const config = await readAccessConfig();
  return config !== null;
}

export async function isEditorLoginConfigured(): Promise<boolean> {
  return (await isAccessConfigured()) || (await isPasswordLoginConfigured());
}

/** Verified editor identity from Access or a password session. */
export async function getEditorUser(): Promise<EditorUser | null> {
  const accessUser = await getAccessUser();
  if (accessUser) {
    const editorEmail = configuredEnv(await readWorkerEnv("PORTFOLIO_EDITOR_EMAIL"));
    if (isEditorEmail(accessUser.email, editorEmail)) {
      return { email: accessUser.email, method: "access" };
    }
  }

  try {
    const secrets = await readPasswordLoginSecrets();
    if (!secrets) return null;
    const { headers } = await import("next/headers");
    const token = readSessionTokenFromCookieHeader((await headers()).get("cookie"));
    if (!token) return null;
    if (!(await verifySessionToken(token, secrets.secret, secrets.password, Date.now()))) return null;
    const editorEmail = configuredEnv(await readWorkerEnv("PORTFOLIO_EDITOR_EMAIL"));
    return passwordEditorUser(editorEmail ?? "owner");
  } catch {
    return null;
  }
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
