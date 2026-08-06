# Vowly — Development Plan

> Companion to `plan.md` (the WHAT). This document is the HOW: architecture decisions,
> phases, task breakdown, estimates, quality gates, and risk management.
> Assumed team: 1 senior developer + coding agent. Estimates in ideal dev-days.

## Architecture Rebaseline

Vowly will use the same deployment model as the working Gas Supplier Management
project: **one Nuxt Cloudflare Pages/Worker deployment** containing the frontend,
server API routes, D1/R2/KV bindings, authentication, and business logic.

The current `workers/api` Hono Worker is a temporary implementation source. It will
be migrated route-by-route into `apps/web/server/api/`, verified, and removed only
after parity tests pass. No production data or resources are deleted during this
migration.

Target runtime:

```text
Git push
   ↓
Cloudflare Pages/Worker: vowly
   ├── Nuxt pages and SSR
   ├── apps/web/server/api/*
   ├── D1: DB
   ├── R2: MEDIA
   └── KV: RATE_LIMIT
```

This removes the separate web/API deployment, CORS dependency, custom `/api/*`
Worker route, and duplicated Wrangler configuration.

---

# 1. Spec Review — Findings & Decisions

The spec is strong. These are the gaps/risks a senior review catches. Each has a
**decision** so work is never blocked — override any of them before Phase 1 starts.

## 1.1 Security & Auth

| # | Finding | Decision |
|---|---------|----------|
| S1 | Spec stores client `passcode` in DB with no mention of hashing. Admin must re-share magic links, so passcodes must be retrievable. | Store passcode **plaintext in D1** (documented trade-off), readable only via admin endpoints, never logged. V2: encrypt with a key held in Workers Secrets. |
| S2 | Admin password hashing algorithm unspecified. bcrypt and WASM Argon2 are not reliable in all Worker runtimes. | **PBKDF2-SHA-256 via WebCrypto** with 310,000 iterations and a random salt; native in Node and Cloudflare Workers. |
| S3 | No session strategy in spec. | **Cookie sessions**: `__Host-session`, HttpOnly, Secure, SameSite=Lax. Token stored **SHA-256 hashed** in new `sessions` table. Admin TTL 12h, client TTL 30d sliding. Logout = row delete. |
| S4 | "Use Cloudflare rate limiting" — the zone-level feature is plan-dependent and coarse. | Implement lockout ourselves in **Workers KV** (TTL built-in): key on passcode AND on IP. 10 fails → 15-min lock (spec says max 10; duration was undefined — now defined). |
| S5 | Magic link `?key=PASSCODE` leaks via browser history, logs, screenshots. | Accepted as core UX. Mitigate: `Referrer-Policy: no-referrer` on auth pages, never log query strings, document the trade-off. |
| S6 | Spec has no passcode recovery flow. Client WILL lose it. | Admin gets **"Regenerate passcode"** button (invalidates old magic links). This is a required V1 feature, not optional. |

## 1.2 Data & Logic

| # | Finding | Decision |
|---|---------|----------|
| D1 | `editable_until` column + `wedding_date` = two sources of truth for the lock. | **Drop `editable_until`.** Lock is *derived*: `now > wedding_date 23:59:59` in the client's timezone. Admin override = nullable `edit_override` column (`force_open` / `force_locked`). |
| D2 | "End of wedding day" — in **which timezone**? Classic bug. Phone format and event types (Nikah/Haldi) imply India. | Store `clients.wedding_tz`, default `Asia/Kolkata`. ALL lock/countdown math in shared date utils with unit tests. Server-side enforcement, never client-side. |
| D3 | When is the slug generated? Spec says permanent — but names get typo-fixed before publish. | Slug generated **once, at first publish**, from current names + date. Renames after publish do NOT change it. Unique index; collision retry `-2`, `-3` inside the same transaction. Pure, unit-tested function. |
| D4 | One invitation per client? Implied but not enforced. | Enforce `UNIQUE(client_id)` on `invitations`. |
| D5 | Spec's DB has no `sessions` table, no uniqueness on `passcode`, no indexes listed. | Add `sessions` table (see §3), `UNIQUE(passcode)`, indexes on `slug`, `clients.status`, `wedding_date`. FKs on with `PRAGMA foreign_keys=ON`. |
| D6 | ARCHIVED vs DELETED behavior for the public URL undefined. | **ARCHIVED** = hidden from dashboard lists, public page stays live (couples keep memories). **DELETED** = soft delete, public URL returns 410, purge from R2 after 30 days (scheduled job). |
| D7 | Phone validation unspecified. | Store E.164; validate with `libphonenumber-js`; India default region. |

## 1.3 Public Features

| # | Finding | Decision |
|---|---------|----------|
| P1 | OG image generation on Workers is the **riskiest technical item** (WASM size/perf limits). | Spike in Phase 0 (see §4). Use `workers-og` (Satori + resvg-wasm), 1200×630 JPEG q80 (<300 KB so WhatsApp shows it reliably). **OG failure must never fail publish** — fall back to branded default OG, log, move on. |
| P2 | WhatsApp/Facebook **cache OG images aggressively**. Re-publish won't update previews. | OG URL is versioned: `og/{slug}.jpg?v={published_at}`. Re-publish bumps the version. |
| P3 | RSVP is a public unauthenticated endpoint → spam vector. | KV IP rate limit (10/hr) + honeypot field + Zod. Guest list visible only to owning client + admin. |
| P4 | "Dashboard shows RSVP totals" — which dashboard? | Client dashboard gets RSVP summary + guest list; admin sees it inside the client detail view. |
| P5 | QR code — no backend needed. | Generate client-side (`qrcode` lib), render in invitation + share panel. |
| P6 | Add-to-calendar — no backend needed. | Pure util in `packages/utils`: Google Calendar URL + downloadable `.ics` per event. Unit tested (dates, tz, all-day edge cases). |
| P7 | Crawlers must see OG tags → public page must be SSR, no auth wall. | Nuxt SSR route `/[slug]` calls the local server service directly, injects `og:*`/`twitter:*` with absolute URLs. Admin/client areas ship `noindex`. |

## 1.4 Ops Gaps

| # | Finding | Decision |
|---|---------|----------|
| O1 | How is the first admin created? | Seed script (`database/seed.ts`) run via wrangler against each env. |
| O2 | No environments defined. | 3: **local** (wrangler dev / local D1), **preview** (Cloudflare branch deployment + preview D1/R2/KV), **prod** (main deployment + production D1/R2/KV). |
| O3 | No backups, monitoring, or on-call story. | D1 Time Travel + scheduled weekly export to R2. Uptime check on `/api/health`. Workers tail logs V1; Sentry post-launch if needed. |
| O4 | Spec has both `packages/` and top-level `shared/`. Two homes for shared code = drift. | Consolidate: `packages/types` (Zod schemas + DTOs shared by web AND worker), `packages/utils`. **Delete top-level `shared/`** from the structure. |

---

# 2. Architecture & Tech Decisions (ADR-lite)

```
                 ┌────────────────────────────────────────────┐
                  ┌──────────────────────────────────────────┐
                  │       Cloudflare Pages/Worker: vowly     │
                  ├──────────────────────────────────────────┤
                  │ Nuxt SSR + pages                         │
                  │ apps/web/server/api/*                    │
                  │ Auth, validation, business logic         │
                  └──────────────┬──────────────┬─────────────┘
                                 │              │
                         ┌───────┴──────┐ ┌─────┴─────┐
                         │ D1: DB       │ │ R2: MEDIA │
                         │ SQLite      │ │ images   │
                         └─────────────┘ └───────────┘
                                 │
                         ┌───────┴──────┐
                         │ KV: RATE_LIMIT│
                         └──────────────┘
```

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | **pnpm workspaces** (no Turborepo) | Spec's structure; Turborepo is overhead for 1 dev. npm scripts suffice. |
| Web/API deploy | Nuxt 4 SSR + Nitro `cloudflare-pages` preset → **one Cloudflare Pages/Worker project** | Matches the proven Gas project setup and removes a deployment boundary. |
| API | Nuxt server routes under `apps/web/server/api/` | Same runtime and bindings as the web app; no Hono Worker boundary. |
| Same-origin routing | Nuxt server routes handle `/api/*` internally | No CORS, service binding, or custom Worker route required. |
| ORM/migrations | **Drizzle ORM + drizzle-kit** | D1-native, lightweight, SQL-first migrations. Prisma-on-Workers is heavier. |
| Shared validation | Zod schemas live in `packages/types`, imported by both web forms and Hono | Single source of truth — spec's "no duplicated logic". |
| Auth | Cookie sessions in D1 (see S3), PBKDF2-SHA-256 admin password, plaintext retrievable passcodes | See §1.1. Nuxt server handlers set the cookies. |
| Rate limiting | Workers KV with TTL | See S4. |
| OG images | `workers-og` → R2, versioned URLs, fallback default | See P1/P2. |
| UI primitives | **Reka UI** (headless, accessible) + Tailwind; custom components in `packages/ui` | Luxury custom look without an opinionated kit; a11y for free on dialogs/dropdowns. |
| Forms | VeeValidate + shared Zod schemas | Client editor is form-heavy; DX win, zero schema duplication. |
| State | Composables + `useFetch` only. **No Pinia in V1.** | App is not state-complex; keep it stupidly simple. |
| Fonts | Self-hosted via `@fontsource` | No render-blocking third-party CSS; premium typography is core to the product. |
| Image uploads | Client-side compress (browser-image-compression) → presigned R2 PUT via Worker | Validates mime + ≤5 MB server-side. No images through the Worker body. |
| Testing | Vitest (unit) + Nuxt/Nitro route integration tests + Playwright smoke (e2e) | Tests run against the same server-route boundaries used in production. |
| Deployment | Cloudflare Git integration with root `wrangler.toml` | One build and one deploy; D1/R2/KV bindings live in the root config. |

**Non-negotiables carried from spec:** strict TS, ESLint+Prettier, Zod on every
request, proper HTTP codes, never trust frontend input, mobile-first, 2 templates max in V1.

---

# 3. Single-Deployment Migration Plan

The migration is additive and reversible. The existing Hono API remains available
until the Nuxt server-route equivalent passes parity checks.

## 3.1 Target Structure

```text
apps/web/
├── app/                       # Nuxt pages/components
├── server/
│   ├── api/
│   │   ├── health.get.ts
│   │   ├── auth/admin/*.ts
│   │   ├── auth/client/*.ts
│   │   ├── admin/clients/*.ts
│   │   ├── client/invitation/*.ts
│   │   ├── public/invitations/[slug].get.ts
│   │   └── public/invitations/[slug]/rsvp.post.ts
│   ├── middleware/security.ts
│   └── utils/                 # D1/R2/KV/auth server helpers
└── wrangler.toml              # Pages output + DB/MEDIA/RATE_LIMIT bindings

packages/types/                # shared schemas and DTOs
packages/utils/                # pure utilities, including password/date logic
workers/api/                   # temporary source; removed after parity
```

## 3.2 Migration Order

| Step | Work | Exit condition |
|------|------|----------------|
| SD-001 | Add root bindings for D1, R2 and KV; keep IDs environment-specific | Local `wrangler dev` exposes all bindings. |
| SD-002 | Add server runtime helpers for D1/Drizzle, sessions, password verification, rate limits and R2 | Helpers have unit tests and no browser imports. |
| SD-003 | Migrate health and auth routes | Admin/client login and logout pass against local D1. |
| SD-004 | Migrate admin client routes | CRUD, status actions, pagination and IDOR checks pass. |
| SD-005 | Migrate client invitation/editor routes | Lock rules, events and uploads pass. |
| SD-006 | Migrate publishing/public/RSVP routes | Publish, public SSR, RSVP and rate limits pass. |
| SD-007 | Switch `useApi` to same-origin Nuxt server routes | No local API port or CORS dependency remains. |
| SD-008 | Remove `workers/api`, its Wrangler config and separate deploy scripts | One Cloudflare project builds and deploys the complete product. |
| SD-009 | Run preview migration against isolated D1/R2/KV | Full smoke flow passes on a branch deployment. |

## 3.3 Binding Configuration

The root `wrangler.toml` becomes the only web deployment configuration:

```toml
name = "vowly"
compatibility_date = "2025-12-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "apps/web/dist"

[[d1_databases]]
binding = "DB"
database_name = "vowly-db"
database_id = "<production-id>"
migrations_dir = "database/migrations"

[[r2_buckets]]
binding = "MEDIA"
bucket_name = "vowly-media"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "<production-id>"
```

Preview bindings must be configured as a separate Cloudflare environment/database,
never by pointing preview builds at production D1.

## 3.4 Deployment Contract

```text
Build:  pnpm run build
Deploy: pnpm exec wrangler pages deploy apps/web/dist --project-name vowly
```

Cloudflare Pages handles the single deployment. There is no separate API Worker,
API route, service binding, or CORS configuration after SD-008.

---

# 4. Data Model Deltas (vs spec §26)

Keep spec tables, with these changes:

```sql
-- NEW: sessions
sessions(id TEXT PK, subject_type TEXT CHECK(subject_type IN ('admin','client')),
         subject_id TEXT NOT NULL, token_hash TEXT NOT NULL,
         created_at, expires_at, last_seen_at, ip, user_agent)

-- clients:  + wedding_tz TEXT DEFAULT 'Asia/Kolkata'
--           + UNIQUE(passcode)
-- invitations: - editable_until  (REMOVED — derived, see D1)
--           + edit_override TEXT NULL CHECK(edit_override IN ('force_open','force_locked'))
--           + UNIQUE(client_id)  (D4)
-- rsvp:     + honeypot guard handled at API layer (no column)
-- indexes: invitations.slug UNIQUE, clients.status, clients.wedding_date,
--          events.invitation_id, rsvp.invitation_id, sessions.expires_at
```

Migrations: `database/migrations/` via drizzle-kit. Applied to preview automatically,
to prod only from `main` with confirmation.

---

# 5. Phases & Milestones

> **Rule:** the riskiest tech is spiked FIRST (M0), not discovered in M3.
> Every milestone has exit criteria — "done" means the criteria, not the vibes.

| Milestone | Name | Estimate | Exit Criteria |
|-----------|------|----------|---------------|
| **M0** | Foundations & Risk Spikes | 3–4 d | Hello-world deployed full-path: Nuxt server routes + D1/R2/KV bindings, Cloudflare preview deployment green. **Spike 1:** OG image renders on the deployed runtime. **Spike 2:** SSR page emits per-invitation OG tags readable by a crawler (curl test). |
| **M1** | Admin Core | 4–5 d | Admin logs in/out; full client lifecycle (create → magic link → regenerate passcode → archive → delete); dashboard cards + search/filter/pagination; lockout triggers at 10 fails. |
| **M2** | Client Editor | 6–8 d | Client logs in (passcode+phone, magic-link autofill); edits all invitation fields; unlimited sortable events CRUD; image upload (compress→R2); template picker; live preview with desktop/tablet/mobile toggle. |
| **M3** | Templates, Publish & Public Page | 6–8 d | Classic + Luxury templates (presentation-only); one-click publish (slug gen + collision + OG + idempotent); public `/[slug]` with all spec §22 sections; countdown (tz-correct); QR; share; add-to-calendar; auto-lock + admin override + locked UI. |
| **M4** | RSVP & Hardening | 4–5 d | RSVP toggle + public submit + spam guards + totals in dashboards; security pass; perf pass (Lighthouse mobile ≥ 90 on public page); a11y pass; empty/error states; e2e smoke green. |
| **M5** | Launch | 2–3 d | Prod env + secrets + migrations; monitoring, uptime, backups; runbook; soft-launched with 1 real client invitation. |

**Total: 25–35 dev-days.** With 30% buffer: **~6–8 weeks full-time**, longer if part-time.
Estimates assume the phase order below — dependencies are real; do not parallelize M2 and M3 templates.

---

# 6. Task Breakdown & Estimates

Ticket format `VOW-###`. `◆` = on the critical path.

## M0 — Foundations & Risk Spikes (3–4 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-001 ◆ | pnpm monorepo scaffold (apps/web, packages/{ui,types,utils}, database), shared tsconfig/eslint/prettier | 0.5 | — |
| VOW-002 ◆ | Nuxt app + Tailwind + fontsource + `nitro-cloudflare-dev` + base layout | 0.5 | 001 |
| VOW-003 ◆ | Root Pages/Worker Wrangler config with Nuxt server runtime and health route | 0.5–1 | 001 |
| VOW-004 ◆ | D1 + drizzle-kit: spec schema + §4 deltas; migrate local + preview | 0.5 | 003 |
| VOW-005 | R2 bucket + KV namespace bindings (preview/prod); root Wrangler config | 0.25 | 003 |
| VOW-006 | Configure one Cloudflare Git build for Pages/Worker previews and production | 0.5 | 002–003 |
| VOW-007 ◆ | **SPIKE:** OG image renders within the deployed Nuxt Worker runtime | 0.5–1 | 003 |
| VOW-008 ◆ | **SPIKE:** Nuxt SSR dynamic OG tags verified via curl (no JS execution) | 0.25 | 002 |
| VOW-009 | Seed script: create admin (PBKDF2-SHA-256) per env | 0.25 | 004 |

## M1 — Admin Core (4–5 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-010 ◆ | Session service (create/validate/rotate/delete, hashed tokens) + auth middleware (admin/client guards) | 1 | 004 |
| VOW-011 ◆ | Admin login/logout/me endpoints + login UI | 0.5 | 010 |
| VOW-012 | KV rate limiter: 10 fails → 15-min lock (per passcode + per IP) | 0.5 | 010 |
| VOW-013 ◆ | Client CRUD API + auto client_code (CL-000001) + CSPRNG passcode gen (unambiguous alphabet, 6 chars) | 1 | 010 |
| VOW-014 | Admin dashboard: 4 status cards, search, filter, paginated table | 1 | 013 |
| VOW-015 | Client detail: regenerate passcode, copy magic link, archive/delete with confirm | 0.5–1 | 013 |
| VOW-016 | Error envelope standard `{error:{code,message}}` + handler middleware | 0.25 | 010 |

## M2 — Client Editor (6–8 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-020 ◆ | Client login (passcode+phone, zod) + magic-link autofill `/login?key=` | 0.5 | 010,012 |
| VOW-021 ◆ | Invitation GET/PUT API (owner-scoped, lock-aware — D1/D2 rules server-side) | 1 | 020 |
| VOW-022 ◆ | Editor form: bride/groom names, quote, wedding date display (VeeValidate + shared zod) | 1 | 021 |
| VOW-023 ◆ | Events CRUD: unlimited, drag-sort (`sort_order`), all spec §8 fields | 1.5 | 021 |
| VOW-024 ◆ | Image upload: client compress → presigned R2 PUT → save key (cover/bride/groom) | 1 | 021 |
| VOW-025 | Template picker (Classic/Luxury) wired to `invitations.template` | 0.25 | 022 |
| VOW-026 ◆ | Live preview pane with device toggle; instant reflect of form state | 1 | 022–025 |
| VOW-027 | Locked-state UI + "event has ended" message (also enforced by API 403) | 0.5 | 021 |

## M3 — Templates, Publish & Public Page (6–8 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-030 ◆ | `ClassicTemplate.vue` — full spec §22 sections, mobile-first, motion/CSS animations | 2 | 026 |
| VOW-031 ◆ | `LuxuryTemplate.vue` — same invitation object, presentation-only | 1.5 | 030 |
| VOW-032 ◆ | Publish API: transaction { slug gen + collision retry, published flags, OG job } — idempotent | 1 | 021 |
| VOW-033 ◆ | Slug util (normalize → kebab → `-2`/`-3`) + unit tests | 0.25 | — |
| VOW-034 ◆ | OG generation at publish → R2 + versioned URL; fallback default on failure | 0.5–1 | 007,032 |
| VOW-035 ◆ | Public `/[slug]` SSR page + OG/Twitter meta + `noindex` on app areas | 1 | 030–032 |
| VOW-036 | Countdown component (tz-safe; "Thank you…" state) | 0.5 | 030 |
| VOW-037 | Share: copy link, WhatsApp deep link, QR display/download | 0.5 | 035 |
| VOW-038 | Add-to-calendar (.ics + gcal URL) + copy-address + maps button utils | 0.5 | — |
| VOW-039 | Auto-lock cron/derived check + admin override toggle in dashboard | 0.5 | 015,032 |

## M4 — RSVP & Hardening (4–5 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-040 ◆ | RSVP API: toggle (admin), public submit (zod + honeypot + KV IP limit), totals endpoint | 1 | 032,012 |
| VOW-041 | RSVP UI: public form on invitation + client dashboard summary/guest list + admin view | 1 | 040 |
| VOW-042 | Security pass: headers (CSP, Referrer-Policy…), cookie audit, IDOR/authorization tests, zod coverage audit, robots | 1 | 040 |
| VOW-043 | Perf pass: image lazy/sizes, bundle audit, font preload, cache headers → Lighthouse mobile ≥ 90 | 0.5–1 | 035 |
| VOW-044 | A11y pass: focus management, contrast, aria on dialogs/forms, keyboard nav | 0.5 | 041 |
| VOW-045 | Empty states, error states, toasts, loading skeletons | 0.5 | 041 |
| VOW-046 | Playwright smoke: login→create→fill→publish→public view→RSVP→lock | 1 | 040 |

## M5 — Launch (2–3 d)

| ID | Task | Est | Depends |
|----|------|-----|---------|
| VOW-050 | Prod D1/R2/KV + secrets + migrations apply + seed admin | 0.5 | M4 |
| VOW-051 | Uptime monitor on `/api/health` + alert; wrangler tail runbook | 0.25 | 050 |
| VOW-052 | Weekly D1 export → R2 (scheduled worker) + Time Travel verified | 0.5 | 050 |
| VOW-053 | Launch checklist run (§8) + load sanity (100 concurrent RSVP/posts) | 0.5 | 050 |
| VOW-054 | Soft launch: 1 real client end-to-end; fix-forward window | 0.5–1 | 053 |
| VOW-055 | README + AGENTS.md (env, commands, deploy, runbook) | 0.25 | 050 |

---

# 7. Testing Strategy & Quality Gates

**Pyramid (kept deliberately lean):**

- **Unit (Vitest)** — `packages/utils` + `packages/types`: slug gen/collision, countdown math, lock-rule function, ics builder, passcode gen, all zod schemas. *These are pure and cheap; aim ~90% coverage here.*
- **Server-route integration** — real local Cloudflare bindings: auth flows, lockout at 10, owner-scoping (client A cannot read/write client B — IDOR), publish transaction, RSVP limits.
- **E2E (Playwright)** — ONE smoke suite, ~6 flows (VOW-046). Runs on `main` + pre-release, not per-PR.

**Quality gates:**

| Gate | When | Requirement |
|------|------|-------------|
| PR gate | Every PR | typecheck 0 errors, lint 0 warnings, unit+server-route tests green, preview deploy succeeds |
| Milestone gate | End of each M | Exit criteria checklist (§4) reviewed and ticked |
| Release gate | Before prod | E2E smoke green, Lighthouse mobile ≥ 90 on public page, manual a11y sweep, security pass (VOW-042) done |
| Definition of Done | Every task | Responsive, typed, zod-validated server-side, errors handled, no `any`, works on 360px viewport |

---

# 8. Cloudflare Deployments & Environments

```
feature/* → PR → Cloudflare Pages/Worker preview deployment
main      → merge → Cloudflare Pages/Worker production deployment
```

- **Envs:** local / preview / prod — separate D1, R2, KV, secrets (`wrangler secret put`).
- **Deployment:** managed by one Cloudflare Git integration; no GitHub Actions workflow is used.
- **Quality checks:** run `pnpm typecheck`, `pnpm lint` and `pnpm test` locally before pushing.
- **Secrets** stay in Cloudflare Workers Secrets and Pages environment variables; never in the repo.
- **Migrations** are one-way, numbered, never edited after merge.
- **Rollback:** Cloudflare deployment rollback; D1 via Time Travel.

---

# 9. Risk Register

| # | Risk | P | Impact | Mitigation |
|---|------|---|--------|-----------|
| R1 | OG image WASM blows Worker size/CPU limits | M | Publish blocked | **Spiked in M0 (VOW-007)**; fallback default OG means publish never hard-fails |
| R2 | Timezone bugs in lock/countdown | H | Wrong lock = angry couples | Single date util, `wedding_tz` column, unit tests, server-side enforcement only |
| R3 | Same-host Pages+Workers routing quirks | M | CORS/architecture rework | Validated in M0 (VOW-003) before any feature code |
| R4 | WhatsApp caches stale OG after re-publish | H | Wrong preview forever | Versioned OG URLs (P2) |
| R5 | RSVP endpoint spammed | M | Junk data, cost | KV IP limit + honeypot + zod (VOW-040) |
| R6 | Passcode in URL leaked via logs/referrers | L | Account access | Referrer-Policy, no query logging; documented trade-off (S5) |
| R7 | Scope creep (extra templates, gallery, music) | H | Schedule death | Spec §30 is frozen; anything new → V2 backlog, no exceptions mid-milestone |
| R8 | D1 migration mistake in prod | L | Data loss | Staging-first applies, weekly exports + Time Travel (VOW-052) |
| R9 | Phone-camera images huge/slow uploads | M | Editor feels broken | Client-side compression + 5 MB cap (VOW-024) |
| R10 | Solo-dev bus factor | M | Project stalls | AGENTS.md runbook, Cloudflare-managed deployments, and documented local quality checks (VOW-055) |

---

# 10. Launch Checklist (M5 gate)

- [ ] All Release gates green (§6)
- [ ] Prod admin seeded with strong password; default creds nowhere
- [ ] Security headers live; admin/client areas `noindex`
- [ ] Backups scheduled; restore tested once (actually restore, don't assume)
- [ ] Uptime alert fires to a real inbox/phone
- [ ] One real invitation published, shared on WhatsApp, OG preview verified on iOS + Android
- [ ] Lock behavior verified against a past-dated test wedding
- [ ] Runbook written: deploy, rollback, regenerate passcode, unlock client, export DB

---

# 11. V2 Backlog (mapping spec §30 — do NOT pull into V1)

Guest Book · Gallery · Background Music · Confetti · i18n · Analytics ·
Custom Domains · Wedding Timeline · Multi-tenant Admins · Payments ·
Passcode encryption at rest · Sentry · Public-page edge caching (Cache API).

---

## Working Agreements

- **Trunk-based:** short-lived `feature/*` branches, small PRs (<400 lines diff), Conventional Commits.
- **Ticket IDs** `VOW-###` in branch names + commits for traceability.
- **Never** edit merged migrations, never store images in D1, never log secrets/passcodes/query strings.
- Spec change mid-flight? It goes through §1 as a new decision row — not into code on the side.
