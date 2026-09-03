# Launch Readiness

Cloudinary invitation-photo configuration, quotas, staging verification, deletion, backup, and rollback are
documented in [cloudinary-setup.md](./cloudinary-setup.md). Production release requires a successful staged
signed upload/confirm/delivery/delete cycle; automated tests must use mocks.

This is the M5 runbook for Vowly. It deliberately contains no resource IDs,
tokens, passwords, or commands that create production resources automatically.

## Environments

Vowly is deployed as a single Cloudflare Pages/Worker project. Nuxt server
routes handle all `/api/*` traffic inside the same deployment; no separate API
Worker or custom `/api/*` route is required.

| Environment | Web                               | Data          |
| ----------- | --------------------------------- | ------------- |
| local       | `http://localhost:3000`           | local D1      |
| staging     | Pages preview / branch deployment | staging D1    |
| production  | Pages custom domain               | production D1 |

Local development uses same-origin `/api` requests. `NUXT_PUBLIC_API_BASE`
should not be set in local `.dev.vars` unless you are intentionally testing a
remote API origin.

## Resource Setup

Create D1 databases for staging and production in the Cloudflare dashboard or
with Wrangler. Replace the placeholder IDs in the root `wrangler.toml` with the
real production IDs; replace the staging IDs in the `wrangler.toml` staging
environment or in the Pages project environment variables for branch previews.

Required resource per environment:

- D1 database bound as `DB`.

When image uploads or raster OG images are enabled later, add an R2 bucket
bound as `MEDIA` and update `apps/web/server/utils/env.ts` and the upload
routes accordingly.

Secrets, if any are added later, must be set with `wrangler secret put` for
the `vowly` Pages/Worker project. Admin passwords are supplied to the seed
command and stored as PBKDF2 hashes in D1.

## Release Sequence

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm --filter @vowly/web build`.
2. Apply migrations to staging with `pnpm db:migrate:staging`.
3. Deploy a branch preview with `pnpm deploy:web:dev` or via the Cloudflare Git integration.
4. Smoke-test on the preview URL: `/api/health`, admin login, client create, publish, public viewing, and RSVP.
5. Confirm the staging migration and smoke test. Take a production D1 export before the release if data already exists.
6. Apply production migrations with `pnpm db:migrate:prod`.
7. Deploy production with `pnpm deploy:web` or via the Git integration on `main`.
8. Verify `/api/health`, admin login, one real invitation, and one RSVP end to end.

## Cloudflare Pages Build Settings

Configure the Pages project with these values:

| Setting                | Value                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Root directory         | `/`                                                                                 |
| Build command          | `pnpm --filter @vowly/web build`                                                    |
| Build output directory | `apps/web/dist`                                                                     |
| Deploy command         | `pnpm exec wrangler pages deploy apps/web/dist --project-name <PAGES_PROJECT_NAME>` |

This project uses a Cloudflare build configuration that requires a deploy command.
Use the Pages deploy command above. Replace `<PAGES_PROJECT_NAME>` with the exact
Cloudflare Pages project name. Do not use `npx wrangler deploy`: that command is
for standalone Workers and runs from the wrong directory here.

For non-production branch deployments, use the same command with the branch name:

```bash
pnpm exec wrangler pages deploy apps/web/dist --project-name <PAGES_PROJECT_NAME> --branch "$CF_PAGES_BRANCH"
```

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

All `/api/*` requests are served by Nuxt server routes inside the Pages/Worker
deployment. No custom Cloudflare zone route or separate Worker is required. The
Pages project serves all other paths.

Public health endpoint: `https://<host>/api/health`.

## Backups And Recovery

- Enable D1 Time Travel and confirm its retention in the Cloudflare dashboard.
- Before every production migration, export the D1 database with `wrangler d1 export vowly --remote --output <file.sql>` and store it in an access-controlled, encrypted location outside the repository.
- Perform and verify a weekly export; retain at least four known-good copies.

- To recover, stop writes, identify the incident window, use D1 Time Travel or the reviewed SQL export, then verify admin login, invitation reads, publish, and RSVP counts.
- Record the incident, restore point, verification results, and any lost writes before reopening traffic.

## Monitoring And Rollback

- Configure an external uptime check for `GET /api/health`, expecting HTTP 200 and JSON `status: "ok"`; alert after two consecutive failures.
- Configure notifications for Pages deployment failures, Worker errors, and D1 errors in the Cloudflare dashboard.
- During an incident, inspect logs with `wrangler tail vowly`. Never paste cookies, passcodes, query strings, or secrets into incident notes.
- Roll back the Pages deployment from the Pages deployment history. Do not roll back across an incompatible D1 migration; restore data first or deploy a forward fix.
- After rollback, check `/api/health`, authentication, public invitation access, and RSVP submission.

## Security Launch Checklist

- [ ] Production resource IDs and names are separate from staging.
- [ ] No secrets, admin passwords, passcodes, exports, or `.dev.vars` files are in git.
- [ ] Production admin uses a unique strong password and local `admin123` is not reused.
- [ ] Pages custom domain has SSL/TLS enabled and HTTPS redirect enforced.
- [ ] Cookies are Secure, HttpOnly, and SameSite=Lax in production.
- [ ] Rate limits, RSVP honeypot, Zod validation, authorization, and security headers are verified.
- [ ] Admin and client application routes are `noindex`; public invitations are intentionally indexable.
- [ ] D1 Time Travel, weekly exports, uptime alerts, Worker logs, and Pages rollback access are verified.
- [ ] One real-client soft-launch flow passes on mobile and desktop.

## Manual Cloudflare Steps

The following cannot be safely completed from this repository: create the real
Cloudflare resources, copy their IDs into Wrangler, configure Pages custom
domains, set Workers Secrets and Pages variables, enable D1 Time Travel,
configure export storage/lifecycle, create uptime and error alerts, and enable
the `nodejs_compat` Pages compatibility flag if the deployed build requires it.
