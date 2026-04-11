# SubBase Architecture Defaults Memo

## Purpose

This memo sets the default engineering decisions for SubBase v1.

Use these defaults unless a later written decision explicitly overrides them.
If the product spec and technical spec are ambiguous, this memo wins for implementation.

## 1. Infra and Runtime Assumptions

### Deployment Model

- SubBase ships as a single Next.js App Router application.
- Deploy to Vercel.
- Do not split the frontend, API, jobs, or integrations into separate repos or services for v1.

### Runtime Defaults

- Use the Node.js runtime for all server code.
- Do not use the Edge runtime for auth, Prisma, Stripe, QuickBooks, signed URL generation, or cron handlers.
- All integration code lives in server-only modules and is called from route handlers, server actions, or cron entrypoints.

### Data Plane

- Use one Supabase project per environment as the system of record for:
  - Postgres
  - Auth
  - Storage
- Prisma is the application ORM and connects directly to the Supabase-hosted Postgres database.
- Do not provision a second Postgres provider for v1.
- Use both a pooled connection string and a direct connection string:
  - `DATABASE_URL` for app traffic
  - `DIRECT_URL` for Prisma migrations and admin tasks

### Environment Model

- Support exactly three runtime environments:
  - `local`
  - `preview`
  - `production`
- `preview` is non-production and may share a single non-prod Supabase project and other sandbox accounts.
- `production` never shares secrets, webhook endpoints, billing data, or QuickBooks credentials with `local` or `preview`.

### Auth Identity Model

- Supabase Auth is the identity provider for all human users:
  - internal subcontractor users
  - GC portal users
- `auth.users` is the identity source of truth.
- App tables model roles and access:
  - `users`
  - `organization_memberships`
  - `gc_company_memberships`
  - `access_grants`
- GC users are never organization members.
- GC access is granted only through explicit grants or invitations.
- Do not create a separate auth-backed `gc_users` identity root in v1.

### Storage Model

- Use Supabase Storage.
- Default all uploaded business documents to private buckets.
- Use a separate public bucket only for intentionally public marketplace assets.
- Recommended bucket defaults:
  - `compliance-docs` private
  - `project-files` private
  - `company-assets-public` public

### Billing Model

- Use Stripe Checkout for subscription start.
- One subscription per organization.
- Subscription state is persisted in the app database.
- Stripe is the billing system of record for subscription status.
- SubBase does not build a custom billing engine in v1.

### Email Model

- Use Resend for all app-owned outbound mail.
- Supabase Auth emails should be sent through a Resend-backed SMTP configuration so the product has one delivery path and one sending domain.
- Do not build a generic in-app notifications system in v1.

### Accounting Integration Model

- QuickBooks Online is read-only into SubBase for v1.
- Sync scope is limited to:
  - customer references
  - invoices
  - payment-relevant invoice fields
- Do not write invoices back to QuickBooks in v1.
- Do not sync payroll, ledger data, or unrelated accounting objects in v1.

### Jobs and Scheduling Model

- Use Vercel Cron for scheduled entrypoints.
- Persist all job state in Postgres.
- Do not add Redis, Temporal, Inngest, or a separate worker service in the first implementation.
- A manual “Sync now” action must reuse the same application service as the scheduled job path.

### Observability Model

- Emit structured JSON logs to stdout.
- Every request, webhook, and job run gets a request or run ID.
- Persist minimal audit logs for security-sensitive actions.
- Sentry or equivalent can be added later, but the code should be structured so it can be inserted without refactoring core modules.

## 2. Minimum Hardening and Defaults

### Env and Config Defaults

- Commit a `.env.example` file before backend work begins.
- Add a typed `env` module that validates required variables with `zod` at process start.
- Never read secrets directly throughout the app. Import them from one validated env module.
- Add `APP_ENV=local|preview|production`.
- Minimum required env vars:
  - `APP_ENV`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_STARTER`
  - `STRIPE_PRICE_PROFESSIONAL`
  - `STRIPE_PRICE_BUSINESS`
  - `INTUIT_CLIENT_ID`
  - `INTUIT_CLIENT_SECRET`
  - `INTUIT_REDIRECT_URI`
  - `INTUIT_ENVIRONMENT`
  - `ENCRYPTION_KEY`
  - `LOG_LEVEL`
- Non-production always uses:
  - Stripe test mode
  - QuickBooks sandbox
  - non-production Supabase
  - non-production webhook endpoints
- Disable TypeScript build bypasses before backend work starts.

### Upload Defaults

- All uploads are initiated server-side after auth and authorization checks.
- Never allow the client to choose the final storage path.
- Default allowed MIME types:
  - `application/pdf`
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Default rejected file types:
  - archives
  - executables
  - scripts
  - office macros
- Default size limits:
  - 10 MB for documents
  - 5 MB for images
- Default storage path pattern:
  - `org/{organizationId}/{entityType}/{entityId}/{uuid}.{ext}`
- Always persist file metadata in `files` before treating the upload as available in the product.
- Use signed URLs for private files.
- Default signed URL TTL:
  - 10 minutes
- Marketplace-public images may be served from the public asset bucket.
- Compliance and project files are never public URLs.
- If malware scanning is not implemented in v1, keep the MIME allowlist narrow and buckets private.

### Webhook Defaults

- Implement Stripe webhooks in v1.
- Defer QuickBooks webhooks.
- Webhook handlers must run on the Node.js runtime.
- Verify signatures before processing provider events.
- Persist each inbound event to a `webhook_events` table before business handling.
- Minimum `webhook_events` fields:
  - `id`
  - `provider`
  - `event_id`
  - `signature_verified`
  - `payload_hash`
  - `status`
  - `received_at`
  - `processed_at`
  - `error_message`
- Enforce uniqueness on `(provider, event_id)`.
- Handlers must be idempotent.
- Duplicate or replayed events should be accepted and safely ignored after lookup.
- Route handlers must not trust event ordering.

### Job Defaults

- Only these scheduled jobs are required initially:
  - `quickbooks_sync`
  - `compliance_expiry`
- `invoice_follow_up_queue` is deferred.
- `lead_notification_job` is deferred unless inline delivery proves unreliable.
- Every job run is persisted to `job_runs`.
- Minimum `job_runs` fields:
  - `id`
  - `job_name`
  - `scope_type`
  - `scope_id`
  - `status`
  - `attempt_count`
  - `lease_until`
  - `started_at`
  - `finished_at`
  - `cursor_json`
  - `error_message`
- Jobs operate per organization, not as one global long-running sweep.
- Each org-level run must acquire a lease before work begins.
- A second run for the same org must no-op if an active lease exists.
- Manual retries must reuse the same service code as cron.
- Job writes must be idempotent.
- QuickBooks sync must never overwrite SubBase-owned fields such as:
  - `gc_status`
  - follow-up notes
  - project links

### Tenant Isolation Defaults

- All database access is server-side only.
- The browser never receives privileged database or storage credentials.
- Every tenant-owned table must contain `organization_id`.
- All reads and writes must go through organization-scoped services or repositories.
- Each service receives a `TenantContext` containing:
  - `actorType`
  - `actorId`
  - `organizationId`
  - `role`
- Never trust a client-supplied `organization_id` by itself.
- Resolve tenant context from the authenticated session plus server-side membership lookup.
- GC users are authorized by explicit access grants, not by organization membership.
- Add composite indexes and uniqueness constraints that include `organization_id` where appropriate.
- Do not rely on ad hoc route-level checks scattered through handlers.
- Full database RLS can be deferred if all access remains server-side and the service layer is disciplined from the start.

### Audit and Logging Defaults

- Persist audit logs for:
  - user invitation and acceptance
  - organization membership changes
  - GC access grant create/revoke
  - file share actions
  - integration connect/disconnect
  - manual QuickBooks sync trigger
  - Stripe subscription state changes
- Log request IDs, actor IDs, organization IDs, and provider event IDs where applicable.
- Never log raw access tokens, refresh tokens, or full webhook payloads containing secrets.

### Integration Secret Defaults

- Store QuickBooks OAuth tokens encrypted at rest.
- Persist a key version with encrypted integration secrets so rotation is possible later.
- `organization_integrations` should include:
  - `provider`
  - `status`
  - encrypted token fields
  - `realm_id`
  - `token_expires_at`
  - `last_synced_at`
  - `key_version`
- Keep integration reads and writes in server-only modules.

## 3. Safe Deferrals

The following can be deferred without painting the product into a corner:

- QuickBooks webhooks
- QuickBooks write-back
- sync of non-invoice accounting objects
- Redis or dedicated queue infrastructure
- separate worker service or microservice split
- full database RLS rollout
- generic notifications center
- in-product activity inbox beyond minimal audit logs
- malware scanning, if uploads remain limited to private PDF and image files
- GC-side invoice acknowledgements and other portal mutations beyond simple shared views
- marketplace ranking, matching, and bid workflow logic
- search infrastructure outside normal Postgres indexes
- supplier or vendor API integrations

These deferrals are safe because the data model already leaves room for them:

- explicit integration tables
- explicit grant tables
- explicit file metadata
- explicit job and webhook event tables
- explicit external ID fields

## 4. Stack Decisions Where the Current Docs Are Ambiguous

### Postgres vs Supabase

Decision:

- Use Supabase-hosted Postgres as the primary database.
- Prisma connects to that database.

Do not:

- run a second standalone Postgres provider for v1
- split auth/storage onto Supabase while keeping the main app database elsewhere

### Supabase Auth vs GC User Model

Decision:

- Use one Supabase Auth system for all human identities.
- Distinguish internal users and GC users in app tables and authorization logic.

Do not:

- invent a separate auth system for GC users
- treat GC users as organization members

### Supabase Email vs Resend

Decision:

- Resend is the outbound email provider for the product.
- Supabase-auth emails should still be routed through Resend SMTP.

Do not:

- run two unrelated outbound email providers for auth and product email in v1

### Tenant Enforcement Strategy

Decision:

- Start with a server-only scoped service layer as the primary tenant enforcement mechanism.
- Keep schema shape compatible with later RLS.

Do not:

- mix partial RLS and ad hoc route checks in a way that makes failures hard to reason about

### Job Infrastructure

Decision:

- Use Postgres-backed job state plus Vercel Cron for v1.

Do not:

- add a queue platform before the current scheduled workload proves it is needed

### Upload Access Pattern

Decision:

- Use private storage plus signed URLs for sensitive files.
- Use a separate public bucket only for intentional marketplace assets.

Do not:

- make compliance or project files public by default

## 5. Engineering Start Order

Build in this order:

1. `.env.example`, validated env module, Node runtime defaults, typecheck and lint guardrails
2. Prisma schema and migrations
3. auth/session utilities
4. tenant context and scoped repository layer
5. organizations, memberships, users, GC users, grants
6. file metadata plus signed-upload and signed-download flow
7. Stripe subscription tables and webhook skeleton
8. QuickBooks integration tables and sync skeleton
9. core product CRUD modules
10. scheduled jobs

## Final Position

The realistic v1 stack decision is:

- Next.js on Vercel
- Node.js runtime for server work
- Supabase for Postgres, Auth, and Storage
- Prisma for database access and migrations
- Stripe Checkout plus webhooks for billing
- Resend for outbound email
- QuickBooks Online as a narrow read-only integration
- Postgres-backed job state plus Vercel Cron

That is the fastest stack that still gives SubBase defensible defaults for tenant isolation, uploads, billing, jobs, and integrations.
