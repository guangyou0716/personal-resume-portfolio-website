# Lee Guang You — portfolio

Personal resume and portfolio for Lee Guang You. The site runs on
[vinext](https://github.com/cloudflare/vinext) and deploys to Cloudflare
Workers. Profile copy lives in `app/data/profile.ts` and can be edited by the
owner into a Cloudflare D1 database.

## Prerequisites

- Node.js `>=22.13.0`
- A free Cloudflare account, for deployment

## Quick Start

```bash
npm install
npm run dev
npm run build
```

`wrangler.jsonc` declares the Worker and the D1 binding. With an empty
database, the public pages render the profile defaults.

## Included Shape

- edit site code under `app/`
- `wrangler.jsonc` declares the Worker, D1 database, and non-secret settings
- `db/schema.ts` stores the editable profile
- `drizzle/` holds the D1 migrations
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Deploy to Cloudflare (free)

1. Create a free Cloudflare account.
2. Log in: `npx wrangler login`
3. Create the database and paste the printed id into `database_id` in `wrangler.jsonc`:

   ```bash
   npx wrangler d1 create gy-portfolio-db
   ```

4. Apply migrations: `npm run db:migrate:remote`
5. Deploy: `npm run deploy`

Deploy prints a URL like `https://gy-portfolio.<subdomain>.workers.dev`.

### Owner editor with Cloudflare Access

The public site stays open. The editor fails closed until Access is configured:
`POST /api/profile` returns 401, and `/customize` says the editor is not
configured or you are not authorized.

1. In the Cloudflare Zero Trust free plan, create a self-hosted Access application for the Workers hostname.
2. Protect `/customize*`, `/api/profile*`, and `/guide*`.
3. Add an Allow policy for the owner's email.
4. Put these non-secret values in `wrangler.jsonc` `vars`, then redeploy with `npm run deploy`:
   - `CF_ACCESS_TEAM_DOMAIN` — team domain only, such as `your-team.cloudflareaccess.com`
   - `CF_ACCESS_AUD` — the application's Audience (AUD) tag
   - `PORTFOLIO_EDITOR_EMAIL` — the owner email allowed to edit
   - `PUBLIC_SITE_URL` — optional public origin, including `https://`. Quick resume uses the request origin when this is empty.

Owner access links to `/customize`. Access asks the visitor to sign in before that path runs. Sign out at `/cdn-cgi/access/logout`.

A free subdomain, such as one from [is-a.dev](https://is-a.dev), can point at the `workers.dev` hostname.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm run deploy`: build and deploy to Cloudflare Workers
- `npm run db:migrate:remote`: apply D1 migrations to the remote database
- `npm run typecheck`: verify TypeScript types
- `npm test`: build the site and verify its rendered HTML
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
- [Validate Cloudflare Access JWTs](https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/)
