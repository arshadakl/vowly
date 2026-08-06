# Database Operations

Drizzle migrations are generated from `apps/web/server/utils/schema.ts` and
written to `./migrations`. The root `wrangler.toml` points to this directory.

Migrations are one-way release artifacts. Generate and review a migration locally;
never edit an applied migration or run an unreviewed migration against production.

## Scripts

Generate a migration from the current schema:

```bash
pnpm db:generate
```

Apply migrations to the local D1 database:

```bash
pnpm db:migrate:local
```

Seed an admin user locally:

```bash
pnpm seed:admin:local --username admin --password <strong-secret>
```

Apply the reviewed migrations to staging, then seed its admin:

```bash
pnpm db:migrate:staging
pnpm seed:admin:staging --username admin --password <strong-secret>
```

For production, obtain an explicit confirmation and run the same sequence with
the production scripts:

```bash
pnpm db:migrate:prod
pnpm seed:admin:prod --username admin --password <strong-secret>
```

The remote commands require the Cloudflare account to be authenticated and the
resource IDs in the root `wrangler.toml` to have been replaced. Passwords are
command-line arguments only for this one-time script and must never be committed
or pasted into logs.

See `docs/launch-readiness.md` for the backup, monitoring, rollback, and release
runbook.
