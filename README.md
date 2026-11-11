# Lee Guang You — portfolio and resume

Personal portfolio and printable resume for Lee Guang You. Public pages are server-rendered React. The deployed site is [https://gy-portfolio.guangyou.workers.dev](https://gy-portfolio.guangyou.workers.dev).

This repository is the source for the site. A saved Cloudflare D1 profile can override the editable profile fields on the deployed site, so the live homepage and resume can differ from the checked-in defaults. This file does not copy or verify that saved database.

## Routes

- `/` — portfolio homepage
- `/projects` — project index
- `/projects/[slug]` — project detail. `codex-board` includes a source-linked case study. Other projects keep the overview, highlights, and stack layout.
- `/resume` — printable Quick resume
- `/customize` — owner-only profile editor (password login or Cloudflare Access). Linked from the footer as Owner access; it is not public content.
- `/guide` — owner-only maintenance notes
- `POST /api/profile` — owner-only profile save
- `POST /api/editor/login` — owner password sign-in
- `POST /api/editor/logout` — owner password sign-out

Project records, including the codex-board case study, stay in `app/data/profile.ts`. The editor does not write them.

## Runtime

The UI is React, rendered with [vinext](https://github.com/cloudflare/vinext) on Vite, and hosted on Cloudflare Workers with a D1 database. Routes and server helpers use Next-style APIs (`app/` routes, `next/link`, `next/navigation`, `next/headers`). That does not make this a standard Next.js deployment.

Node.js `>=22.13.0` is required (`package.json` `engines`).

`wrangler.jsonc` declares the Worker, the D1 binding name `DB`, and non-secret `vars`. `vite.config.ts` loads the Cloudflare Vite plugin so local development can simulate those bindings. `db/schema.ts` defines `portfolio_profile` and `editor_login_attempts`. `drizzle/` holds the D1 migrations. `examples/d1/` is a separate example, not the portfolio profile store.

## Profile source and saved overrides

Checked-in defaults live in `app/data/profile.ts`.

Public pages load a profile with `getProfile()`:

- If the D1 read throws, the page uses the static defaults.
- If no `portfolio_profile` row exists, the page uses the static defaults.
- If a row exists, its JSON overrides the editable fields: name, initials, avatar, title, subtitle, location, availability, focus, email, bio, summary, values, social links, experience, skill groups, education, and GitHub cover images. Projects stay on the static list.
- Saved identity strings that are bracketed templates (text wrapped in `[...]`, or text containing `[Add ` or `Replace this`) fall back to the static value. Template experience and education entries are dropped.

## Owner editor

`/customize` and `POST /api/profile` are limited to the owner. Authorization is either:

- a verified Cloudflare Access JWT (`cf-access-jwt-assertion`) whose email matches `PORTFOLIO_EDITOR_EMAIL` when `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` are set, or
- a password session cookie after `POST /api/editor/login`, when `EDITOR_PASSWORD` (at least 12 characters) and `EDITOR_SESSION_SECRET` (at least 32 characters) are configured.

Anonymous visitors see a sign-in form when password login is configured, or an “editor is not configured / not authorized” page otherwise. Other Access accounts cannot edit. `/guide` is not found for anyone else. Password sign-out is `POST /api/editor/logout`. Access sign-out is `/cdn-cgi/access/logout`.

Saves send `expectedUpdatedAt`. A matching version updates the row. A stale version does not overwrite it; the API responds with HTTP 409. A null version inserts only when the row is absent. Invalid payloads respond with HTTP 400 and do not report a write. A missing or cross-origin `Origin` (or `Referer` only when `Origin` is absent) responds with HTTP 403. A non-JSON content type responds with HTTP 415. Unauthenticated writes respond with HTTP 401.

Password login records per-IP and global failures in D1 (`editor_login_attempts`) and rejects further guesses after the lock thresholds.

Known validation limits in `parseEditableProfile`:

- Editable strings are at most 5000 characters. A non-empty avatar must be `http:`, `https:`, or root-relative.
- `values` has at most 20 strings, each at most 120 characters.
- Each social link is at most 1000 characters.
- Experience has at most 20 roles, with at most 20 bullets of at most 2000 characters each.
- Skill groups: at most 30 groups, at most 40 items each, each item at most 120 characters.
- Education has at most 20 entries.
- GitHub covers: at most 50 entries, names at most 200 characters, URLs at most 2000 characters, and the same URL shape as avatars.

These checks are input limits. They are not a content review, and the rendered-HTML tests do not perform a real D1 write.

## Commands

- `npm run dev` — local development server
- `npm run build` — vinext production build
- `npm start` — serve the production build
- `npm run lint` — ESLint, ignoring `dist` and `.next`
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — runs `npm run build`, then `node --test tests/rendered-html.test.mjs`
- `npm run deploy` — build and deploy to Cloudflare Workers
- `npm run db:generate` — generate a Drizzle migration after a schema change
- `npm run db:migrate:remote` — apply D1 migrations to the remote database

`npm test` checks rendered HTML for the homepage, core routes, an unknown project slug, recruiter pages when the GitHub API is unavailable, Access and password editor gates, same-origin writes, and login lock behavior. It does not establish browser interaction, print layout, a live D1 write, or a CI result.

`.github/workflows/ci.yml` is configured to run `npm ci`, `npm run lint`, `npm run typecheck`, and `npm test` on Node 22 for pushes to `main` and for pull requests. This README does not record a workflow result.

## Hosting and auth boundaries

The public site is anonymous-compatible. Recruiter pages do not call the GitHub API. Editor identity comes from a verified Access JWT or a password session; forged `oai-authenticated-user-*` headers do not grant access.

`PUBLIC_SITE_URL` is the public origin for page metadata and the Quick resume portfolio link. When it is empty or not an `http`/`https` origin, those pages use the request `Host` header and accept only `http` and `https`. They do not read `X-Forwarded-Host`.

## Learn more

- [vinext](https://github.com/cloudflare/vinext)
- [Drizzle D1 guide](https://orm.drizzle.team/docs/get-started/d1-new)
- [Validate Cloudflare Access JWTs](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
