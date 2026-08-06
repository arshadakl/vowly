# Launch Readiness

This is the M5 runbook for Vowly. It deliberately contains no resource IDs,
tokens, passwords, or commands that create production resources automatically.

## Environments

| Environment | Web                                   | API                     | Data                |
| ----------- | ------------------------------------- | ----------------------- | ------------------- |
| local       | `http://localhost:3000`               | `http://localhost:8787` | local D1, R2, KV    |
| staging     | Pages preview/custom staging hostname | `vowly-api-staging`     | staging D1/R2/KV    |
| production  | Pages custom domain                   | `vowly-api`             | production D1/R2/KV |

Local web development points to the Worker with `NUXT_PUBLIC_API_BASE=http://localhost:8787`.
Staging Pages builds must set that variable to the staging API origin. Production
Pages builds must leave it empty so browser requests use same-origin `/api`.

## Resource Setup

Create separate D1 databases, R2 buckets, KV namespaces, and Workers Secrets for
staging and production in the Cloudflare dashboard or with Wrangler. Replace only
the placeholder IDs in `workers/api/wrangler.toml`; do not put secrets there.

Required secret: the Worker authentication/session secret if the application
adds one. Current admin passwords are supplied to the seed command and stored by
the script as a PBKDF2 hash. Use `wrangler secret put <NAME> --env staging` or
without `--env` for production, from `workers/api`.

## Release Sequence

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm --filter @vowly/web build`, and `pnpm api:dry-run`.
2. Apply migrations to staging with `pnpm db:migrate:staging`.
3. Deploy the API to staging with `pnpm deploy:api:staging`.
4. Build and publish the Pages preview with the staging API base, then smoke-test login, publish, public viewing, and RSVP.
5. Confirm the staging migration and smoke test. Take a production D1 export before the release if data already exists.
6. Apply production migrations with `pnpm db:migrate:prod`.
7. Deploy the API with `pnpm deploy:api:prod`.
8. Build Pages with an empty `NUXT_PUBLIC_API_BASE` and publish the intended artifact.
9. Verify `/api/health`, admin login, one real invitation, and one RSVP end to end.

## Cloudflare Pages Build Settings

Configure the Pages project with these values:

| Setting | Value |
|---------|-------|
| Root directory | `/` |
| Build command | `pnpm --filter @vowly/web build` |
| Build output directory | `apps/web/dist` |
| Deploy command | `pnpm --filter @vowly/api exec wrangler pages deploy ../../apps/web/dist --project-name <PAGES_PROJECT_NAME>` |

This project uses a Cloudflare build configuration that requires a deploy command.
Use the Pages deploy command above. Replace `<PAGES_PROJECT_NAME>` with the exact
Cloudflare Pages project name. Do not use `npx wrangler deploy`: that command is
for Workers, runs from the wrong directory here, and is not available as a root
dependency. Deploy the API separately through the `vowly-api` Workers Build.

For non-production branch deployments, use the same command with the branch name:

```bash
pnpm --filter @vowly/api exec wrangler pages deploy ../../apps/web/dist --project-name <PAGES_PROJECT_NAME> --branch "$CF_PAGES_BRANCH"
```

Set `NUXT_PUBLIC_API_BASE` to the staging API origin for preview/staging builds.
Leave it empty in production after the same-zone `/api/*` route is configured.

The Pages deploy command requires a Cloudflare API token in the build environment.
Configure these values under the build project's variables/secrets:

- `CLOUDFLARE_API_TOKEN` — secret token with **Account → Cloudflare Pages → Edit**
  permission, restricted to the Vowly account.
- `CLOUDFLARE_ACCOUNT_ID` — `69d7e5e3b8444560b5a95b46afce1828` if Cloudflare does
  not provide the account automatically.

If Wrangler reports API error `10000`, replace or rotate the token. Never commit or
paste the token into the repository or issue logs.

Never use local seed credentials in staging or production. Keep the first soft
launch invitation unpublished until the complete flow has been checked.

## Routing

The Worker app is mounted at `/api`, so the public health endpoint is
`https://<host>/api/health`. Configure a Cloudflare zone route for
`<custom-domain>/api/*` targeting the `vowly-api` Worker. Configure the equivalent
staging route for `vowly-api-staging`. The Pages project serves all other paths.

The route must be on the same zone as the Pages custom domain, and DNS, SSL/TLS,
and the Pages custom domain must be active first. Do not add a route for all
traffic or point `/api/*` at the Pages project. Until the custom route exists,
use the Worker hostname as `NUXT_PUBLIC_API_BASE` for a staging-only build.

## Backups And Recovery

- Enable D1 Time Travel and confirm its retention in the Cloudflare dashboard.
- Before every production migration, export the D1 database with `wrangler d1 export vowly-db --remote --output <file.sql>` and store it in an access-controlled, encrypted location outside the repository.
- Perform and verify a weekly export; retain at least four known-good copies.
- R2 objects need their own lifecycle and recovery policy. Do not treat a D1 export as an image backup.
- To recover, stop writes, identify the incident window, use D1 Time Travel or the reviewed SQL export, then verify admin login, invitation reads, publish, and RSVP counts.
- Record the incident, restore point, verification results, and any lost writes before reopening traffic.

## Monitoring And Rollback

- Configure an external uptime check for `GET /api/health`, expecting HTTP 200 and JSON `status: "ok"`; alert after two consecutive failures.
- Configure notifications for Worker errors, D1 errors, KV/R2 errors, and Pages deployment failures in the Cloudflare dashboard.
- During an incident, inspect logs with `wrangler tail vowly-api` or `wrangler tail vowly-api-staging`. Never paste cookies, passcodes, query strings, or secrets into incident notes.
- Roll back the Pages deployment from Pages deployment history. Roll back the Worker with the Cloudflare dashboard or the reviewed `wrangler rollback` command.
- Do not roll back a Worker across an incompatible D1 migration. Restore data first or deploy a forward fix.
- After rollback, check `/api/health`, authentication, public invitation access, and RSVP submission.

## Security Launch Checklist

- [ ] Production resource IDs and names are separate from staging.
- [ ] No secrets, admin passwords, passcodes, exports, or `.dev.vars` files are in git.
- [ ] Production admin uses a unique strong password and local `admin123` is not reused.
- [ ] Worker and Pages custom domains have SSL/TLS enabled and HTTPS redirect enforced.
- [ ] `/api/*` is the only Worker route; all other traffic serves Pages.
- [ ] Cookies are Secure, HttpOnly, and SameSite=Lax in production.
- [ ] CORS allows only the required origins; same-origin production traffic does not need wildcard CORS.
- [ ] Rate limits, RSVP honeypot, Zod validation, authorization, and security headers are verified.
- [ ] Admin and client application routes are `noindex`; public invitations are intentionally indexable.
- [ ] D1 Time Travel, weekly exports, uptime alerts, Worker logs, and Pages rollback access are verified.
- [ ] One real-client soft-launch flow passes on mobile and desktop.

## Manual Cloudflare Steps

The following cannot be safely completed from this repository: create the real
Cloudflare resources, copy their IDs into Wrangler, configure Workers/Pages
custom domains and `/api/*` routes, set Workers Secrets and Pages variables,
enable D1 Time Travel, configure export storage/lifecycle, create uptime and
error alerts, and enable the `nodejs_compat` Pages compatibility flag if the
deployed build requires it.
