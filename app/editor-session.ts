export const EDITOR_SESSION_COOKIE = "__Host-gy_editor";
export const EDITOR_SESSION_MAX_AGE = 12 * 60 * 60;
const SESSION_TTL_MS = EDITOR_SESSION_MAX_AGE * 1000;
const MIN_PASSWORD_LENGTH = 12;
const MIN_SESSION_SECRET_LENGTH = 32;
const FINGERPRINT_BYTES = 16;
const MAX_PASSWORD_LENGTH = 256;
const MAX_TOKEN_LENGTH = 200;

export async function isPasswordLoginConfigured(): Promise<boolean> {
  return (await readPasswordLoginSecrets()) !== null;
}

export async function readPasswordLoginSecrets(): Promise<{ password: string; secret: string } | null> {
  const { configuredEnv, readWorkerEnv } = await import("./worker-env"); // lazy: Node tests import this module's WebCrypto helpers directly
  const [passwordValue, secretValue] = await Promise.all([
    readWorkerEnv("EDITOR_PASSWORD"),
    readWorkerEnv("EDITOR_SESSION_SECRET"),
  ]);
  return passwordLoginSecrets(configuredEnv(passwordValue), configuredEnv(secretValue));
}

export function passwordLoginSecrets(password: string | undefined, secret: string | undefined): { password: string; secret: string } | null {
  if (!password || password.length < MIN_PASSWORD_LENGTH || !secret || secret.length < MIN_SESSION_SECRET_LENGTH) return null;
  return { password, secret };
}

export async function createSessionToken(secret: string, password: string, nowMs: number): Promise<string> {
  const exp = Math.floor((nowMs + SESSION_TTL_MS) / 1000);
  const fingerprint = encodeBase64Url(await passwordFingerprint(secret, password));
  const payload = `v2.${exp}.${fingerprint}`;
  return `${payload}.${encodeBase64Url(await hmacSha256(secret, payload))}`;
}

export async function verifySessionToken(token: string, secret: string, password: string, nowMs: number): Promise<boolean> {
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, expRaw, fingerprint, signature] = parts;
  if (version !== "v2" || !expRaw || !/^[0-9]+$/.test(expRaw) || !fingerprint || !signature) return false;
  const exp = Number(expRaw);
  if (!Number.isSafeInteger(exp)) return false;
  let providedSignature: Uint8Array;
  let providedFingerprint: Uint8Array;
  try {
    providedSignature = decodeBase64Url(signature);
    providedFingerprint = decodeBase64Url(fingerprint);
  } catch {
    return false;
  }
  if (providedFingerprint.length !== FINGERPRINT_BYTES) return false;
  const expectedSignature = await hmacSha256(secret, `v2.${expRaw}.${fingerprint}`);
  if (!timingSafeEqual(providedSignature, expectedSignature)) return false;
  const expectedFingerprint = await passwordFingerprint(secret, password);
  if (!timingSafeEqual(providedFingerprint, expectedFingerprint)) return false;
  return exp > Math.floor(nowMs / 1000);
}

export async function verifyPassword(input: string, expected: string): Promise<boolean> {
  if (typeof input !== "string" || typeof expected !== "string") return false;
  if (!input || !expected || input.length > MAX_PASSWORD_LENGTH || expected.length > MAX_PASSWORD_LENGTH) return false;
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(input)),
    crypto.subtle.sign("HMAC", key, encoder.encode(expected)),
  ]);
  return timingSafeEqual(new Uint8Array(left), new Uint8Array(right));
}

export function sessionCookie(token: string): string {
  return `${EDITOR_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${EDITOR_SESSION_MAX_AGE}`;
}

export function expiredSessionCookie(): string {
  return `${EDITOR_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function readSessionTokenFromCookieHeader(header: string | null | undefined): string | undefined {
  if (!header) return undefined;
  const prefix = `${EDITOR_SESSION_COOKIE}=`;
  for (const part of header.split(";")) {
    const value = part.trim();
    if (value.startsWith(prefix)) {
      const token = value.slice(prefix.length);
      return token || undefined;
    }
  }
  return undefined;
}

async function passwordFingerprint(secret: string, password: string): Promise<Uint8Array> {
  const digest = await hmacSha256(secret, `pw:${password}`);
  return digest.slice(0, FINGERPRINT_BYTES);
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function decodeBase64Url(segment: string): Uint8Array {
  if (segment.length % 4 === 1) throw new Error("Invalid base64url");
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (segment.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
