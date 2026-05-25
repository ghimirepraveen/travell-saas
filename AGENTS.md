# Agent Instructions — Travel SaaS Backend

Rules for AI assistants (Cursor, Copilot, etc.) working in this repository.  
**Authoritative architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Project identity

- **Product:** Multi-tenant travel agency SaaS (tour operators / DMCs)
- **Stack:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Tenancy:** Database-per-tenant (NOT single DB + `tenantId` column)
- **API prefix:** `/api/v1` (see `envConfig.apiPrefix`)

---

## Mandatory layer boundaries

```text
routes → middleware → controller (functions) → service (functions) → repository (functions) → Drizzle schema
```

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Routes | HTTP, middleware chain | Business logic, DB |
| Controllers | Named exports + `asyncHandler`, call service, `sendResponse` | Classes, Drizzle, `res.json` custom shapes |
| Services | Named exports, business rules, `HttpException` | Classes, `req`/`res`, SQL |
| Repositories | Named exports, `withTenantDb` / `masterDb`, transactions | Classes, HTTP |
| Schemas | Table definitions | API formatting |
| Validation | Zod schema + `z.infer` types in `validation/` | Business logic |

**Template module:** `src/modules/bookings/` — copy structure for new features.

---

## Multi-tenancy rules

1. Platform data (tenants, superadmins, subscriptions) → `masterDb`
2. Agency data (packages, bookings, customers) → `withTenantDb(tenantId, ...)`
3. Tenant-scoped routes **must** include: `authenticationMiddleware`, `tenantResolver`
4. Pass `req.tenantId!` from controller to service — never read tenant id only from body

---

## Code style

- **Function-based** controllers, services, repositories (no classes except exceptions)
- Import services/repos as namespaces: `import * as bookingService from '../services/booking.service'`
- async/await only (no callback-style Express)
- Path aliases: `@/core/...`, `@/modules/...`
- Request validation: Zod + `zodValidationMiddleware(schema)` on routes; `z.infer<typeof schema>` for service types
- Errors: `HttpException` + constants from `core/constants/errorCodes.ts`
- Responses: `sendResponse(res, data, status)` — standard envelope only
- Controllers: `asyncHandler` from `core/middleware/errorHandler.middleware.ts`
- UUID params: `String(req.params.id)`

---

## Adding a new module (checklist)

1. Create `src/modules/{name}/` with routes, controller, service, repository, dto, model
2. Add Drizzle schema under `src/core/database/schemas/tenant/` (or master)
3. Run `npm run generate:tenant` or `generate:master`, commit migration SQL
4. Mount routes in `src/app.ts`
5. Update `ARCHITECTURE.md` §7 API map and `docs/SAAS-MIGRATION.md` phase table

---

## Do not

- Put Mongoose or MongoDB patterns in this repo (PostgreSQL + Drizzle only)
- Add `tenantId` columns to tenant DB tables for isolation (use separate DB)
- Skip migrations or hand-edit applied migration files without noting it
- Create commits unless the user asks
- Add markdown files the user did not ask for (except architecture docs already requested)
- Use `res.json({ error: ... })` — use standard error envelope
- Implement Razorpay/S3/mail transport in controllers — use `core/services/` (e.g. `mail.service.ts`)

---

## Commands

```bash
npm run dev              # Dev server
npm run build            # tsc
npm run db:setup         # Master DB migrate
npm run generate:master  # New master migration
npm run generate:tenant  # New tenant migration
```

---

## When unsure

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Read [TRAVEL_SAAS_BLUEPRINT.md](./TRAVEL_SAAS_BLUEPRINT.md) for folder templates
3. Mirror `modules/bookings/` for structure
4. Ask before changing tenancy model or response envelope
