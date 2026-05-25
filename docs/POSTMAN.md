# Run Travel SaaS API in Postman

## 1. Prerequisites (terminal)

```bash
cd "/Users/prabinmac/Desktop/project /travel saas"
cp .env.example .env
npm install
npm run db:up          # Docker Postgres
npm run db:setup       # master migrations
npm run dev            # API on http://localhost:3000
```

---

## 2. Import into Postman

1. Open **Postman** → **Import**
2. Select both files:
   - `postman/Travel-SaaS-API.postman_collection.json`
   - `postman/Travel-SaaS-Local.postman_environment.json`
3. Top-right: choose environment **Travel SaaS - Local**

---

## 3. Environment variables

| Variable | Value | Purpose |
|----------|--------|---------|
| `baseUrl` | `http://localhost:3000` | API server |
| `tenantSubdomain` | `himalayan-tours` | Sent as `x-tenant-subdomain` on every request |
| `ownerEmail` | `owner@himalayan-tours.com` | First agency owner |
| `ownerPassword` | `password123` | Owner password |
| `accessToken` | *(auto)* | Set after login |
| `refreshToken` | *(auto)* | Set after login |
| `tenantId` | *(auto)* | Set after create tenant |

The collection **pre-request script** adds header:

```http
x-tenant-subdomain: {{tenantSubdomain}}
```

That is how Postman simulates `himalayan-tours.localhost` without a real subdomain in the URL bar.

---

## 4. Run the full flow (folder **0. Bootstrap Flow**)

Click the folder → **Run** (Collection Runner) or run each request in order:

| Step | Request | What happens |
|------|---------|----------------|
| **1** | Health Check | API is up |
| **2** | Create Tenant + Owner | Master tenant + tenant DB + owner user + email |
| **3** | Login Owner | Saves `accessToken` + `refreshToken` |
| **4** | Create Staff | Owner JWT → new agent user |
| **5** | Login Agent | Optional — switch token to agent |
| **6** | Create Booking | Needs DB seed (below) |

### Step 2 — body (already in collection)

```json
POST {{baseUrl}}/api/v1/admin/tenants

{
  "name": "Himalayan Tours",
  "slug": "himalayan-tours",
  "owner": {
    "email": "owner@himalayan-tours.com",
    "password": "password123",
    "fullName": "Agency Owner"
  }
}
```

### Step 3 — login (no tenant in body)

```json
POST {{baseUrl}}/api/v1/auth/login
Header: x-tenant-subdomain: himalayan-tours  (automatic)

{
  "email": "owner@himalayan-tours.com",
  "password": "password123"
}
```

### Step 4 — create staff (Bearer token required)

```json
POST {{baseUrl}}/api/v1/auth/users
Authorization: Bearer {{accessToken}}

{
  "email": "agent@himalayan-tours.com",
  "password": "password123",
  "fullName": "Travel Agent",
  "role": "agent"
}
```

---

## 5. Seed data for booking (step 6)

After step 2, find tenant DB name in the response (`tenant.databaseName`), then in pgAdmin or `psql`:

```sql
-- connect to database tenant_<uuidwithoutdashes>

INSERT INTO packages.travel_packages (title, slug, base_price, status)
VALUES ('Everest Base Camp', 'everest-base-camp', 1200.00, 'published');

INSERT INTO inventory.departures (package_id, departure_date, total_seats)
SELECT id, '2026-09-15', 20 FROM packages.travel_packages WHERE slug = 'everest-base-camp';

INSERT INTO customers.customers (first_name, last_name, email)
VALUES ('Jane', 'Doe', 'jane@example.com');
```

Copy UUIDs into Postman environment: `packageId`, `departureId`, `customerId`.

Then run **6. Create Booking**.

---

## 6. Other folders

| Folder | Use |
|--------|-----|
| **Admin - Tenants** | List / get tenants |
| **Superadmin** | Platform admin register/login |
| **Auth** | Login, refresh, logout, create staff |
| **Bookings** | List / get / create (needs JWT) |

---

## 7. Common errors

| Error | Fix |
|-------|-----|
| `ECONNREFUSED` | Start Postgres: `npm run db:up` |
| `Could not resolve agency from host` | Set `tenantSubdomain` in environment |
| `401` on `/auth/users` | Run **Login Owner** first; use Bearer token |
| `409` email exists | Change email or use new slug for new tenant |
| Booking fails | Run SQL seed; set packageId, departureId, customerId |

---

## 8. Collection Runner

1. Click collection **Travel SaaS API**
2. **Run**
3. Select folder **0. Bootstrap Flow**
4. Environment: **Travel SaaS - Local**
5. **Run Travel SaaS API**

Skip step 6 until seed SQL is done, or run steps 1–5 first.
