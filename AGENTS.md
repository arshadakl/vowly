# Agent guide for Vowly

## Project overview

- Monorepo: `pnpm` workspaces
  - `apps/web` — Nuxt 4 + Tailwind 4 + VueUse
  - `workers/api` — Hono + Drizzle ORM + Wrangler
  - `packages/types` — shared Zod schemas and TypeScript types
  - `packages/utils` — pure domain utilities (slug, dates, passcode, ics, countdown) + tests
  - `packages/ui` — placeholder for future shared UI primitives
  - `database/` — migration SQL output and seed script
- Everything is meant to run on Cloudflare (Pages, Workers, D1, R2, KV).

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies for all packages |
| `pnpm dev:web` | Nuxt dev server (http://localhost:3000) |
| `pnpm dev:api` | Wrangler dev server (http://localhost:8787) |
| `pnpm db:generate` | Generate Drizzle migration SQL |
| `pnpm db:migrate:local` | Apply migrations to local D1 |
| `pnpm db:migrate:staging` | Apply migrations to staging D1 |
| `pnpm db:migrate:prod` | Apply migrations to production D1 |
| `pnpm seed:admin:local` | Seed an admin user locally |
| `pnpm seed:admin:staging` / `pnpm seed:admin:prod` | Seed an admin remotely (strong password required) |
| `pnpm api:dry-run` | Build/validate the Worker without deploying |
| `pnpm typecheck` | Type-check everything |
| `pnpm lint` | Lint TS and web files |
| `pnpm test` | Run tests |
| `pnpm --filter @vowly/web build` | Production Nuxt build |
| `pnpm deploy:api:staging` / `pnpm deploy:api:prod` | Deploy API Worker to an environment |

## Local login routes

- Client login: `http://localhost:3000/login`
- Admin login: `http://localhost:3000/x/login`
- Admin dashboard: `http://localhost:3000/x/dashboard`

After applying local migrations, the default local test admin is `admin` / `admin123`.
Never use those credentials outside local development.

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `refactor:`, `test:`.
- **No semicolons**, single quotes, 100-char line width (Prettier).
- **No `any`**. Strict TypeScript everywhere.
- **All request bodies** are validated with Zod on the server.
- **Never trust frontend input**.
- **Never store images in D1**. Use R2.
- **Never log passcodes, query strings or session tokens**.
- **Dates and locks** are computed server-side in the client's timezone (`wedding_tz`, default `Asia/Kolkata`).
- **Shared code lives in `packages/types` and `packages/utils`**.

## Adding a new invitation template

1. Open `packages/types/src/template.ts` and add the template to `TEMPLATE_IDS` with its metadata and OG theme.
2. Create the component at `apps/web/app/components/templates/<id>/<Id>Template.vue`.
   - It must accept `defineProps<{ invitation: PublicInvitation }>`.
3. Register it in `apps/web/app/utils/templates.ts`.

The template picker, preview, public page and OG generator will automatically pick it up.

## Environment setup and operations

Resource creation, environment variables, custom `/api/*` routing, release
order, backups, monitoring, rollback, and the security launch checklist are
maintained in `docs/launch-readiness.md`. Do not create real Cloudflare
resources as part of local development or automated verification.

## Tests

Unit tests live in `packages/utils/src/*.test.ts`. API integration tests will be
added using `@cloudflare/vitest-pool-workers` in later milestones.

Run tests with `pnpm test`.

## Troubleshooting

- `nuxi typecheck` may print a non-fatal warning about `vue-router/volar/sfc-route-blocks`.
  This is a known upstream mismatch between the generated Nuxt types and the latest
  vue-router exports. Typecheck still exits with code 0.
- The Cloudflare Pages build may warn that `Node.js compatibility is not enabled`.
  If you see runtime errors, enable the `nodejs_compat` compatibility flag in the
  Pages project settings.
