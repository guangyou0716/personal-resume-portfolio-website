import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/", options = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { ...options, headers: { accept: "text/html", ...options.headers } }),
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
  assert.match(html, /Building practical systems, automation and AI-powered tools/);
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
  assert.match(html[2], /Print \/ Save PDF/);

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


test("owner editor and write endpoint reject anonymous and other accounts", async () => {
  process.env.PORTFOLIO_EDITOR_EMAIL = "owner@example.test";
  delete process.env.PORTFOLIO_EDITOR_USER_ID;
  const anonymous = await render("/customize");
  const gate = await anonymous.text();
  assert.match(gate, /Sign in with ChatGPT/);
  assert.doesNotMatch(gate, /id="customize-form"/);
  const headers = { "oai-authenticated-user-id": "test-other-user", "oai-authenticated-user-email": "other@example.test" };
  const other = await render("/customize", { headers });
  assert.match(await other.text(), /This account cannot edit/);
  for (const identity of [{}, headers]) {
    const response = await render("/api/profile", { method: "POST", headers: { ...identity, "content-type": "application/json" }, body: "{}" });
    assert.equal(response.status, 401);
  }
  const owner = await render("/api/profile", { method: "POST", headers: { "oai-authenticated-user-id": "test-owner", "oai-authenticated-user-email": "owner@example.test", "content-type": "application/json" }, body: "{}" });
  assert.equal(owner.status, 400, "recognized owner reaches validation without writing data");
  const otherGuide = await render("/guide", { headers });
  assert.equal(otherGuide.status, 404);
  delete process.env.PORTFOLIO_EDITOR_EMAIL;
});
