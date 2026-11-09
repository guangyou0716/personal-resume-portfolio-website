import assert from "node:assert/strict";
import test from "node:test";
import { isEditorEmail, verifyAccessJwt } from "../app/access-jwt.ts";

const accessTeamDomain = "team.cloudflareaccess.com";
const accessAud = "access-aud-tag";

async function render(pathname = "/", options = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      ...options,
      headers: { accept: "text/html", "x-forwarded-host": "localhost", "x-forwarded-proto": "http", ...options.headers },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
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
    for (const pathname of ["/", "/resume"]) {
      const response = await render(pathname);
      assert.equal(response.status, 200);
      const html = await response.text();
      if (pathname === "/") {
        for (const slug of ["codex-board", "personal-resume-portfolio-website", "codex-workflow-toolkit"]) {
          assert.match(html, new RegExp(`href="(?:https://gy-portfolio\\.guangyou1386\\.chatgpt\\.site)?/projects/${slug}"`));
        }
      } else {
        assert.doesNotMatch(html, /Selected projects|resume-project/);
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

  process.env.PUBLIC_SITE_URL = "https://portfolio.example.test";
  try {
    const configured = await (await render("/resume")).text();
    assert.match(configured, />portfolio\.example\.test</);
    assert.doesNotMatch(configured, /chatgpt\.site/);
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
      headers: { "content-type": "application/json", "cf-access-jwt-assertion": editorToken },
      body: "{}",
    });
    assert.equal(editor.status, 400, "recognized owner reaches validation without writing data");
    const otherToken = await signAccessJwt(privateKey, accessClaims({ email: "other@example.test" }));
    const otherWrite = await render("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-access-jwt-assertion": otherToken },
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
