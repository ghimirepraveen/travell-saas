# SaaS Migration & Delivery Plan

Phased plan to grow this repo from **scaffold** → **core travel website backend**.  
Architecture rules live in [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## Current state (baseline)

| Area | Status |
|------|--------|
| Multi-tenant DB (master + per-tenant PostgreSQL) | Done |
| Core layer (middleware, errors, JWT, Drizzle pool) | Done |
| Tenant onboarding + migrations on create | Done |
| Superadmin + agency staff auth | Done |
| Bookings module (real Drizzle, inventory decrement) | Done — **template module** |
| Packages / customers / inventory APIs | Schema only |
| Destinations | Done |
| FAQs / package enquiries | Done |
| Quotes, payments, documents, public API | Not started |
| Swagger / OpenAPI | Not started |
| Razorpay, S3, email | Not started |

---

## Phase 1 — Foundation hardening (low risk)

**Goal:** Consistent layers and safe defaults before adding features.

| Task | Owner layer | Acceptance |
|------|-------------|------------|
| Ensure all controllers use `asyncHandler` | controllers | No manual try/catch |
| All services use `HttpException` + `ErrorCodes` | services | No raw `Error` to client |
| Protect `POST /admin/tenants` (superadmin or API key) | routes/middleware | Unauthorized without credential |
| Add `scripts/seed-tenant.ts` (package, departure, customer) | scripts | One command after tenant create |
| Tighten CORS for production | `app.ts` | No wildcard when `NODE_ENV=production` |
| Add health check with DB ping | `app.ts` | `/health` reports DB status |

**Do not:** Rename folders or change tenancy model.

---

## Phase 2 — Catalog (core website content)

**Goal:** Agencies can manage what they sell.

### 2a — Packages module

| Item | Details |
|------|---------|
| Routes | CRUD under `/api/v1/packages` |
| Slug | Generated in **service**, unique per tenant DB |
| Status | `draft` \| `published` \| `archived` |
| Repository | `withTenantDb`, table `packages.travel_packages` |

### 2b — Destinations module

| Item | Details |
|------|---------|
| Schema | `destinations.destinations` (+ optional media table) |
| Routes | CRUD under `/api/v1/destinations` |
| Link | `travel_packages.destination` or FK |

### 2b.1 — FAQs and package enquiries

| Item | Details |
|------|---------|
| FAQ routes | CRUD under `/api/v1/faqs` |
| Package enquiry routes | CRUD under `/api/v1/package-enquiries` |

### 2c — Inventory (departures)

| Item | Details |
|------|---------|
| Routes | CRUD `/api/v1/inventory/departures` |
| Rules | `booked_seats <= total_seats`; no delete if bookings exist |

### 2d — Customers (CRM)

| Item | Details |
|------|---------|
| Routes | CRUD `/api/v1/customers` |
| Used by | Bookings (`booking_travelers`) |

**Exit criteria:** Create package → add departure → create customer → create booking (no raw SQL seed).

---

## Phase 3 — Agency & RBAC

**Goal:** Branding and staff permissions.

| Module | Work |
|--------|------|
| `agency` | Profile, `booking_prefix`, logo URL, branches |
| `users` | Staff CRUD (tenant DB) |
| `roles` / `permissions` | Wire tables already in tenant `auth` schema |
| Middleware | `authorize(['admin', 'agent'])` on sensitive routes |

**Exit criteria:** Agent cannot delete packages; admin can.

---

## Phase 4 — Sales pipeline

| Module | Work |
|--------|------|
| `quotes` | Enquiry → line items → accept → convert to booking |
| Booking service | Optional `quoteId` on create |
| Status history | `bookings.booking_status_history` table |

**Keep:** Separate **Quote** (pre-sale) vs **Booking** (committed).

---

## Phase 5 — Commerce

| Module | Work |
|--------|------|
| `payments` | `payments`, `refunds` tables |
| Razorpay | Order create, webhook, signature verify |
| Booking status | `pending_payment` → `confirmed` on webhook |

| Env vars | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |

**Rule:** Payment amount calculated in service from booking row — never trust client total.

---

## Phase 6 — Documents & notifications

| Item | Work |
|------|------|
| `documents` | Voucher PDF metadata, visa uploads |
| S3 service | `core/services/s3.service.ts`, tenant-prefixed keys |
| Mail service | Booking confirmation, quote sent |

---

## Phase 7 — Public / storefront API

**Goal:** B2C website per agency (subdomain).

| Item | Work |
|------|------|
| `public` routes | `GET /api/v1/public/packages`, package detail |
| Tenant resolve | Subdomain → `auth.tenants.slug` |
| Auth | Optional: public read, no JWT |
| Rate limiting | Per IP + per tenant |

---

## Phase 8 — API productization

| Item | Work |
|------|------|
| Swagger | `/docs` from route annotations or `swagger.json` |
| Webhooks | Outbound booking status to agency systems |
| Subscription enforcement | Check plan limits on tenant create / seat count |
| `analytics` | Reporting read models (optional) |

---

## Model checklist (tenant DB)

| Table / schema | Phase | Notes |
|----------------|-------|-------|
| `auth.users` | Done | Staff |
| `packages.travel_packages` | 2a | Done |
| `inventory.departures` | 2c | |
| `customers.customers` | 2d | |
| `bookings.*` | Done | |
| `destinations.*` | 2b | Done |
| `agencies.*` | 3 | New |
| `quotes.*` | 4 | New |
| `payments.*` | 5 | New |
| `documents.*` | 6 | New |

---

## Master DB checklist

| Table | Phase | Notes |
|-------|-------|-------|
| `auth.tenants` | Done | |
| `auth.superadmins` | Done | |
| `subscription.*` | 8 | Wire routes |
| `global_settings` | 8 | FX, feature flags |

---

## Orphan / dead code policy

Before each phase:

1. Grep for unmounted routes and unused DTOs
2. Delete or wire — no “maybe later” files in `src/modules`
3. Update [ARCHITECTURE.md](../ARCHITECTURE.md) API map

---

## Suggested timeline (indicative)

| Phase | Duration (1 dev) |
|-------|------------------|
| 1 | 2–3 days |
| 2 | 1–2 weeks |
| 3 | 1 week |
| 4 | 1 week |
| 5 | 1–2 weeks |
| 6–8 | 2+ weeks |

---

## How to use this doc in PRs

PR title: `[Phase 2a] packages: add publish endpoint`

PR description must include:

- Phase/task from this doc
- Updated ARCHITECTURE.md section (if API/schema changed)
- Migration commands run locally

---

*Last aligned with repo scaffold: bookings live, catalog APIs pending.*
