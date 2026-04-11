# SubBase Technical Spec v1

## Document Purpose

This document defines the proposed technical implementation for SubBase v1. It is intended to align engineering work, clarify integration scope, and provide enough specificity to estimate and build the initial product.

This spec assumes the product direction defined in [subbase-product-spec-v1.md](/Users/carsoncruz/SubBase/docs/subbase-product-spec-v1.md).

## Technical Summary

SubBase v1 should be built as a multi-tenant Next.js application with:

- Postgres as the primary database
- Supabase Auth for authentication
- Supabase Storage for file uploads
- Prisma for schema, migrations, and typed database access
- Stripe for billing
- Resend for transactional email
- QuickBooks Online for invoice and payment sync

The system has three user-facing surfaces:

- Internal subcontractor application
- Public marketplace
- Limited GC portal

It also has four backend concerns:

- API and business logic
- Data persistence
- File/document storage
- Background jobs and syncs

## Recommended Stack

### Application

- `Next.js`
- `React`
- `TypeScript`

### Backend and Persistence

- `Postgres`
- `Prisma`
- `Supabase`

### Integrations

- `Stripe`
- `Resend`
- `QuickBooks Online`

### Deployment

- `Vercel`

### Libraries To Add

Suggested additions to the current repo:

- `prisma`
- `@prisma/client`
- `postgres`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `stripe`
- `resend`

Optional but likely useful:

- `date-fns-tz`
- `nanoid`
- `pino` or equivalent logger
- `zod` is already present and should be used for validation

## High-Level Architecture

### Runtime Model

The application should remain a single web app for v1. Do not split into separate frontend and backend repos.

Recommended structure:

- `app/` for routes and pages
- `app/api/` for route handlers
- `lib/db/` for database and query access
- `lib/auth/` for auth/session/role logic
- `lib/integrations/` for Stripe, Resend, QuickBooks
- `lib/storage/` for document/file handling
- `lib/domain/` for business logic by module
- `jobs/` or `lib/jobs/` for scheduled and async workflows

### Logical Domains

Split the backend into these domain modules:

- `auth`
- `organizations`
- `profiles`
- `projects`
- `crews`
- `materials`
- `invoices`
- `compliance`
- `marketplace`
- `gc-portal`
- `billing`
- `integrations`

Each module should contain:

- query functions
- mutations/services
- zod schemas
- authorization checks

## Multi-Tenancy Model

SubBase is multi-tenant by subcontractor workspace.

Primary tenant boundary:

- `organization_id`

All internal data should be scoped by `organization_id`, either directly or through a parent entity. Every query should enforce organization scoping server-side.

Examples:

- projects belong to an organization
- crew members belong to an organization
- invoices belong to an organization
- compliance docs belong to an organization
- marketplace profile belongs to an organization

GC portal data is also scoped, but access is narrower and based on invitations or explicit shares.

## Authentication and Authorization

### Authentication

Use Supabase Auth for:

- email/password or magic-link authentication
- user sessions
- invite flows

### Internal Roles

- `owner`
- `admin`
- `ops_manager`
- `pm`
- `foreman`
- `member`

### External Roles

- `gc_user`

### Authorization Rules

Internal users:

- access only their organization's records
- permissions determined by membership role

GC users:

- never join the subcontractor organization's membership table
- gain access only through project/company shares, lead relationships, or explicit invitations

This separation matters. GC users are external collaborators, not workspace members.

### Recommended Tables For Auth

- `users`
- `organization_memberships`
- `gc_users`
- `gc_portal_access_grants`

`users` should map to Supabase user IDs.

## Core Data Model

The schema below is the recommended v1 shape. It is normalized enough to support growth without overengineering.

### 1. users

Purpose:

- Internal user identity linked to auth provider

Fields:

- `id uuid pk`
- `auth_user_id uuid unique`
- `email text unique`
- `first_name text`
- `last_name text`
- `created_at timestamptz`
- `updated_at timestamptz`

### 2. organizations

Purpose:

- Subcontractor workspace / tenant

Fields:

- `id uuid pk`
- `name text`
- `slug text unique`
- `status text`
- `plan_tier text`
- `created_at timestamptz`
- `updated_at timestamptz`

### 3. organization_memberships

Purpose:

- User membership in a subcontractor workspace

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `user_id uuid fk`
- `role text`
- `status text`
- `invited_by_user_id uuid fk nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique index:

- `(organization_id, user_id)`

### 4. company_profiles

Purpose:

- Business details used internally and for public marketplace

Fields:

- `id uuid pk`
- `organization_id uuid fk unique`
- `legal_name text`
- `display_name text`
- `description text`
- `phone text`
- `email text`
- `website_url text`
- `service_area_json jsonb`
- `license_summary text`
- `insurance_summary text`
- `marketplace_enabled boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### 5. company_trades

Purpose:

- Many-to-many trade categories for filtering/search

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `trade_code text`
- `trade_name text`

Index:

- `(organization_id, trade_code)`

### 6. gc_companies

Purpose:

- General contractor companies associated with leads or projects

Fields:

- `id uuid pk`
- `name text`
- `website_url text nullable`
- `phone text nullable`
- `email text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

### 7. gc_users

Purpose:

- External portal users representing GC-side people

Fields:

- `id uuid pk`
- `gc_company_id uuid fk`
- `email text unique`
- `first_name text`
- `last_name text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### 8. projects

Purpose:

- Internal project/job record

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `gc_company_id uuid fk nullable`
- `name text`
- `slug text`
- `status text`
- `source text`
- `project_address text`
- `city text`
- `state text`
- `postal_code text`
- `start_date date nullable`
- `end_date date nullable`
- `notes text nullable`
- `external_source text nullable`
- `external_project_id text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Unique index:

- `(organization_id, slug)`

Suggested `source` values:

- `manual`
- `marketplace`
- `repeat_gc`
- `referral`

Suggested `status` values:

- `lead`
- `bidding`
- `awarded`
- `active`
- `on_hold`
- `completed`
- `cancelled`

### 9. project_contacts

Purpose:

- Contact people related to a project

Fields:

- `id uuid pk`
- `project_id uuid fk`
- `name text`
- `company_name text`
- `email text nullable`
- `phone text nullable`
- `role text nullable`
- `is_gc_contact boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

### 10. crew_members

Purpose:

- Internal crew/person roster

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `first_name text`
- `last_name text`
- `phone text nullable`
- `trade text nullable`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `status`:

- `active`
- `inactive`

### 11. crew_assignments

Purpose:

- Day-level crew scheduling

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `project_id uuid fk`
- `crew_member_id uuid fk`
- `assignment_date date`
- `start_time time nullable`
- `end_time time nullable`
- `status text`
- `notes text nullable`
- `created_by_user_id uuid fk`
- `created_at timestamptz`
- `updated_at timestamptz`

Indexes:

- `(organization_id, assignment_date)`
- `(project_id, assignment_date)`
- `(crew_member_id, assignment_date)`

Suggested `status`:

- `scheduled`
- `confirmed`
- `completed`
- `cancelled`

### 12. vendors

Purpose:

- Materials vendors or suppliers

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `name text`
- `contact_name text nullable`
- `email text nullable`
- `phone text nullable`
- `notes text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

### 13. material_orders

Purpose:

- Order-level record for materials needed on a project

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `project_id uuid fk`
- `vendor_id uuid fk nullable`
- `title text`
- `status text`
- `quoted_lead_time_days integer nullable`
- `order_by_date date nullable`
- `requested_delivery_date date nullable`
- `promised_delivery_date date nullable`
- `confirmed_at timestamptz nullable`
- `notes text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `status`:

- `draft`
- `needs_order`
- `ordered`
- `confirmed`
- `delivered`
- `delayed`
- `cancelled`

### 14. material_items

Purpose:

- Line items within a material order

Fields:

- `id uuid pk`
- `material_order_id uuid fk`
- `description text`
- `quantity numeric nullable`
- `unit text nullable`
- `notes text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

### 15. invoices

Purpose:

- Invoice records visible in SubBase

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `project_id uuid fk nullable`
- `gc_company_id uuid fk nullable`
- `invoice_number text`
- `issue_date date nullable`
- `due_date date nullable`
- `currency text default 'USD'`
- `amount_total numeric(12,2)`
- `amount_paid numeric(12,2) default 0`
- `balance_due numeric(12,2)`
- `accounting_status text`
- `gc_status text`
- `follow_up_status text`
- `last_follow_up_at timestamptz nullable`
- `quickbooks_customer_id text nullable`
- `quickbooks_invoice_id text nullable`
- `quickbooks_sync_state text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Indexes:

- `(organization_id, due_date)`
- `(organization_id, accounting_status)`
- `(organization_id, gc_status)`
- `(quickbooks_invoice_id)`

Suggested `accounting_status`:

- `draft`
- `sent`
- `partially_paid`
- `paid`
- `void`

Suggested `gc_status`:

- `unknown`
- `received`
- `approved`
- `scheduled`
- `disputed`

Suggested `follow_up_status`:

- `none`
- `queued`
- `sent`
- `replied`

### 16. invoice_follow_ups

Purpose:

- Internal follow-up history for invoice collection activity

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `invoice_id uuid fk`
- `created_by_user_id uuid fk`
- `channel text`
- `summary text`
- `outcome text nullable`
- `created_at timestamptz`

Suggested `channel`:

- `email`
- `phone`
- `portal`
- `manual_note`

### 17. compliance_documents

Purpose:

- Compliance records at company or project level

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `project_id uuid fk nullable`
- `document_type text`
- `title text`
- `status text`
- `issue_date date nullable`
- `expiration_date date nullable`
- `file_id uuid fk nullable`
- `notes text nullable`
- `created_by_user_id uuid fk`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `status`:

- `active`
- `expiring`
- `expired`
- `replaced`

Suggested `document_type`:

- `w9`
- `contractor_license`
- `coi`
- `workers_comp`
- `safety_cert`
- `trade_cert`
- `agreement`
- `other`

### 18. document_shares

Purpose:

- Tracks which docs were shared with which GC users or projects

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `compliance_document_id uuid fk`
- `project_id uuid fk nullable`
- `gc_company_id uuid fk nullable`
- `gc_user_id uuid fk nullable`
- `shared_by_user_id uuid fk`
- `channel text`
- `created_at timestamptz`

### 19. files

Purpose:

- Metadata for uploaded files stored in Supabase Storage

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `bucket text`
- `storage_path text`
- `file_name text`
- `mime_type text`
- `size_bytes bigint`
- `uploaded_by_user_id uuid fk`
- `created_at timestamptz`

### 20. marketplace_profiles

Purpose:

- Public-facing searchable company profile

Fields:

- `id uuid pk`
- `organization_id uuid fk unique`
- `slug text unique`
- `headline text`
- `description text`
- `is_public boolean`
- `service_area_json jsonb`
- `portfolio_json jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

### 21. marketplace_leads

Purpose:

- Lead submissions from public profile pages

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `marketplace_profile_id uuid fk`
- `gc_company_id uuid fk nullable`
- `submitted_by_name text`
- `submitted_by_email text`
- `submitted_by_phone text nullable`
- `company_name text nullable`
- `message text`
- `status text`
- `project_name text nullable`
- `project_location text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Suggested `status`:

- `new`
- `contacted`
- `qualified`
- `quoted`
- `won`
- `lost`
- `archived`

### 22. gc_portal_access_grants

Purpose:

- Explicit resource access for GC portal users

Fields:

- `id uuid pk`
- `gc_user_id uuid fk`
- `organization_id uuid fk`
- `project_id uuid fk nullable`
- `grant_type text`
- `resource_id uuid nullable`
- `created_by_user_id uuid fk`
- `created_at timestamptz`

Examples of `grant_type`:

- `project_view`
- `document_view`
- `invoice_view`
- `invoice_status_update`

### 23. activity_logs

Purpose:

- Basic audit and activity history

Fields:

- `id uuid pk`
- `organization_id uuid fk`
- `actor_type text`
- `actor_id uuid nullable`
- `entity_type text`
- `entity_id uuid`
- `action text`
- `metadata jsonb`
- `created_at timestamptz`

## API Design

The API should be REST-style for v1. Use route handlers in `app/api`.

All write endpoints should:

- validate input with zod
- check session
- verify tenant scope
- perform authorization per role
- return normalized errors

### Error Shape

Recommended API error response:

```json
{
  "error": {
    "code": "forbidden",
    "message": "You do not have access to this resource."
  }
}
```

### Auth and Session Endpoints

Most auth can remain Supabase-native. App API should expose only supporting session/context endpoints.

`GET /api/me`

Returns:

```json
{
  "user": {
    "id": "uuid",
    "email": "ops@subco.com"
  },
  "memberships": [
    {
      "organizationId": "uuid",
      "role": "owner"
    }
  ]
}
```

### Organization Endpoints

`POST /api/organizations`

Creates organization and initial company profile.

Request:

```json
{
  "name": "Atlas Drywall",
  "slug": "atlas-drywall"
}
```

Response:

```json
{
  "organizationId": "uuid"
}
```

### Project Endpoints

`GET /api/projects`

Query params:

- `status`
- `search`
- `page`

`POST /api/projects`

Request:

```json
{
  "name": "Riverside Tower",
  "status": "active",
  "source": "repeat_gc",
  "gcCompanyId": "uuid",
  "projectAddress": "123 Main St, San Diego, CA"
}
```

`GET /api/projects/:projectId`

Returns project summary, contacts, crew assignments preview, materials preview, invoices preview, docs preview.

`PATCH /api/projects/:projectId`

### Dayboard Endpoint

`GET /api/dayboard?date=2026-04-04`

Response shape:

```json
{
  "date": "2026-04-04",
  "crewAssignments": [],
  "materialRisks": [],
  "overdueInvoices": [],
  "expiringDocuments": [],
  "newLeads": []
}
```

The Dayboard should be assembled from underlying tables. Do not persist dayboard rows.

### Crew Scheduling Endpoints

`GET /api/crew-assignments?date=2026-04-04`

`POST /api/crew-assignments`

Request:

```json
{
  "projectId": "uuid",
  "crewMemberId": "uuid",
  "assignmentDate": "2026-04-04",
  "startTime": "07:00",
  "notes": "Bring lift key"
}
```

`PATCH /api/crew-assignments/:assignmentId`

### Materials Endpoints

`GET /api/material-orders?projectId=uuid`

`POST /api/material-orders`

Request:

```json
{
  "projectId": "uuid",
  "vendorId": "uuid",
  "title": "Level 3 drywall package",
  "quotedLeadTimeDays": 14,
  "requestedDeliveryDate": "2026-04-18"
}
```

`POST /api/material-orders/:orderId/items`

`PATCH /api/material-orders/:orderId`

Backend rule:

- if `quotedLeadTimeDays` and `requestedDeliveryDate` are present, compute `orderByDate` unless explicitly overridden

### Invoice Endpoints

`GET /api/invoices`

Query params:

- `status`
- `projectId`
- `gcStatus`
- `overdue=true`

`GET /api/invoices/:invoiceId`

`POST /api/invoices/:invoiceId/follow-ups`

Request:

```json
{
  "channel": "email",
  "summary": "Sent reminder to AP contact",
  "outcome": "Awaiting reply"
}
```

`POST /api/invoices/:invoiceId/gc-status`

This endpoint is for GC portal use only.

Request:

```json
{
  "gcStatus": "scheduled",
  "note": "Included in next payment run"
}
```

Important rule:

- This endpoint updates `gc_status` only
- It must never overwrite accounting status fields from QuickBooks sync

### Compliance Endpoints

`GET /api/compliance-documents`

`POST /api/compliance-documents`

Request:

```json
{
  "projectId": "uuid",
  "documentType": "coi",
  "title": "COI 2026",
  "issueDate": "2026-01-01",
  "expirationDate": "2027-01-01",
  "fileId": "uuid"
}
```

`POST /api/compliance-documents/:documentId/share`

Request:

```json
{
  "projectId": "uuid",
  "gcCompanyId": "uuid",
  "gcUserId": "uuid"
}
```

### Marketplace Endpoints

`GET /api/marketplace/search`

Query params:

- `trade`
- `city`
- `state`
- `q`

`GET /api/marketplace/profiles/:slug`

Public endpoint.

`POST /api/marketplace/leads`

Public endpoint with rate limiting and spam protection.

Request:

```json
{
  "profileSlug": "atlas-drywall",
  "submittedByName": "Jane GC",
  "submittedByEmail": "jane@gc.com",
  "companyName": "WestBuild",
  "message": "Need drywall bid for tenant improvement in San Diego."
}
```

### Billing Endpoints

`POST /api/billing/checkout`

Creates Stripe Checkout session.

`POST /api/webhooks/stripe`

Handles subscription state changes.

### Integration Endpoints

`GET /api/integrations/quickbooks/connect`

Starts OAuth flow.

`GET /api/integrations/quickbooks/callback`

Completes OAuth flow and stores tokens securely.

`POST /api/webhooks/quickbooks`

Optional for later. Not required for initial one-way polling sync.

## File Storage Design

Use Supabase Storage for uploaded documents.

Recommended buckets:

- `compliance-docs`
- `project-files`
- `company-assets`

File metadata must still be stored in the `files` table.

Never rely on raw object paths as your primary data record.

Access pattern:

- internal users get signed URLs after auth check
- GC users get signed URLs only if a share exists
- public marketplace assets may be public or cached separately if intentionally exposed

## QuickBooks Integration Design

### Scope

MVP should support:

- connect QuickBooks Online account
- sync customer/company references
- sync invoices
- sync payment-relevant invoice fields

Do not support in MVP:

- writing invoices back to QuickBooks
- syncing all accounting objects
- payroll
- full ledger replication

### Token Storage

Store QuickBooks credentials in a dedicated integration table:

- `organization_integrations`

Suggested fields:

- `id uuid pk`
- `organization_id uuid fk`
- `provider text`
- `status text`
- `access_token_encrypted text`
- `refresh_token_encrypted text`
- `realm_id text`
- `token_expires_at timestamptz`
- `last_synced_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Tokens should be encrypted at rest.

### Sync Strategy

Use polling on a schedule for v1.

Recommended job cadence:

- invoice sync every 1 to 4 hours
- manual "sync now" action in UI

Sync flow:

1. fetch active QuickBooks integration for organization
2. refresh token if needed
3. fetch invoices/customers changed since last sync
4. upsert invoice rows by `quickbooks_invoice_id`
5. recompute balance and accounting status
6. preserve internal fields like `gc_status` and follow-up history

### Reconciliation Rules

QuickBooks-owned fields:

- invoice number
- amount
- due date
- payment state
- customer reference

SubBase-owned fields:

- linked project
- gc status
- follow-up notes
- operational priority

## Stripe Billing Design

Use Stripe Checkout for v1 subscriptions.

Recommended subscription model:

- one subscription per organization
- price IDs mapped to `starter`, `professional`, `business`

Store Stripe references in:

- `subscriptions`

Suggested fields:

- `id uuid pk`
- `organization_id uuid fk unique`
- `stripe_customer_id text unique`
- `stripe_subscription_id text unique nullable`
- `stripe_price_id text nullable`
- `status text`
- `current_period_end timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

Webhook events to handle:

- checkout completion
- subscription created
- subscription updated
- subscription cancelled
- invoice payment failed

## Email / Notification Design

Use Resend for transactional mail.

Email use cases:

- auth and invite emails
- marketplace lead notifications
- compliance share notifications
- invoice reminder notifications
- GC portal invitation emails

Do not build a generic notifications engine in v1.

Start with:

- email only
- activity feed in product later

## Background Jobs

Jobs can run via Vercel cron or a simple scheduled worker pattern.

### Initial Jobs

`quickbooks_sync_job`

- runs for connected organizations
- syncs invoices/customers

`compliance_expiry_job`

- identifies docs expiring within configured threshold

`invoice_follow_up_queue_job`

- identifies overdue invoices and marks them for follow-up priority

`lead_notification_job`

- sends email notification for new marketplace leads if async processing is needed

### Job Design Rules

- jobs must be idempotent
- jobs must log failures and retry safely
- long-running syncs should process per organization

## Security Requirements

### General

- all sensitive mutations happen server-side
- no direct trust of client-supplied organization IDs without validation
- all file access checked before URL generation
- tokens and secrets never exposed to client

### Tenant Isolation

- every query must scope by organization
- every mutation must validate membership in target organization

### External Access

- GC portal resources must require an access grant
- public marketplace endpoints must be rate-limited
- lead forms should include spam protection

### Secret Handling

- store integration secrets in environment variables
- store QuickBooks tokens encrypted in database
- use webhook signature verification for Stripe

## Observability

At minimum, add:

- structured server logging
- request IDs
- integration sync logs
- job failure logs

Optional but recommended later:

- Sentry or equivalent error tracking

## Suggested Environment Variables

```bash
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_BUSINESS=

INTUIT_CLIENT_ID=
INTUIT_CLIENT_SECRET=
INTUIT_REDIRECT_URI=
INTUIT_ENVIRONMENT=

ENCRYPTION_KEY=
```

`ENCRYPTION_KEY` should be used for stored integration token encryption.

## Suggested Route Structure

Potential route layout:

- `/app`
- `/app/dayboard`
- `/app/projects`
- `/app/projects/[projectId]`
- `/app/crew`
- `/app/materials`
- `/app/invoices`
- `/app/compliance`
- `/app/leads`
- `/app/settings`
- `/app/settings/billing`
- `/app/settings/integrations`
- `/gc`
- `/gc/projects/[projectId]`
- `/gc/invoices/[invoiceId]`
- `/marketplace`
- `/marketplace/[slug]`

## Suggested Implementation Order

### Phase 1: Foundation

- install backend dependencies
- set up Supabase
- add auth/session plumbing
- create Prisma schema and migrations
- implement organizations and memberships

### Phase 2: Core CRUD

- company profiles
- projects
- crew members and assignments
- compliance docs
- files storage integration

### Phase 3: Revenue and External Workflows

- Stripe billing
- marketplace profiles
- lead capture
- GC portal grants

### Phase 4: Accounting Workflow

- QuickBooks OAuth
- integration token storage
- invoice sync
- invoice board and follow-ups
- GC status update path

### Phase 5: Operational Polish

- dayboard aggregation endpoint
- material alerts
- expiry alerts
- background jobs

## Technical Risks

### 1. QuickBooks Complexity

OAuth, token refresh, and data reconciliation will introduce the most backend complexity in v1.

Mitigation:

- keep sync one-way
- keep invoice mapping narrow
- avoid accounting write-back initially

### 2. GC Portal Scope Creep

GC portal can easily become a second product if access rules are not constrained.

Mitigation:

- explicit access-grant model
- narrow resource types
- no internal workspace views

### 3. Document Security

Compliance and insurance files are sensitive.

Mitigation:

- signed URLs only
- strict access checks
- share logs

### 4. Marketplace Value Timing

Marketplace may not drive value immediately at launch.

Mitigation:

- keep it lightweight
- avoid overbuilding ranking/matching
- treat it as growth layer, not main MVP dependency

## Deliverables For Engineering Start

Before implementation begins, the following artifacts should exist:

- Prisma schema
- migration plan
- `.env.example`
- auth/session utility layer
- base API error/validation utilities
- organization-scoped query helpers
- QuickBooks integration design notes
- Stripe webhook handler outline

## Final Technical Position

The technically coherent v1 of SubBase is:

- a sub-first multi-tenant web app
- backed by Postgres
- with Supabase for auth and storage
- with Stripe for SaaS billing
- with Resend for transactional email
- with one-way QuickBooks invoice sync
- with a narrow GC portal and simple marketplace

That architecture is realistic for an MVP, consistent with the product promise, and avoids the major traps of over-integrating too early.
