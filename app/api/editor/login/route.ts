import { eq, sql } from "drizzle-orm";
import { createSessionToken, readPasswordLoginSecrets, sessionCookie, verifyPassword } from "../../../editor-session";
import { isSameOrigin } from "../../../same-origin";
import { editorLoginAttempts } from "../../../../db/schema";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const MAX_GLOBAL_FAILURES = 20;
const GLOBAL_ATTEMPT_KEY = "__global__";
const GENERIC_ERROR = "Not authorized";

export async function POST(request: Request) {
  const asJson = wantsJson(request);
  if (!isSameOrigin(request)) {
    return asJson ? jsonError("Invalid origin", 403) : new Response("Invalid origin", { status: 403 });
  }

  const secrets = await readPasswordLoginSecrets();
  if (!secrets) {
    return asJson ? jsonError(GENERIC_ERROR, 401) : jsonError("Not found", 404);
  }

  let password = "";
  try {
    password = await readPassword(request);
  } catch {
    return fail(asJson, "invalid");
  }

  const db = await getDb().catch(() => null);
  if (!db) return unavailable(asJson);

  const ip = clientIp(request);
  const now = Date.now();
  // One upsert per key reserves the attempt before the password compare, so concurrent guesses cannot share a stale count.
  let ipFailures: number;
  let globalFailures: number;
  try {
    ipFailures = await bumpLoginFailures(db, ip, now);
    globalFailures = ipFailures > MAX_FAILURES ? 0 : await bumpLoginFailures(db, GLOBAL_ATTEMPT_KEY, now);
  } catch {
    return unavailable(asJson);
  }
  if (ipFailures > MAX_FAILURES || globalFailures > MAX_GLOBAL_FAILURES) {
    return fail(asJson, "locked");
  }

  if (!(await verifyPassword(password, secrets.password))) {
    return fail(asJson, "invalid");
  }

  try {
    await db.delete(editorLoginAttempts).where(eq(editorLoginAttempts.key, ip));
  } catch {
    return unavailable(asJson);
  }

  const token = await createSessionToken(secrets.secret, secrets.password, now);
  const headers = new Headers();
  headers.set("Set-Cookie", sessionCookie(token));
  if (asJson) {
    headers.set("content-type", "application/json");
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }
  headers.set("Location", "/customize");
  return new Response(null, { status: 303, headers });
}

function wantsJson(request: Request) {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

async function readPassword(request: Request) {
  if (wantsJson(request)) {
    const body = await request.json() as { password?: unknown };
    return typeof body.password === "string" ? body.password : "";
  }
  const form = await request.formData();
  const value = form.get("password");
  return typeof value === "string" ? value : "";
}

function clientIp(request: Request) {
  const raw = request.headers.get("cf-connecting-ip")?.split(",")[0]?.trim() ?? "";
  return raw && raw.length <= 128 ? raw : "unknown";
}

function fail(asJson: boolean, kind: "invalid" | "locked") {
  if (kind === "locked") {
    if (asJson) return jsonError("Too many attempts", 429);
    return redirect("/customize?error=locked");
  }
  if (asJson) return jsonError(GENERIC_ERROR, 401);
  return redirect("/customize?error=1");
}

function unavailable(asJson: boolean) {
  return asJson ? jsonError("Unable to sign in", 503) : new Response("Unable to sign in", { status: 503 });
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

function redirect(path: string) {
  return new Response(null, { status: 303, headers: { Location: path } });
}

type LoginDb = Awaited<ReturnType<typeof getDb>>;

async function bumpLoginFailures(db: LoginDb, key: string, now: number): Promise<number> {
  const rows = await db.all<{ failures: unknown }>(sql`
    INSERT INTO editor_login_attempts (key, failures, window_start)
    VALUES (${key}, 1, ${now})
    ON CONFLICT(key) DO UPDATE SET
      failures = CASE
        WHEN excluded.window_start - window_start >= ${LOGIN_WINDOW_MS} THEN 1
        ELSE failures + 1
      END,
      window_start = CASE
        WHEN excluded.window_start - window_start >= ${LOGIN_WINDOW_MS} THEN excluded.window_start
        ELSE window_start
      END
    RETURNING failures
  `);
  const failures = rows[0]?.failures;
  if (typeof failures !== "number" || !Number.isSafeInteger(failures) || failures < 1) {
    throw new Error("login rate limit");
  }
  return failures;
}

async function getDb() {
  return (await import("../../../../db")).getDb();
}
