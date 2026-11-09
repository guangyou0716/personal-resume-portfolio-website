export type AccessIdentity = { email: string };

export type VerifyAccessJwtOptions = {
  teamDomain: string;
  aud: string;
  fetchJwks: (jwksUrl: string) => Promise<unknown>;
};

type JwtHeader = { alg?: unknown; kid?: unknown };
type RsaJwk = JsonWebKey & { kid?: string; use?: string; kty?: string; n?: string; e?: string };

const ACCESS_CERTS_PATH = "/cdn-cgi/access/certs";

/**
 * Verify a Cloudflare Access JWT (RS256) and return the email claim.
 * Returns null for any failure. Does not trust unsigned headers.
 */
export async function verifyAccessJwt(token: string, options: VerifyAccessJwtOptions): Promise<AccessIdentity | null> {
  try {
    const teamDomain = options.teamDomain.trim();
    const aud = options.aud.trim();
    if (!teamDomain || !aud || !token || token.length > 20000) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    const header = decodeJson(encodedHeader) as JwtHeader;
    if (!header || typeof header !== "object" || header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid) return null;

    const jwksUrl = `https://${teamDomain}${ACCESS_CERTS_PATH}`;
    const jwk = findRsaKey(await options.fetchJwks(jwksUrl), header.kid);
    if (!jwk?.n || !jwk.e) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const validSignature = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      toArrayBuffer(decodeBase64Url(encodedSignature)),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    if (!validSignature) return null;

    const payload = decodeJson(encodedPayload);
    if (!payload || typeof payload !== "object") return null;
    const claims = payload as Record<string, unknown>;
    if (claims.iss !== `https://${teamDomain}`) return null;
    if (!audienceContains(claims.aud, aud)) return null;
    if (!timingIsValid(claims.exp, claims.nbf)) return null;
    if (typeof claims.email !== "string" || !claims.email.trim()) return null;
    return { email: claims.email.trim() };
  } catch {
    return null;
  }
}

export function isEditorEmail(email: string | undefined, editorEmail: string | undefined): boolean {
  if (!email || !editorEmail) return false;
  return email.toLowerCase() === editorEmail.toLowerCase();
}

function findRsaKey(jwks: unknown, kid: string): RsaJwk | undefined {
  if (!jwks || typeof jwks !== "object" || !Array.isArray((jwks as { keys?: unknown }).keys)) return undefined;
  return (jwks as { keys: unknown[] }).keys.find((key): key is RsaJwk => {
    if (!key || typeof key !== "object") return false;
    const candidate = key as RsaJwk;
    return candidate.kid === kid && candidate.kty === "RSA" && candidate.use !== "enc" && typeof candidate.n === "string" && typeof candidate.e === "string";
  });
}

function audienceContains(aud: unknown, expected: string): boolean {
  if (typeof aud === "string") return aud === expected;
  return Array.isArray(aud) && aud.some((value) => value === expected);
}

function timingIsValid(exp: unknown, nbf: unknown): boolean {
  if (typeof exp !== "number" || typeof nbf !== "number" || !Number.isFinite(exp) || !Number.isFinite(nbf)) return false;
  const now = Math.floor(Date.now() / 1000);
  return nbf <= now && exp > now;
}

function decodeJson(segment: string): unknown {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(segment)));
}

function decodeBase64Url(segment: string): Uint8Array {
  if (segment.length % 4 === 1) throw new Error("Invalid base64url");
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (segment.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
