# Vowly

Wedding Invitation & Client Management System for a wedding photography company.

- **Web app** (Nuxt 4 + Tailwind) hosted on Cloudflare Pages
- **API** (Hono + Drizzle) on Cloudflare Workers
- **Database** Cloudflare D1 (SQLite)
- **Object storage** Cloudflare R2 for images and generated OG images
- **Rate limiting** Cloudflare KV

Everything runs inside the Cloudflare edge.

## Documentation

- `plan.md` — product specification
- `dev-plan.md` — technical development plan, milestones and risks
- `AGENTS.md` — conventions for this codebase
- `database/README.md` — migration and seed commands

## Quick start

```bash
pnpm install

# Generate migrations
pnpm db:generate

# Start the API worker (http://localhost:8787)
pnpm dev:api

# In a new terminal, start the Nuxt app (http://localhost:3000)
pnpm dev:web
```

Before logging in, seed an admin:

```bash
pnpm seed:admin:local --username admin --password <strong-secret>
```

## Template system

Templates are Vue components in `apps/web/app/components/templates/<id>/`. They
receive a single `invitation: PublicInvitation` prop and only change presentation.

To add a new template:

1. Add the id, name, description and OG theme to `TEMPLATE_IDS` in `packages/types/src/template.ts`.
2. Create the component at `apps/web/app/components/templates/<id>/<Id>Template.vue`.
3. Register it in `apps/web/app/utils/templates.ts`.

The picker, preview, public page and OG renderer will pick it up automatically.

## Scripts

- `pnpm dev:web` — Nuxt dev server
- `pnpm dev:api` — Wrangler dev server
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:migrate:local` — apply migrations to local D1
- `pnpm seed:admin:local` — seed an admin user locally
- `pnpm typecheck` — TypeScript check across all packages
- `pnpm lint` — ESLint
- `pnpm test` — run tests

## Environments

Create real D1, R2 and KV resources and fill the IDs in
`workers/api/wrangler.toml` before deploying to production or staging.

```bash
wrangler d1 create vowly-db
wrangler kv:namespace create vowly-rate-limit
wrangler r2 bucket create vowly-media
```

Then deploy:

```bash
pnpm --filter @vowly/api deploy --env production
pnpm --filter @vowly/web build
# Deploy the .output/public folder via Cloudflare Pages
```

Detailed deploy steps are in `AGENTS.md`.
