import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { register } from "node:module";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { isEditorEmail, verifyAccessJwt } from "../app/access-jwt.ts";
import { createSessionToken, EDITOR_SESSION_COOKIE, passwordLoginSecrets, verifyPassword, verifySessionToken } from "../app/editor-session.ts";

const accessTeamDomain = "team.cloudflareaccess.com";
const accessAud = "access-aud-tag";
const testOrigin = "http://localhost";
const loginAttemptsEnv = new AsyncLocalStorage();
globalThis.__pwEditorWorkerEnv = loginAttemptsEnv;

const cloudflareWorkersMock = `data:text/javascript;charset=utf-8,${encodeURIComponent(`
export const env = new Proxy({}, {
  get(_target, prop) {
    const store = globalThis.__pwEditorWorkerEnv?.getStore();
    if (!store) return undefined;
    return store[prop];
  },
});
`)}`;

await register(`data:text/javascript;charset=utf-8,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return { url: ${JSON.stringify(cloudflareWorkersMock)}, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
`)}`, { parentURL: import.meta.url });

async function render(pathname = "/", options = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  const { env, ...request } = options;
  const fetchWorker = () => worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...request,
      headers: { accept: "text/html", host: "localhost", "x-forwarded-host": "localhost", "x-forwarded-proto": "http", ...request.headers },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  return env ? loginAttemptsEnv.run(env, fetchWorker) : fetchWorker();
}

function openLoginAttemptsDb() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE editor_login_attempts (
    key text PRIMARY KEY NOT NULL,
    failures integer NOT NULL,
    window_start integer NOT NULL
  )`);
  const db = {
    prepare(sql) {
      return {
        bind(...params) {
          const statement = sqlite.prepare(sql);
          return {
            async all() {
              return { results: statement.all(...params), success: true, meta: {} };
            },
            async run() {
              const info = statement.run(...params);
              return { success: true, meta: { changes: info.changes, last_row_id: Number(info.lastInsertRowid) } };
            },
            async raw() {
              return statement.all(...params).map((row) => Object.values(row));
            },
          };
        },
      };
    },
  };
  return { sqlite, db };
}

function loginFailureCount(sqlite, key) {
  const row = sqlite.prepare("SELECT failures FROM editor_login_attempts WHERE key = ?").get(key);
  return typeof row?.failures === "number" ? row.failures : 0;
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Lee Guang You — Software Engineer<\/title>/i);
  assert.match(html, /Selected work/);
  assert.match(html, /codex-board/);
  assert.match(html, /Connecting software, hardware and business operations/);
  assert.match(html, /View my work/);
  assert.match(html, /View all projects/);
  assert.match(html, /Let&apos;s connect|Let's connect/);
  assert.doesNotMatch(html, /\[Your Name\]|\[Job Title\]|Replace with screenshot|Demo content/i);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("server-renders the core shareable routes", async () => {
  const routes = ["/projects", "/projects/codex-board", "/resume"];
  const responses = await Promise.all(routes.map((route) => render(route)));
  for (const response of responses) assert.equal(response.status, 200);
  const html = await Promise.all(responses.map((response) => response.text()));
  assert.match(html[0], /Projects that show how I think and build/);
  assert.match(html[1], /codex-board/);
  assert.match(html[1], /Highlights/);
  assert.doesNotMatch(html[1], /your-username|example\.com|Replace with screenshot|Add screenshots/i);
  assert.match(html[2], /Print \/ save PDF/);

});

test("homepage keeps curated projects and resume stays focused when GitHub is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  let githubRequests = 0;
  globalThis.fetch = async (input, ...args) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (new URL(url).hostname === "api.github.com") {
      githubRequests++;
      throw new Error("GitHub unavailable");
    }
    return originalFetch(input, ...args);
  };
  try {
    for (const pathname of ["/", "/resume", "/projects/codex-board"]) {
      const response = await render(pathname);
      assert.equal(response.status, 200);
      const html = await response.text();
      if (pathname === "/") {
        for (const slug of ["codex-board", "personal-resume-portfolio-website", "codex-workflow-toolkit"]) {
          assert.match(html, new RegExp(`href="(?:https://gy-portfolio\\.guangyou1386\\.chatgpt\\.site)?/projects/${slug}"`));
        }
      } else if (pathname === "/resume") {
        assert.doesNotMatch(html, /Selected projects|resume-project/);
      } else {
        assert.match(html, /Engineering decisions (?:&amp;|&) evidence/);
      }
      assert.doesNotMatch(html, /Public repository on GitHub\./);
    }
    assert.equal(githubRequests, 0, "recruiter pages must not wait on GitHub's API");
    const missing = await render("/projects/does-not-exist");
    assert.equal(missing.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("homepage and resume render the live profile", async () => {
  const home = await (await render("/")).text();
  const resumeResponse = await render("/resume");
  const resume = await resumeResponse.text();
  for (const html of [home, resume]) {
    assert.match(html, /Bioenergy Projects Sdn Bhd/);
    assert.match(html, /Wawasan Open University \(WOU\)/);
    assert.match(html, /Systems &amp; protocols/);
    assert.match(html, /Simpang Ampat, Penang, Malaysia/);
    assert.doesNotMatch(html, /chatgpt\.site/);
  }
  assert.match(home, /I’m a technology enthusiast with a passion for software development/);
  assert.match(home, /SMK Taman Perwira/);
  assert.match(home, /Boon Siew Honda Sdn\. Bhd\./);
  assert.doesNotMatch(home, /<ul>\s*<\/ul>/);
  assert.doesNotMatch(resume, /SMK Taman Perwira/);
  assert.match(resume, />localhost</);
  const spoofedHost = await (await render("/resume", { headers: { "x-forwarded-host": "evil.example" } })).text();
  assert.match(spoofedHost, />localhost</);
  assert.doesNotMatch(spoofedHost, /evil\.example/);

  process.env.PUBLIC_SITE_URL = "https://portfolio.example.test";
  try {
    const configured = await (await render("/resume")).text();
    assert.match(configured, />portfolio\.example\.test</);
    assert.doesNotMatch(configured, /chatgpt\.site/);
  } finally {
    delete process.env.PUBLIC_SITE_URL;
  }

  process.env.PUBLIC_SITE_URL = "javascript:alert(1)";
  try {
    const rejected = await (await render("/resume")).text();
    assert.match(rejected, />localhost</);
    assert.doesNotMatch(rejected, /javascript:/);
  } finally {
    delete process.env.PUBLIC_SITE_URL;
  }
});

test("verifyAccessJwt accepts a valid Access token and rejects invalid ones", async () => {
  const { privateKey, jwks } = await createAccessKeys();
  let requestedUrl = "";
  const options = {
    teamDomain: accessTeamDomain,
    aud: accessAud,
    fetchJwks: async (url) => {
      requestedUrl = url;
      return jwks;
    },
  };
  const valid = await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims()), options);
  assert.equal(requestedUrl, `https://${accessTeamDomain}/cdn-cgi/access/certs`);
  assert.equal(valid?.email, "owner@example.test");
  assert.equal(isEditorEmail(valid?.email, "owner@example.test"), true);
  assert.equal(isEditorEmail("Owner@Example.Test", "owner@example.test"), true);

  const withAudienceList = await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ aud: [accessAud, "another-tag"] })), options);
  assert.equal(withAudienceList?.email, "owner@example.test");

  const signed = await signAccessJwt(privateKey, accessClaims());
  assert.equal(await verifyAccessJwt(`${signed.slice(0, -4)}xxxx`, options), null);
  assert.equal(await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ aud: "wrong-aud" })), options), null);
  assert.equal(await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ iss: "https://evil.example" })), options), null);
  const now = Math.floor(Date.now() / 1000);
  assert.equal(await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ nbf: now - 120, exp: now - 30 })), options), null);
  assert.equal(await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ nbf: now + 300, exp: now + 3600 })), options), null);

  const other = await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ email: "other@example.test" })), options);
  assert.equal(other?.email, "other@example.test");
  assert.equal(isEditorEmail(other?.email, "owner@example.test"), false);
  assert.equal(await verifyAccessJwt(await signAccessJwt(privateKey, accessClaims({ email: "" })), options), null);
});

test("forged identity headers cannot edit, and Access gates the profile writer", async () => {
  delete process.env.CF_ACCESS_TEAM_DOMAIN;
  delete process.env.CF_ACCESS_AUD;
  delete process.env.PORTFOLIO_EDITOR_EMAIL;
  delete process.env.PORTFOLIO_EDITOR_USER_ID;

  const forgedHeaders = {
    "content-type": "application/json",
    origin: testOrigin,
    "oai-authenticated-user-id": "test-owner",
    "oai-authenticated-user-email": "owner@example.test",
    "cf-access-authenticated-user-email": "owner@example.test",
  };
  const unconfigured = await render("/api/profile", { method: "POST", headers: forgedHeaders, body: "{}" });
  assert.equal(unconfigured.status, 401);
  const anonymous = await render("/customize");
  assert.equal(anonymous.status, 200);
  const gate = await anonymous.text();
  assert.match(gate, /not configured/i);
  assert.match(gate, /not authorized/i);
  assert.doesNotMatch(gate, /id="customize-form"/);
  assert.doesNotMatch(gate, /Sign in with ChatGPT/);
  const anonymousGuide = await render("/guide", { headers: { "oai-authenticated-user-email": "owner@example.test" } });
  assert.equal(anonymousGuide.status, 404);

  const { privateKey, jwks } = await createAccessKeys();
  process.env.CF_ACCESS_TEAM_DOMAIN = accessTeamDomain;
  process.env.CF_ACCESS_AUD = accessAud;
  process.env.PORTFOLIO_EDITOR_EMAIL = "owner@example.test";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, ...args) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url === `https://${accessTeamDomain}/cdn-cgi/access/certs`) {
      return new Response(JSON.stringify(jwks), { status: 200, headers: { "content-type": "application/json" } });
    }
    return originalFetch(input, ...args);
  };
  try {
    const stillForged = await render("/api/profile", { method: "POST", headers: forgedHeaders, body: "{}" });
    assert.equal(stillForged.status, 401);
    const editorToken = await signAccessJwt(privateKey, accessClaims());
    const editor = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", origin: testOrigin, "cf-access-jwt-assertion": editorToken },
      body: "{}",
    });
    assert.equal(editor.status, 400, "recognized owner reaches validation without writing data");
    const otherToken = await signAccessJwt(privateKey, accessClaims({ email: "other@example.test" }));
    const otherWrite = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", origin: testOrigin, "cf-access-jwt-assertion": otherToken },
      body: "{}",
    });
    assert.equal(otherWrite.status, 401);
    const otherPage = await render("/customize", { headers: { "cf-access-jwt-assertion": otherToken } });
    const otherHtml = await otherPage.text();
    assert.match(otherHtml, /not authorized/i);
    assert.doesNotMatch(otherHtml, /id="customize-form"/);
    const otherGuide = await render("/guide", { headers: { "cf-access-jwt-assertion": otherToken } });
    assert.equal(otherGuide.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.CF_ACCESS_TEAM_DOMAIN;
    delete process.env.CF_ACCESS_AUD;
    delete process.env.PORTFOLIO_EDITOR_EMAIL;
  }
});

test("createSessionToken and verifyPassword accept valid values and reject bad ones", async () => {
  const secret = "editor-session-secret-value-32ch+";
  const otherSecret = "other-session-secret-value-32ch+";
  const password = "correct-horse";
  const now = 1_700_000_000_000;
  const token = await createSessionToken(secret, password, now);
  assert.match(token, /^v2\.[0-9]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(await verifySessionToken(token, secret, password, now), true);
  assert.equal(await verifySessionToken(token, secret, password, now + 60_000), true);
  assert.equal(await verifySessionToken(token, otherSecret, password, now), false);
  assert.equal(await verifySessionToken(token, secret, "other-password1", now), false);
  assert.equal(await verifySessionToken(`${token.slice(0, -2)}xx`, secret, password, now), false);
  const parts = token.split(".");
  assert.equal(await verifySessionToken(`v2.${Number(parts[1]) + 99}.${parts[2]}.${parts[3]}`, secret, password, now), false);
  assert.equal(await verifySessionToken(token, secret, password, now + 12 * 60 * 60 * 1000), false);
  assert.equal(await verifySessionToken("v1.9999999999.abcd", secret, password, now), false);
  assert.equal(await verifySessionToken("v2.9999999999.abcd", secret, password, now), false);
  assert.equal(await verifySessionToken("v2.exp.abcd.efgh", secret, password, now), false);
  assert.equal(await verifySessionToken("", secret, password, now), false);
  assert.equal(await verifyPassword("correct-horse", "correct-horse"), true);
  assert.equal(await verifyPassword("correct-horse", "wrong-password"), false);
  assert.equal(await verifyPassword("", "correct-horse"), false);
  assert.equal(await verifyPassword("x".repeat(257), "x".repeat(257)), false);
});

test("password login requires a password of at least 12 characters", () => {
  const secret = "editor-session-secret-value-32ch+";
  assert.equal(passwordLoginSecrets("short-pass1", secret), null);
  assert.equal(passwordLoginSecrets("", secret), null);
  assert.equal(passwordLoginSecrets(undefined, secret), null);
  assert.deepEqual(passwordLoginSecrets("short-pass12", secret), { password: "short-pass12", secret });
  assert.equal(passwordLoginSecrets("short-pass12", "too-short"), null);
});

test("password editor session gates /customize and /api/profile", async () => {
  const password = "owner-test-password";
  const secret = "editor-session-secret-value-32ch+";
  delete process.env.CF_ACCESS_TEAM_DOMAIN;
  delete process.env.CF_ACCESS_AUD;
  delete process.env.PORTFOLIO_EDITOR_EMAIL;
  process.env.EDITOR_PASSWORD = password;
  process.env.EDITOR_SESSION_SECRET = secret;
  try {
    const signIn = await render("/customize");
    assert.equal(signIn.status, 200);
    const signInHtml = await signIn.text();
    assert.match(signInHtml, /<form[^>]*action="\/api\/editor\/login"/i);
    assert.match(signInHtml, /<input[^>]*type="password"[^>]*autocomplete="current-password"/i);
    assert.match(signInHtml, />Sign in</);
    assert.doesNotMatch(signInHtml, /id="customize-form"/);
    assert.doesNotMatch(signInHtml, /Editor not configured/i);

    const token = await createSessionToken(secret, password, Date.now());
    const cookie = `${EDITOR_SESSION_COOKIE}=${token}`;
    const editorPage = await render("/customize", { headers: { cookie } });
    assert.equal(editorPage.status, 200);
    const editorHtml = await editorPage.text();
    assert.match(editorHtml, /id="customize-form"|temporarily unavailable/i);
    assert.doesNotMatch(editorHtml, /action="\/api\/editor\/login"/i);
    assert.doesNotMatch(editorHtml, /Not authorized/i);
    assert.doesNotMatch(editorHtml, /Editor not configured/i);

    const withCookie = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", origin: testOrigin, cookie },
      body: "{}",
    });
    assert.equal(withCookie.status, 400);
    const withoutCookie = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", origin: testOrigin },
      body: "{}",
    });
    assert.equal(withoutCookie.status, 401);
    const forged = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", origin: testOrigin, cookie: `${EDITOR_SESSION_COOKIE}=v2.9999999999.AAAAAAAAAAAAAAAAAAAAAA.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` },
      body: "{}",
    });
    assert.equal(forged.status, 401);

    const login = await render("/api/editor/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", origin: testOrigin },
      body: `password=${encodeURIComponent(password)}`,
    });
    assert.notEqual(login.status, 303);
    assert.notEqual(login.status, 200);
    const setCookie = login.headers.get("set-cookie") ?? "";
    assert.equal(setCookie.includes(`${EDITOR_SESSION_COOKIE}=`) && !setCookie.includes("Max-Age=0"), false);
  } finally {
    delete process.env.EDITOR_PASSWORD;
    delete process.env.EDITOR_SESSION_SECRET;
  }
});

test("login, logout, and profile writes reject a missing or mismatched origin", async () => {
  const missingProfile = await render("/api/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(missingProfile.status, 403);
  const missingLogin = await render("/api/editor/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: "owner-test-password" }),
  });
  assert.equal(missingLogin.status, 403);
  const missingLogout = await render("/api/editor/logout", { method: "POST" });
  assert.equal(missingLogout.status, 403);

  const wrongScheme = await render("/api/editor/login", {
    method: "POST",
    headers: { origin: "https://localhost", "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(wrongScheme.status, 403);
  const originBeatsReferer = await render("/api/editor/logout", {
    method: "POST",
    headers: { origin: "https://evil.example", referer: "http://localhost/customize" },
  });
  assert.equal(originBeatsReferer.status, 403);
  const malformed = await render("/api/profile", {
    method: "POST",
    headers: { origin: "not a url", "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(malformed.status, 403);

  const refererLogout = await render("/api/editor/logout", {
    method: "POST",
    headers: { referer: "http://localhost/customize" },
  });
  assert.equal(refererLogout.status, 303);
  const refererLogin = await render("/api/editor/login", {
    method: "POST",
    headers: { referer: "http://localhost/customize", "content-type": "application/x-www-form-urlencoded" },
    body: "password=x",
  });
  assert.notEqual(refererLogin.status, 403);
});

test("further attempts from a locked IP do not increase the global login failure counter", async () => {
  const password = "owner-test-password";
  const secret = "editor-session-secret-value-32ch+";
  process.env.EDITOR_PASSWORD = password;
  process.env.EDITOR_SESSION_SECRET = secret;
  const { sqlite, db } = openLoginAttemptsDb();
  const headers = {
    origin: testOrigin,
    "content-type": "application/json",
    "cf-connecting-ip": "203.0.113.44",
  };
  const body = JSON.stringify({ password: "wrong-password-xx" });
  try {
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      attempts.push(await render("/api/editor/login", { method: "POST", headers, body, env: { DB: db } }));
    }
    assert.deepEqual(attempts.map((response) => response.status), [401, 401, 401, 401, 401, 429]);
    const globalAfterLock = loginFailureCount(sqlite, "__global__");
    assert.equal(globalAfterLock, 5);
    assert.ok(loginFailureCount(sqlite, "203.0.113.44") >= 6);
    for (let i = 0; i < 3; i++) {
      const response = await render("/api/editor/login", { method: "POST", headers, body, env: { DB: db } });
      assert.equal(response.status, 429);
    }
    assert.equal(loginFailureCount(sqlite, "__global__"), globalAfterLock);
  } finally {
    delete process.env.EDITOR_PASSWORD;
    delete process.env.EDITOR_SESSION_SECRET;
  }
});

test("profile writes require application/json", async () => {
  const textPlain = await render("/api/profile", {
    method: "POST",
    headers: { origin: testOrigin, "content-type": "text/plain" },
    body: "{}",
  });
  assert.equal(textPlain.status, 415);
  const form = await render("/api/profile", {
    method: "POST",
    headers: { origin: testOrigin, "content-type": "application/x-www-form-urlencoded" },
    body: "{}",
  });
  assert.equal(form.status, 415);
  const charset = await render("/api/profile", {
    method: "POST",
    headers: { origin: testOrigin, "content-type": "application/json; charset=utf-8" },
    body: "{}",
  });
  assert.equal(charset.status, 401);
});

test("codex-board case study cites immutable source and other projects omit it", async () => {
  const codex = await render("/projects/codex-board");
  assert.equal(codex.status, 200);
  const html = await codex.text();
  for (const heading of ["Problem", "Architecture", "Limitations"]) {
    assert.match(html, new RegExp(`<h2>${heading}</h2>`));
  }
  assert.match(html, /<h2>Engineering decisions (?:&amp;|&) evidence<\/h2>/);
  assert.match(html, /Overview/);
  assert.match(html, /Highlights/);
  assert.match(html, /installed Codex CLI/);
  assert.match(html, /Public transport, remote pairing/);
  assert.match(html, /are not handwritten/);
  assert.match(html, /does not report a bridge test run/);
  assert.match(html, /does not establish individual contribution/);
  assert.match(html, /not a measured customer problem/);
  assert.doesNotMatch(html, /all tests pass|tests passed|I built every line|paying users|security certification|performance gain|coverage percentage/i);

  const evidence = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].flatMap((match) => {
    const href = match[1].match(/href="([^"]*)"/)?.[1];
    if (!href?.startsWith("https://github.com/guangyou0716/codex-board/blob/c287c280604eb7e63d0ca14df9b8d754e094ccbb/")) return [];
    const rel = match[1].match(/rel="([^"]*)"/)?.[1] ?? "";
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return [{ href, rel, label }];
  });
  assert.ok(evidence.length >= 3, "expected at least three immutable source links");
  for (const link of evidence) {
    const url = new URL(link.href);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "github.com");
    assert.match(url.pathname, /^\/guangyou0716\/codex-board\/blob\/c287c280604eb7e63d0ca14df9b8d754e094ccbb\/(?:bridge\/(?:README\.md|path-security\.ts|server\.ts)|tests\/bridge\.test\.mjs)$/);
    assert.match(url.hash, /^#L\d+(?:-L\d+)?$/);
    assert.match(link.rel, /\bnoreferrer\b/);
    assert.match(link.label, /[A-Za-z]/);
    assert.doesNotMatch(link.label, /^https?:/i);
  }

  const other = await render("/projects/personal-resume-portfolio-website");
  assert.equal(other.status, 200);
  const otherHtml = await other.text();
  assert.match(otherHtml, /<h2>Overview<\/h2>/);
  assert.match(otherHtml, /<h2>Highlights<\/h2>/);
  assert.match(otherHtml, /Stack &amp; focus|Stack & focus/);
  assert.doesNotMatch(otherHtml, /<h2>Problem<\/h2>|<h2>Engineering decisions|<h2>Limitations<\/h2>/);
});

function accessClaims(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    email: "owner@example.test",
    iss: `https://${accessTeamDomain}`,
    aud: accessAud,
    nbf: now - 60,
    exp: now + 3600,
    ...overrides,
  };
}

async function createAccessKeys() {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  jwk.kid = "test-key";
  jwk.alg = "RS256";
  jwk.use = "sig";
  return { privateKey: pair.privateKey, jwks: { keys: [jwk] } };
}

async function signAccessJwt(privateKey, payload) {
  const header = { alg: "RS256", typ: "JWT", kid: "test-key" };
  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, privateKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}

function base64UrlJson(value) {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}
