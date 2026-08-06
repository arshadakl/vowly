# Vowly

Wedding Invitation & Client Management System for a wedding photography company.

- **Web app** (Nuxt 4 + Tailwind) hosted on Cloudflare Pages
- **API** (Nuxt server routes) inside the same Pages/Worker deployment
- **Database** Cloudflare D1 (SQLite)

Everything runs inside the Cloudflare edge as a single deployment.

## Documentation

- `plan.md` — product specification
- `dev-plan.md` — technical development plan, milestones and risks
- `AGENTS.md` — conventions for this codebase
- `database/README.md` — migration and seed commands
- `docs/launch-readiness.md` — staging/prod release, routing, backup, monitoring and security runbook

## Quick start

```bash
pnpm install

# Generate migrations
pnpm db:generate

# Start the Nuxt dev server (http://localhost:3000)
# This also exposes Cloudflare bindings via nitro-cloudflare-dev
pnpm dev:web
```

Before logging in, seed an admin:

```bash
pnpm seed:admin:local --username admin --password <strong-secret>
```

For local testing, the seeded admin account is:

- Admin login: `http://localhost:3000/x/login`
- Username: `admin`
- Password: `admin123`
- Admin dashboard: `http://localhost:3000/x/dashboard`
- Client login: `http://localhost:3000/login`

The `admin123` credentials are for local development only. Use a strong password
when seeding staging or production.

## Template system

Templates are Vue components in `apps/web/app/components/templates/<id>/`. They
receive a single `invitation: PublicInvitation` prop and only change presentation.

To add a new template:

1. Add the id, name, description and OG theme to `TEMPLATE_IDS` in `packages/types/src/template.ts`.
2. Create the component at `apps/web/app/components/templates/<id>/<Id>Template.vue`.
3. Register it in `apps/web/app/utils/templates.ts`.

The picker, preview, public page and OG renderer will pick it up automatically.

## Public OG images

Publish stores a versioned absolute OG URL and the server serves a branded SVG
fallback at that URL. This intentionally avoids Satori/resvg WASM limits in the
Worker. If raster images or image uploads are required later, add an R2 bucket
and a Cloudflare-compatible renderer, retaining the same versioned URL contract.
No extra configuration is required for the current SVG fallback.

## Scripts

- `pnpm dev:web` — Nuxt dev server with local Cloudflare bindings
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:migrate:local` — apply migrations to local D1
- `pnpm seed:admin:local` — seed an admin user locally
- `pnpm typecheck` — TypeScript check across all packages
- `pnpm lint` — ESLint
- `pnpm test` — run tests
- `pnpm db:migrate:staging` / `pnpm db:migrate:prod` — apply remote migrations
- `pnpm seed:admin:staging` / `pnpm seed:admin:prod` — seed a remote admin
- `pnpm deploy:web` / `pnpm deploy:web:dev` — deploy Pages production / branch preview

## Environments

The repository defines local, staging, and production bindings, but does not
create or configure real Cloudflare resources. Environment-specific variables,
custom-domain routing, and the release sequence are documented in
`docs/launch-readiness.md`.

For the Cloudflare Pages Git integration use:

- Build command: `pnpm --filter @vowly/web build`
- Build output directory: `apps/web/dist`
- Deploy command: `pnpm exec wrangler pages deploy apps/web/dist --project-name <PAGES_PROJECT_NAME>`

Replace `<PAGES_PROJECT_NAME>` with the exact Pages project name. Do not use
`npx wrangler deploy`; that is the standalone Worker deploy command.

The Pages build also needs a `CLOUDFLARE_API_TOKEN` secret with **Account →
Cloudflare Pages → Edit** permission. Add `CLOUDFLARE_ACCOUNT_ID` if the build
does not provide the account automatically.
