import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>\[Your Name\] — Software Developer<\/title>/i);
  assert.match(html, /Featured Projects/);
  assert.match(html, /A quick introduction/);
  assert.match(html, /Let&apos;s Connect|Let's Connect/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/i);
});

test("server-renders the core shareable routes", async () => {
  const routes = ["/projects", "/projects/project-one", "/resume", "/guide"];
  const responses = await Promise.all(routes.map((route) => render(route)));
  for (const response of responses) assert.equal(response.status, 200);
  const html = await Promise.all(responses.map((response) => response.text()));
  assert.match(html[0], /Projects that show how I think and build/);
  assert.match(html[1], /The Problem/);
  assert.match(html[2], /Print \/ Save PDF/);
  assert.match(html[3], /Keep the site easy to update/);
});
