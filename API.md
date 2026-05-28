# Travel SaaS API Documentation

Generated from Express route mounts, routers, controllers, middleware, validation schemas, and services on 2026-05-28.

## Table Of Contents

- [Overview](#overview)
- [Authentication And Tenant Resolution](#authentication-and-tenant-resolution)
- [Standard Responses](#standard-responses)
- [Frontend Integration Examples](#frontend-integration-examples)
- [Endpoint Summary](#endpoint-summary)
- [System](#system)
- [Tenant Management](#tenant-management)
- [Superadmin](#superadmin)
- [Auth](#auth)
- [Bookings](#bookings)
- [Destinations](#destinations)
- [FAQs](#faqs)
- [Packages](#packages)
- [Package Enquiries](#package-enquiries)
- [Site Settings](#site-settings)

## Overview

- Product: Multi-tenant travel agency SaaS backend.
- Runtime: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL.
- Default server URL: `http://localhost:3000`.
- API prefix: `/api/v1` from `envConfig.apiPrefix`.
- Health endpoint: `/health` is outside the API prefix.
- No Swagger/OpenAPI configuration or file upload middleware was detected in the current project scan.
- Tenant isolation is database-per-tenant. Tenant-scoped routes do not use a `tenantId` body field as the source of truth.

## Authentication And Tenant Resolution

Tenant authentication accepts either:

- `Authorization: Bearer <access_token>`
- `access_token` HttpOnly cookie set by `POST /api/v1/auth/login`

Tenant refresh/logout accepts `refresh_token` from either the HttpOnly cookie or a JSON body field named `refreshToken`.

Tenant context is resolved in this order depending on middleware:

- Host or `x-forwarded-host` subdomain.
- `x-tenant-subdomain` header.
- `x-tenant-id` header.
- Authenticated JWT `tenantId` claim.
- For auth host-resolution routes only: body `tenantId` or `tenantSlug` before Zod body validation.

Role enforcement currently exists on `POST /api/v1/auth/users` only, allowing `owner` and `admin`. Other protected tenant resource routes require a valid tenant user but do not enforce per-role authorization in route middleware.

## Standard Responses

Success envelope:

```json
{
  "success": true,
  "status_code": 200,
  "data": {}
}
```

Error envelope:

```json
{
  "success": false,
  "message": "Example validation message",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

## Frontend Integration Examples

Tenant login with cookies:

```ts
const login = async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-subdomain': tenantSubdomain,
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

Protected tenant request with Bearer token:

```ts
const listPackages = async (token: string) => {
  const response = await fetch(`${baseUrl}/api/v1/packages?page=1&limit=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-subdomain': tenantSubdomain,
    },
  });
  return response.json();
};
```

Protected tenant request with cookies:

```ts
const listBookings = async () => {
  const response = await fetch(`${baseUrl}/api/v1/bookings`, {
    credentials: 'include',
    headers: { 'x-tenant-subdomain': tenantSubdomain },
  });
  return response.json();
};
```

## Endpoint Summary

| Module | Method | Endpoint | Auth | Description |
| --- | --- | --- | --- | --- |
| System | GET | /health | No | Check whether the API process is responding. |
| Tenant Management | GET | /api/v1/admin/tenants | No | List all provisioned tenant agencies from the master database. |
| Tenant Management | GET | /api/v1/admin/tenants/:id | No | Fetch one tenant agency by ID from the master database. |
| Tenant Management | POST | /api/v1/admin/tenants | No | Provision a tenant record, migrate the tenant database, create the first owner user, and send the onboarding email when mail is enabled. |
| Superadmin | POST | /api/v1/superadmin/register | No | Create a platform superadmin account in the master database. |
| Superadmin | POST | /api/v1/superadmin/login | No | Authenticate a platform superadmin. The access token is set in the `superadmin_token` HttpOnly cookie. |
| Auth | GET | /api/v1/auth/agency/:slug | No | Resolve an active agency by slug and return public profile basics. |
| Auth | POST | /api/v1/auth/login | No | Authenticate a tenant user. The route resolves tenant context from host, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validating credentials. |
| Auth | POST | /api/v1/auth/refresh | No | Rotate a tenant refresh token and issue a new access/refresh cookie pair. |
| Auth | POST | /api/v1/auth/logout | No | Revoke the supplied tenant refresh token when present and clear tenant auth cookies. |
| Auth | POST | /api/v1/auth/users | Yes | Create a tenant staff account and send an invite email asynchronously. |
| Bookings | GET | /api/v1/bookings | Yes | List bookings for the resolved tenant ordered by newest first. |
| Bookings | GET | /api/v1/bookings/:id | Yes | Fetch a single booking and its travelers. |
| Bookings | POST | /api/v1/bookings | Yes | Create a booking, validate package/departure/customer references, reserve seats, and attach travelers. |
| Destinations | GET | /api/v1/destinations | Yes | List tenant destinations using pagination. |
| Destinations | GET | /api/v1/destinations/public | Yes | Public-named destination list route. Current route middleware still requires tenant authentication. |
| Destinations | GET | /api/v1/destinations/:id | Yes | Fetch one tenant destination by UUID. |
| Destinations | POST | /api/v1/destinations | Yes | Create a tenant destination. |
| Destinations | PATCH | /api/v1/destinations/:id | Yes | Update one or more destination fields. |
| FAQs | GET | /api/v1/faqs/public | Yes | Public-named FAQ list route. Current route middleware still requires tenant authentication. |
| FAQs | GET | /api/v1/faqs | Yes | List tenant FAQs using pagination. |
| FAQs | GET | /api/v1/faqs/:id | Yes | Fetch one tenant FAQ by UUID. |
| FAQs | POST | /api/v1/faqs | Yes | Create a tenant FAQ. |
| FAQs | PATCH | /api/v1/faqs/:id | Yes | Update one or more FAQ fields. |
| FAQs | DELETE | /api/v1/faqs/:id | Yes | Delete a tenant FAQ. |
| Packages | GET | /api/v1/packages | Yes | List published packages for the tenant using pagination. |
| Packages | GET | /api/v1/packages/public | Yes | List published packages for storefront use. Current route middleware still requires tenant authentication. |
| Packages | GET | /api/v1/packages/featured | Yes | List packages that are both published and featured. |
| Packages | GET | /api/v1/packages/:id | Yes | Fetch one tenant package by UUID. |
| Packages | POST | /api/v1/packages | Yes | Create a travel package and generate a unique slug from the title. |
| Packages | PATCH | /api/v1/packages/:id | Yes | Update one or more package fields. |
| Package Enquiries | GET | /api/v1/package-enquiries | Yes | List package enquiries for the tenant using pagination. |
| Package Enquiries | GET | /api/v1/package-enquiries/:id | Yes | Fetch one package enquiry by UUID. |
| Package Enquiries | POST | /api/v1/package-enquiries | Yes | Create a package enquiry for a customer and package. |
| Package Enquiries | PATCH | /api/v1/package-enquiries/:id | Yes | Update one or more package enquiry fields. |
| Package Enquiries | DELETE | /api/v1/package-enquiries/:id | Yes | Delete a package enquiry. |
| Site Settings | GET | /api/v1/site-settings | Yes | Fetch the resolved tenant's default site settings row. |
| Site Settings | GET | /api/v1/site-settings/:slug | No | Fetch site settings by slug for the resolved tenant. This route resolves tenant context but does not require authentication in the current implementation. |
| Site Settings | PATCH | /api/v1/site-settings | Yes | Update one or more fields on the resolved tenant's default site settings row. |

## System

Health and runtime endpoints.

### GET /health

Description: Check whether the API process is responding.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- No request validation middleware is applied.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "status": "ok"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Unhandled server or database error.",
  "error_code": "DATABASE_ERROR",
  "status_code": 500
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/health"
```

## Tenant Management

Master database tenant provisioning and lookup.

### GET /api/v1/admin/tenants

Description: List all provisioned tenant agencies from the master database.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None enforced by route middleware. Intended for platform administration.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- No request validation middleware is applied.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "Himalayan Tours",
      "slug": "himalayan-tours",
      "databaseName": "tenant_11111111111141118111111111111111",
      "status": "active",
      "planId": null,
      "country": "NP",
      "timezone": "Asia/Kathmandu",
      "createdAt": "2026-05-28T10:00:00.000Z",
      "updatedAt": "2026-05-28T10:00:00.000Z"
    }
  ]
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Unhandled server or database error.",
  "error_code": "DATABASE_ERROR",
  "status_code": 500
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/admin/tenants"
```

### GET /api/v1/admin/tenants/:id

Description: Fetch one tenant agency by ID from the master database.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None enforced by route middleware. Intended for platform administration.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{tenant_id}} | Tenant UUID. This route does not currently run Zod param validation. |

Request Body:

None.

Validation Rules:

- id is expected to be a tenant UUID. This route does not currently run Zod param validation.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 404 | TENANT_NOT_FOUND | Tenant was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Himalayan Tours",
    "slug": "himalayan-tours",
    "databaseName": "tenant_11111111111141118111111111111111",
    "status": "active",
    "planId": null,
    "country": "NP",
    "timezone": "Asia/Kathmandu",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 404 | TENANT_NOT_FOUND | Tenant was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Tenant was not found.",
  "error_code": "TENANT_NOT_FOUND",
  "status_code": 404
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/admin/tenants/{{tenant_id}}"
```

### POST /api/v1/admin/tenants

Description: Provision a tenant record, migrate the tenant database, create the first owner user, and send the onboarding email when mail is enabled.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None enforced by route middleware. Intended for platform administration.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "name": "Himalayan Tours",
  "slug": "himalayan-tours",
  "country": "NP",
  "timezone": "Asia/Kathmandu",
  "owner": {
    "email": "owner@himalayan-tours.com",
    "password": "password123",
    "fullName": "Agency Owner"
  }
}
```

Validation Rules:

- name: string, trimmed, 2 to 255 characters.
- slug: lowercase letters/numbers/hyphens, 2 to 100 characters.
- country: optional ISO-like 2-character string.
- timezone: optional trimmed string.
- owner.email: valid email.
- owner.password: at least 8 characters.
- owner.fullName: optional trimmed string.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "tenant": {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "Himalayan Tours",
      "slug": "himalayan-tours",
      "databaseName": "tenant_11111111111141118111111111111111",
      "status": "active",
      "planId": null,
      "country": "NP",
      "timezone": "Asia/Kathmandu",
      "createdAt": "2026-05-28T10:00:00.000Z",
      "updatedAt": "2026-05-28T10:00:00.000Z"
    },
    "owner": {
      "id": "22222222-2222-4222-8222-222222222222",
      "email": "owner@himalayan-tours.com",
      "fullName": "Agency Owner",
      "role": "owner"
    },
    "loginUrl": "http://himalayan-tours.localhost:5173/login",
    "ownerEmailSent": false
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/admin/tenants" \
  -H "Content-Type: application/json" \
  -d '{"name":"Himalayan Tours","slug":"himalayan-tours","country":"NP","timezone":"Asia/Kathmandu","owner":{"email":"owner@himalayan-tours.com","password":"password123","fullName":"Agency Owner"}}'
```

## Superadmin

Platform superadmin registration and login.

### POST /api/v1/superadmin/register

Description: Create a platform superadmin account in the master database.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "email": "superadmin@example.com",
  "password": "password123",
  "fullName": "Platform Admin"
}
```

Validation Rules:

- email: valid email.
- password: at least 8 characters.
- fullName: optional trimmed string.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 409 | VALIDATION_ERROR | Email is already registered. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "22222222-2222-4222-8222-222222222222",
    "email": "superadmin@example.com",
    "fullName": "Platform Admin"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 409 | VALIDATION_ERROR | Email is already registered. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/superadmin/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123","fullName":"Platform Admin"}'
```

### POST /api/v1/superadmin/login

Description: Authenticate a platform superadmin. The access token is set in the `superadmin_token` HttpOnly cookie.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "email": "superadmin@example.com",
  "password": "password123"
}
```

Validation Rules:

- email: valid email.
- password: at least 8 characters.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Credentials are invalid. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "user": {
      "id": "22222222-2222-4222-8222-222222222222",
      "email": "superadmin@example.com",
      "role": "superadmin"
    }
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Credentials are invalid. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/superadmin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

## Auth

Tenant login, refresh/logout, agency profile, and staff creation.

### GET /api/v1/auth/agency/:slug

Description: Resolve an active agency by slug and return public profile basics.

Authentication Required: No.

Tenant Context: None.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| slug | Yes | {{tenant_slug}} | Tenant slug, lowercase alphanumeric with hyphens. |

Request Body:

None.

Validation Rules:

- slug is read from the path and resolved as a tenant slug/subdomain. This route does not currently run Zod param validation.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 404 | TENANT_NOT_FOUND | Agency was not found or is inactive. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "slug": "himalayan-tours",
    "name": "Himalayan Tours"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 404 | TENANT_NOT_FOUND | Agency was not found or is inactive. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Agency was not found or is inactive.",
  "error_code": "TENANT_NOT_FOUND",
  "status_code": 404
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/auth/agency/{{tenant_slug}}"
```

### POST /api/v1/auth/login

Description: Authenticate a tenant user. The route resolves tenant context from host, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validating credentials.

Authentication Required: No.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validation.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | Yes | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "email": "owner@himalayan-tours.com",
  "password": "password123"
}
```

Validation Rules:

- email: valid email.
- password: at least 8 characters.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Credentials are invalid. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "user": {
      "id": "22222222-2222-4222-8222-222222222222",
      "email": "owner@himalayan-tours.com",
      "role": "owner",
      "tenantId": "11111111-1111-4111-8111-111111111111"
    }
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 401 | UNAUTHORIZED | Credentials are invalid. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -d '{"email":"owner@himalayan-tours.com","password":"password123"}'
```

Notes:

- Successful login sets `access_token` and `refresh_token` HttpOnly cookies. The JSON response intentionally contains `data.user`, not raw tokens.

### POST /api/v1/auth/refresh

Description: Rotate a tenant refresh token and issue a new access/refresh cookie pair.

Authentication Required: No.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validation.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | Yes | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

Validation Rules:

- No Zod body validation. `refreshToken` is accepted from the `refresh_token` cookie or request body.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Refresh token is missing. |
| 401 | REFRESH_TOKEN_INVALID | Refresh token is invalid, expired, or revoked. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "user": {
      "id": "22222222-2222-4222-8222-222222222222",
      "email": "owner@himalayan-tours.com",
      "role": "owner",
      "tenantId": "11111111-1111-4111-8111-111111111111"
    }
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Refresh token is missing. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 401 | REFRESH_TOKEN_INVALID | Refresh token is invalid, expired, or revoked. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Refresh token is missing.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -d '{"refreshToken":"{{refresh_token}}"}'
```

### POST /api/v1/auth/logout

Description: Revoke the supplied tenant refresh token when present and clear tenant auth cookies.

Authentication Required: No.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validation.

Role Permissions: None

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | Yes | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

Validation Rules:

- No Zod body validation. `refreshToken` is optional and can come from the `refresh_token` cookie or request body.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 401 | REFRESH_TOKEN_INVALID | A provided refresh token is invalid. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "loggedOut": true
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 401 | REFRESH_TOKEN_INVALID | A provided refresh token is invalid. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Tenant context cannot be resolved from host or headers.",
  "error_code": "TENANT_NOT_FOUND",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/auth/logout" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -d '{"refreshToken":"{{refresh_token}}"}'
```

### POST /api/v1/auth/users

Description: Create a tenant staff account and send an invite email asynchronously.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or body fallback before validation.

Role Permissions: owner, admin

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | Yes | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "email": "agent@himalayan-tours.com",
  "password": "password123",
  "fullName": "Travel Agent",
  "role": "agent"
}
```

Validation Rules:

- email: valid email.
- password: at least 8 characters.
- fullName: optional trimmed string.
- role: optional enum admin, agent, accountant, viewer. Owner is rejected in service logic.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | FORBIDDEN | Authenticated user role is not allowed for the route. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 409 | VALIDATION_ERROR | Email is already registered. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "22222222-2222-4222-8222-222222222223",
    "email": "agent@himalayan-tours.com",
    "fullName": "Travel Agent",
    "role": "agent",
    "loginUrl": "http://himalayan-tours.localhost:5173/login"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | FORBIDDEN | Authenticated user role is not allowed for the route. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 409 | VALIDATION_ERROR | Email is already registered. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/auth/users" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"email":"agent@himalayan-tours.com","password":"password123","fullName":"Travel Agent","role":"agent"}'
```

## Bookings

Tenant booking workflows.

### GET /api/v1/bookings

Description: List bookings for the resolved tenant ordered by newest first.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- No request validation middleware is applied.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": [
    {
      "id": "77777777-7777-4777-8777-777777777777",
      "referenceCode": "TRV-LWZ2-ABC123",
      "packageId": "44444444-4444-4444-8444-444444444444",
      "departureId": "55555555-5555-4555-8555-555555555555",
      "travelDate": "2026-09-15",
      "paxCount": 1,
      "totalAmount": "1200.00",
      "currency": "USD",
      "status": "pending_payment",
      "createdBy": "22222222-2222-4222-8222-222222222222",
      "createdAt": "2026-05-28T10:00:00.000Z",
      "updatedAt": "2026-05-28T10:00:00.000Z",
      "travelers": [
        {
          "id": "88888888-8888-4888-8888-888888888888",
          "customerId": "66666666-6666-4666-8666-666666666666"
        }
      ]
    }
  ]
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Missing, invalid, or expired tenant access token.",
  "error_code": "UNAUTHORIZED",
  "status_code": 401
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/bookings" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/bookings/:id

Description: Fetch a single booking and its travelers.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{booking_id}} | Booking UUID. |

Request Body:

None.

Validation Rules:

- id is expected to be a booking UUID. This route does not currently run Zod param validation.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | BOOKING_NOT_FOUND | Booking was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "77777777-7777-4777-8777-777777777777",
    "referenceCode": "TRV-LWZ2-ABC123",
    "packageId": "44444444-4444-4444-8444-444444444444",
    "departureId": "55555555-5555-4555-8555-555555555555",
    "travelDate": "2026-09-15",
    "paxCount": 1,
    "totalAmount": "1200.00",
    "currency": "USD",
    "status": "pending_payment",
    "createdBy": "22222222-2222-4222-8222-222222222222",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z",
    "travelers": [
      {
        "id": "88888888-8888-4888-8888-888888888888",
        "customerId": "66666666-6666-4666-8666-666666666666"
      }
    ]
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | BOOKING_NOT_FOUND | Booking was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Missing, invalid, or expired tenant access token.",
  "error_code": "UNAUTHORIZED",
  "status_code": 401
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/bookings/{{booking_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### POST /api/v1/bookings

Description: Create a booking, validate package/departure/customer references, reserve seats, and attach travelers.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "packageId": "44444444-4444-4444-8444-444444444444",
  "departureId": "55555555-5555-4555-8555-555555555555",
  "travelDate": "2026-09-15",
  "paxCount": 1,
  "travelers": [
    {
      "customerId": "66666666-6666-4666-8666-666666666666"
    }
  ]
}
```

Validation Rules:

- packageId: UUID.
- departureId: UUID.
- travelDate: ISO date string in YYYY-MM-DD format.
- paxCount: integer, minimum 1.
- travelers: array with at least 1 item.
- travelers[].customerId: UUID.
- Service rule: travelers.length must equal paxCount.
- Service rule: package must exist and be published.
- Service rule: departure must belong to package and have enough seats.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | PACKAGE_NOT_PUBLISHED | Package exists but is not published. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 409 | INVENTORY_UNAVAILABLE | Departure does not have enough seats. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "77777777-7777-4777-8777-777777777777",
    "referenceCode": "TRV-LWZ2-ABC123",
    "packageId": "44444444-4444-4444-8444-444444444444",
    "departureId": "55555555-5555-4555-8555-555555555555",
    "travelDate": "2026-09-15",
    "paxCount": 1,
    "totalAmount": "1200.00",
    "currency": "USD",
    "status": "pending_payment",
    "createdBy": "22222222-2222-4222-8222-222222222222",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z",
    "travelers": [
      {
        "id": "88888888-8888-4888-8888-888888888888",
        "customerId": "66666666-6666-4666-8666-666666666666"
      }
    ]
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 400 | PACKAGE_NOT_PUBLISHED | Package exists but is not published. |
| 409 | INVENTORY_UNAVAILABLE | Departure does not have enough seats. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/bookings" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"packageId":"44444444-4444-4444-8444-444444444444","departureId":"55555555-5555-4555-8555-555555555555","travelDate":"2026-09-15","paxCount":1,"travelers":[{"customerId":"66666666-6666-4666-8666-666666666666"}]}'
```

## Destinations

Tenant destination catalog.

### GET /api/v1/destinations

Description: List tenant destinations using pagination.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |
| isPublished | No | true | Accepted by validation as a boolean, but the current destination table/repository has no published filter. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.
- isPublished: optional boolean. Accepted by validation; not applied by the current repository.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Kathmandu",
        "description": "Gateway city for Nepal tours.",
        "country": "Nepal",
        "city": "Kathmandu",
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/destinations?page=1&limit=20&isPublished=true" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/destinations/public

Description: Public-named destination list route. Current route middleware still requires tenant authentication.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |
| isPublished | No | true | Accepted by validation as a boolean, but the current destination table/repository has no published filter. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.
- isPublished: optional boolean. Accepted by validation; not applied by the current repository.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Kathmandu",
        "description": "Gateway city for Nepal tours.",
        "country": "Nepal",
        "city": "Kathmandu",
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/destinations/public?page=1&limit=20&isPublished=true" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

Notes:

- The destination schema has no `isPublished` column, so the validated `isPublished` query is not applied by the current repository.

### GET /api/v1/destinations/:id

Description: Fetch one tenant destination by UUID.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{destination_id}} | Destination UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | Destination was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "33333333-3333-4333-8333-333333333333",
    "name": "Kathmandu",
    "description": "Gateway city for Nepal tours.",
    "country": "Nepal",
    "city": "Kathmandu",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | Destination was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/destinations/{{destination_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### POST /api/v1/destinations

Description: Create a tenant destination.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "name": "Kathmandu",
  "description": "Gateway city for Nepal tours.",
  "country": "Nepal",
  "city": "Kathmandu"
}
```

Validation Rules:

- name: required trimmed string, 1 to 255 characters.
- description: optional trimmed string.
- country: optional trimmed string, maximum 100 characters.
- city: optional trimmed string, maximum 100 characters.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "33333333-3333-4333-8333-333333333333",
    "name": "Kathmandu",
    "description": "Gateway city for Nepal tours.",
    "country": "Nepal",
    "city": "Kathmandu",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/destinations" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"name":"Kathmandu","description":"Gateway city for Nepal tours.","country":"Nepal","city":"Kathmandu"}'
```

### PATCH /api/v1/destinations/:id

Description: Update one or more destination fields.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{destination_id}} | Destination UUID. |

Request Body:

```json
{
  "description": "Updated destination description.",
  "city": "Kathmandu"
}
```

Validation Rules:

- Same fields as create destination, all optional.
- At least one field is required.
- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | Destination was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "33333333-3333-4333-8333-333333333333",
    "name": "Kathmandu",
    "description": "Updated destination description.",
    "country": "Nepal",
    "city": "Kathmandu",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | Destination was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X PATCH "{{base_url}}/api/v1/destinations/{{destination_id}}" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"description":"Updated destination description.","city":"Kathmandu"}'
```

## FAQs

Tenant FAQ management.

### GET /api/v1/faqs/public

Description: Public-named FAQ list route. Current route middleware still requires tenant authentication.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "99999999-9999-4999-8999-999999999999",
        "question": "What is included in the package?",
        "answer": "Accommodation, guide service, and listed transfers are included.",
        "priority": 10,
        "isPublished": true,
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/faqs/public?page=1&limit=20" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/faqs

Description: List tenant FAQs using pagination.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "99999999-9999-4999-8999-999999999999",
        "question": "What is included in the package?",
        "answer": "Accommodation, guide service, and listed transfers are included.",
        "priority": 10,
        "isPublished": true,
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/faqs?page=1&limit=20" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/faqs/:id

Description: Fetch one tenant FAQ by UUID.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{faq_id}} | FAQ UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "99999999-9999-4999-8999-999999999999",
    "question": "What is included in the package?",
    "answer": "Accommodation, guide service, and listed transfers are included.",
    "priority": 10,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/faqs/{{faq_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### POST /api/v1/faqs

Description: Create a tenant FAQ.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "question": "What is included in the package?",
  "answer": "Accommodation, guide service, and listed transfers are included.",
  "priority": 10,
  "isPublished": true
}
```

Validation Rules:

- question: required trimmed string, 1 to 255 characters.
- answer: required trimmed string.
- priority: optional integer, minimum 0.
- isPublished: optional boolean.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "99999999-9999-4999-8999-999999999999",
    "question": "What is included in the package?",
    "answer": "Accommodation, guide service, and listed transfers are included.",
    "priority": 10,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/faqs" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"question":"What is included in the package?","answer":"Accommodation, guide service, and listed transfers are included.","priority":10,"isPublished":true}'
```

### PATCH /api/v1/faqs/:id

Description: Update one or more FAQ fields.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{faq_id}} | FAQ UUID. |

Request Body:

```json
{
  "answer": "Accommodation, guide service, permits, and listed transfers are included.",
  "isPublished": true
}
```

Validation Rules:

- Same fields as create FAQ, all optional.
- At least one field is required.
- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "99999999-9999-4999-8999-999999999999",
    "question": "What is included in the package?",
    "answer": "Accommodation, guide service, permits, and listed transfers are included.",
    "priority": 10,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X PATCH "{{base_url}}/api/v1/faqs/{{faq_id}}" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"answer":"Accommodation, guide service, permits, and listed transfers are included.","isPublished":true}'
```

### DELETE /api/v1/faqs/:id

Description: Delete a tenant FAQ.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{faq_id}} | FAQ UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "deleted": true
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | FAQ_NOT_FOUND | FAQ was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X DELETE "{{base_url}}/api/v1/faqs/{{faq_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

## Packages

Tenant travel package catalog.

### GET /api/v1/packages

Description: List published packages for the tenant using pagination.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "44444444-4444-4444-8444-444444444444",
        "title": "Everest Base Camp Trek",
        "slug": "everest-base-camp-trek",
        "destinationId": "33333333-3333-4333-8333-333333333333",
        "destinationName": "Kathmandu",
        "description": "A guided trekking package to Everest Base Camp.",
        "durationDays": 14,
        "basePrice": "1200.00",
        "currency": "USD",
        "status": "published",
        "isFeatured": true,
        "priority": 20,
        "isPublished": true,
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/packages?page=1&limit=20" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/packages/public

Description: List published packages for storefront use. Current route middleware still requires tenant authentication.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "44444444-4444-4444-8444-444444444444",
        "title": "Everest Base Camp Trek",
        "slug": "everest-base-camp-trek",
        "destinationId": "33333333-3333-4333-8333-333333333333",
        "destinationName": "Kathmandu",
        "description": "A guided trekking package to Everest Base Camp.",
        "durationDays": 14,
        "basePrice": "1200.00",
        "currency": "USD",
        "status": "published",
        "isFeatured": true,
        "priority": 20,
        "isPublished": true,
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/packages/public?page=1&limit=20" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/packages/featured

Description: List packages that are both published and featured.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "44444444-4444-4444-8444-444444444444",
        "title": "Everest Base Camp Trek",
        "slug": "everest-base-camp-trek",
        "destinationId": "33333333-3333-4333-8333-333333333333",
        "destinationName": "Kathmandu",
        "description": "A guided trekking package to Everest Base Camp.",
        "durationDays": 14,
        "basePrice": "1200.00",
        "currency": "USD",
        "status": "published",
        "isFeatured": true,
        "priority": 20,
        "isPublished": true,
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/packages/featured?page=1&limit=20" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/packages/:id

Description: Fetch one tenant package by UUID.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{package_id}} | Package UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_NOT_FOUND | Package was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "44444444-4444-4444-8444-444444444444",
    "title": "Everest Base Camp Trek",
    "slug": "everest-base-camp-trek",
    "destinationId": "33333333-3333-4333-8333-333333333333",
    "destinationName": "Kathmandu",
    "description": "A guided trekking package to Everest Base Camp.",
    "durationDays": 14,
    "basePrice": "1200.00",
    "currency": "USD",
    "status": "published",
    "isFeatured": true,
    "priority": 20,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_NOT_FOUND | Package was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/packages/{{package_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### POST /api/v1/packages

Description: Create a travel package and generate a unique slug from the title.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "title": "Everest Base Camp Trek",
  "destinationId": "33333333-3333-4333-8333-333333333333",
  "description": "A guided trekking package to Everest Base Camp.",
  "durationDays": 14,
  "basePrice": 1200,
  "currency": "USD",
  "status": "published",
  "isFeatured": true,
  "priority": 20,
  "isPublished": true
}
```

Validation Rules:

- title: required trimmed string, 1 to 255 characters.
- destinationId: UUID and must reference an existing destination.
- description: optional trimmed string.
- durationDays: optional integer, minimum 1.
- basePrice: positive number, coerced where possible.
- currency: optional 3-letter code, transformed to uppercase.
- status: optional enum draft, published, archived.
- isFeatured: optional boolean.
- priority: optional integer, minimum 0.
- isPublished: optional boolean.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | destinationId does not reference an existing destination. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "44444444-4444-4444-8444-444444444444",
    "title": "Everest Base Camp Trek",
    "slug": "everest-base-camp-trek",
    "destinationId": "33333333-3333-4333-8333-333333333333",
    "destinationName": "Kathmandu",
    "description": "A guided trekking package to Everest Base Camp.",
    "durationDays": 14,
    "basePrice": "1200.00",
    "currency": "USD",
    "status": "published",
    "isFeatured": true,
    "priority": 20,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | destinationId does not reference an existing destination. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/packages" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"title":"Everest Base Camp Trek","destinationId":"33333333-3333-4333-8333-333333333333","description":"A guided trekking package to Everest Base Camp.","durationDays":14,"basePrice":1200,"currency":"USD","status":"published","isFeatured":true,"priority":20,"isPublished":true}'
```

### PATCH /api/v1/packages/:id

Description: Update one or more package fields.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{package_id}} | Package UUID. |

Request Body:

```json
{
  "basePrice": 1250,
  "isFeatured": true,
  "priority": 25
}
```

Validation Rules:

- Same fields as create package, all optional.
- At least one field is required.
- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | destinationId does not reference an existing destination. |
| 404 | PACKAGE_NOT_FOUND | Package was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "44444444-4444-4444-8444-444444444444",
    "title": "Everest Base Camp Trek",
    "slug": "everest-base-camp-trek",
    "destinationId": "33333333-3333-4333-8333-333333333333",
    "destinationName": "Kathmandu",
    "description": "A guided trekking package to Everest Base Camp.",
    "durationDays": 14,
    "basePrice": "1250.00",
    "currency": "USD",
    "status": "published",
    "isFeatured": true,
    "priority": 25,
    "isPublished": true,
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | DESTINATION_NOT_FOUND | destinationId does not reference an existing destination. |
| 404 | PACKAGE_NOT_FOUND | Package was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X PATCH "{{base_url}}/api/v1/packages/{{package_id}}" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"basePrice":1250,"isFeatured":true,"priority":25}'
```

## Package Enquiries

Tenant package enquiry management.

### GET /api/v1/package-enquiries

Description: List package enquiries for the tenant using pagination.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| page | No | 1 | Page number, coerced to integer, minimum 1. |
| limit | No | 20 | Page size, coerced to integer, minimum 1, maximum 100. |
| status | No | open | Accepted values: open, closed, pending. Accepted by validation; current repository does not apply a status filter. |

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- page: optional integer, minimum 1.
- limit: optional integer, 1 to 100.
- status: optional enum open, closed, pending. Accepted by validation; not applied by the current repository.

Pagination Support: Yes. Defaults: page 1, limit 20. Maximum limit 100.

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "items": [
      {
        "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "customerId": "66666666-6666-4666-8666-666666666666",
        "packageId": "44444444-4444-4444-8444-444444444444",
        "packageTitle": "Everest Base Camp Trek",
        "name": "Jane Doe",
        "createdAt": "2026-05-28T10:00:00.000Z",
        "updatedAt": "2026-05-28T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/package-enquiries?page=1&limit=20&status=open" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/package-enquiries/:id

Description: Fetch one package enquiry by UUID.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{package_enquiry_id}} | Package enquiry UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "customerId": "66666666-6666-4666-8666-666666666666",
    "packageId": "44444444-4444-4444-8444-444444444444",
    "packageTitle": "Everest Base Camp Trek",
    "name": "Jane Doe",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/package-enquiries/{{package_enquiry_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### POST /api/v1/package-enquiries

Description: Create a package enquiry for a customer and package.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "customerId": "66666666-6666-4666-8666-666666666666",
  "packageId": "44444444-4444-4444-8444-444444444444",
  "name": "Jane Doe"
}
```

Validation Rules:

- customerId: UUID.
- packageId: UUID.
- name: required trimmed string, 1 to 255 characters.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 201 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "customerId": "66666666-6666-4666-8666-666666666666",
    "packageId": "44444444-4444-4444-8444-444444444444",
    "packageTitle": "Everest Base Camp Trek",
    "name": "Jane Doe",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X POST "{{base_url}}/api/v1/package-enquiries" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"customerId":"66666666-6666-4666-8666-666666666666","packageId":"44444444-4444-4444-8444-444444444444","name":"Jane Doe"}'
```

### PATCH /api/v1/package-enquiries/:id

Description: Update one or more package enquiry fields.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{package_enquiry_id}} | Package enquiry UUID. |

Request Body:

```json
{
  "name": "Jane A. Doe"
}
```

Validation Rules:

- Same fields as create package enquiry, all optional.
- At least one field is required.
- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    "customerId": "66666666-6666-4666-8666-666666666666",
    "packageId": "44444444-4444-4444-8444-444444444444",
    "packageTitle": "Everest Base Camp Trek",
    "name": "Jane A. Doe",
    "createdAt": "2026-05-28T10:00:00.000Z",
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X PATCH "{{base_url}}/api/v1/package-enquiries/{{package_enquiry_id}}" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"name":"Jane A. Doe"}'
```

### DELETE /api/v1/package-enquiries/:id

Description: Delete a package enquiry.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| id | Yes | {{package_enquiry_id}} | Package enquiry UUID. |

Request Body:

None.

Validation Rules:

- id path param: UUID.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "deleted": true
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | PACKAGE_ENQUIRY_NOT_FOUND | Package enquiry was not found. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X DELETE "{{base_url}}/api/v1/package-enquiries/{{package_enquiry_id}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

## Site Settings

Tenant storefront/site settings.

### GET /api/v1/site-settings

Description: Fetch the resolved tenant's default site settings row.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

None.

Validation Rules:

- No request validation middleware is applied.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "slug": "site-settings",
    "siteTitle": "Himalayan Tours",
    "siteDescription": "Curated treks and cultural tours across Nepal.",
    "heroSectionTitle": "Explore Nepal with local experts",
    "aboutUsContent": "We operate small-group travel experiences.",
    "contactUsTitle": "Talk to a travel specialist",
    "contactUsContent": "Send us your travel dates and preferences.",
    "heroSectionSubtitle": "Private and group departures available.",
    "contactEmail": "hello@himalayan-tours.com",
    "contactPhone": "+977-9800000000",
    "facebookUrl": "https://facebook.com/himalayantours",
    "twitterUrl": "https://twitter.com/himalayantours",
    "instagramUrl": "https://instagram.com/himalayantours",
    "tiktokUrl": "https://tiktok.com/@himalayantours",
    "address": "Thamel, Kathmandu, Nepal",
    "customerServed": 1200,
    "yearsOfExperience": 12,
    "totalGuides": 18,
    "totalDestinations": 24,
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Missing, invalid, or expired tenant access token.",
  "error_code": "UNAUTHORIZED",
  "status_code": 401
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/site-settings" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}"
```

### GET /api/v1/site-settings/:slug

Description: Fetch site settings by slug for the resolved tenant. This route resolves tenant context but does not require authentication in the current implementation.

Authentication Required: No.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: None. Tenant context is still required.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |

Query Parameters:

None.

Path Parameters:

| Name | Required | Example | Description |
| --- | --- | --- | --- |
| slug | Yes | {{site_settings_slug}} | Site settings slug, lowercase alphanumeric with hyphens. |

Request Body:

None.

Validation Rules:

- slug path param: lowercase letters/numbers/hyphens, 2 to 100 characters.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "slug": "site-settings",
    "siteTitle": "Himalayan Tours",
    "siteDescription": "Curated treks and cultural tours across Nepal.",
    "heroSectionTitle": "Explore Nepal with local experts",
    "aboutUsContent": "We operate small-group travel experiences.",
    "contactUsTitle": "Talk to a travel specialist",
    "contactUsContent": "Send us your travel dates and preferences.",
    "heroSectionSubtitle": "Private and group departures available.",
    "contactEmail": "hello@himalayan-tours.com",
    "contactPhone": "+977-9800000000",
    "facebookUrl": "https://facebook.com/himalayantours",
    "twitterUrl": "https://twitter.com/himalayantours",
    "instagramUrl": "https://instagram.com/himalayantours",
    "tiktokUrl": "https://tiktok.com/@himalayantours",
    "address": "Thamel, Kathmandu, Nepal",
    "customerServed": 1200,
    "yearsOfExperience": 12,
    "totalGuides": 18,
    "totalDestinations": 24,
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X GET "{{base_url}}/api/v1/site-settings/{{site_settings_slug}}" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}"
```

### PATCH /api/v1/site-settings

Description: Update one or more fields on the resolved tenant's default site settings row.

Authentication Required: Yes, tenant access token via Bearer token or `access_token` cookie.

Tenant Context: Required. Resolved from Host subdomain, `x-tenant-subdomain`, `x-tenant-id`, or authenticated token tenant claim.

Role Permissions: Any authenticated tenant user.

Headers:

| Name | Required | Value | Description |
| --- | --- | --- | --- |
| Accept | No | application/json | Response format. |
| Content-Type | Yes | application/json | JSON request body. |
| x-tenant-subdomain | No | {{tenant_subdomain}} | Recommended tenant context header for Postman/local development. |
| x-tenant-id | No | {{tenant_id}} | Alternative tenant context header. |
| Authorization | Yes | Bearer {{token}} | Tenant access token. `access_token` cookie is also accepted. |

Query Parameters:

None.

Path Parameters:

None.

Request Body:

```json
{
  "siteTitle": "Himalayan Tours",
  "siteDescription": "Curated treks and cultural tours across Nepal.",
  "contactEmail": "hello@himalayan-tours.com",
  "contactPhone": "+977-9800000000",
  "customerServed": 1200,
  "yearsOfExperience": 12
}
```

Validation Rules:

- All fields are optional, but at least one field is required.
- Text fields are trimmed.
- siteTitle, heroSectionTitle, contactUsTitle: max 255 characters.
- contactEmail: valid email.
- contactPhone: max 20 characters.
- facebookUrl, twitterUrl, instagramUrl, tiktokUrl: valid URLs.
- customerServed, yearsOfExperience, totalGuides, totalDestinations: integers, minimum 0.

Pagination Support: No

File Upload Details: None

Status Codes:

| Status | Code | Meaning |
| --- | --- | --- |
| 200 | SUCCESS | Successful response. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Success Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "slug": "site-settings",
    "siteTitle": "Himalayan Tours",
    "siteDescription": "Curated treks and cultural tours across Nepal.",
    "heroSectionTitle": "Explore Nepal with local experts",
    "aboutUsContent": "We operate small-group travel experiences.",
    "contactUsTitle": "Talk to a travel specialist",
    "contactUsContent": "Send us your travel dates and preferences.",
    "heroSectionSubtitle": "Private and group departures available.",
    "contactEmail": "hello@himalayan-tours.com",
    "contactPhone": "+977-9800000000",
    "facebookUrl": "https://facebook.com/himalayantours",
    "twitterUrl": "https://twitter.com/himalayantours",
    "instagramUrl": "https://instagram.com/himalayantours",
    "tiktokUrl": "https://tiktok.com/@himalayantours",
    "address": "Thamel, Kathmandu, Nepal",
    "customerServed": 1200,
    "yearsOfExperience": 12,
    "totalGuides": 18,
    "totalDestinations": 24,
    "updatedAt": "2026-05-28T10:00:00.000Z"
  }
}
```

Error Responses:

| Status | Error Code | When |
| --- | --- | --- |
| 400 | VALIDATION_ERROR | Request body, query, or path parameters fail Zod validation. |
| 401 | UNAUTHORIZED | Missing, invalid, or expired tenant access token. |
| 400 | TENANT_NOT_FOUND | Tenant context cannot be resolved from host or headers. |
| 404 | TENANT_NOT_FOUND | Tenant or agency does not exist. |
| 403 | TENANT_INACTIVE | Tenant exists but is not active. |
| 404 | NOT_FOUND | Site settings row does not exist. |
| 500 | DATABASE_ERROR | Unhandled server or database error. |

Example Error Body:

```json
{
  "success": false,
  "message": "Request body, query, or path parameters fail Zod validation.",
  "error_code": "VALIDATION_ERROR",
  "status_code": 400
}
```

curl Example:

```bash
curl -X PATCH "{{base_url}}/api/v1/site-settings" \
  -H "Content-Type: application/json" \
  -H "x-tenant-subdomain: {{tenant_subdomain}}" \
  -H "Authorization: Bearer {{token}}" \
  -d '{"siteTitle":"Himalayan Tours","siteDescription":"Curated treks and cultural tours across Nepal.","contactEmail":"hello@himalayan-tours.com","contactPhone":"+977-9800000000","customerServed":1200,"yearsOfExperience":12}'
```

