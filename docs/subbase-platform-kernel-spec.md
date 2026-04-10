# SubBase Platform Kernel Spec

## Purpose

This document freezes the platform primitives that must exist before feature work branches out across the product.

If this document conflicts with older schema or API ideas, engineering should follow this document for v1 kernel work.

## Kernel Principles

- One authenticated `users` table for every human actor.
- One canonical tenant model based on `organizations`.
- One canonical workspace context based on org slug in the route.
- One external-access model based on explicit grants.
- No implicit tenant selection from client payloads.
- No implicit GC access through leads or company relationships.

## Canonical Tables

These tables should exist before vertical feature modules are built.

### Identity and Tenancy

- `users`
- `organizations`
- `organization_memberships`
- `gc_companies`
- `gc_company_memberships`
- `invitations`

### Company and Project Core

- `company_profiles`
- `company_trades`
- `projects`
- `project_contacts`

### Files and External Access

- `files`
- `file_attachments`
- `access_grants`

### Billing, Integrations, and Audit

- `subscriptions`
- `organization_integrations`
- `activity_logs`

## Table Shape Guidance

### `users`

One row per authenticated human.

Recommended fields:

- `id`
- `auth_user_id`
- `email`
- `first_name`
- `last_name`
- `actor_kind`
- `status`
- `created_at`
- `updated_at`

### `organizations`

The subcontractor tenant.

Recommended fields:

- `id`
- `slug`
- `name`
- `status`
- `plan_tier`
- `created_at`
- `updated_at`

### `organization_memberships`

Internal access to an organization.

Recommended fields:

- `id`
- `organization_id`
- `user_id`
- `role`
- `status`
- `invited_by_user_id`
- `created_at`
- `updated_at`

Unique index:

- `(organization_id, user_id)`

### `gc_companies`

External GC company record.

Recommended fields:

- `id`
- `name`
- `website_url`
- `phone`
- `email`
- `created_at`
- `updated_at`

### `gc_company_memberships`

External affiliation between a `user` and a `gc_company`.

Recommended fields:

- `id`
- `gc_company_id`
- `user_id`
- `role`
- `status`
- `created_at`
- `updated_at`

Unique index:

- `(gc_company_id, user_id)`

### `invitations`

One invite model for both internal team invites and GC portal invites.

Recommended fields:

- `id`
- `invite_type`
- `email`
- `organization_id`
- `gc_company_id`
- `role_or_permission`
- `token_hash`
- `expires_at`
- `accepted_by_user_id`
- `created_by_user_id`
- `created_at`
- `accepted_at`
- `revoked_at`

### `company_profiles`

Canonical subcontractor company record. This is internal truth and public-profile source data.

Recommended fields:

- `id`
- `organization_id`
- `legal_name`
- `display_name`
- `dba_name`
- `description`
- `phone`
- `email`
- `website_url`
- `service_area_json`
- `license_summary`
- `insurance_summary`
- `marketplace_enabled`
- `created_at`
- `updated_at`

### `company_trades`

Normalized trade list per organization.

Recommended fields:

- `id`
- `organization_id`
- `trade_code`
- `trade_name`

### `projects`

First org-owned business entity.

Recommended fields:

- `id`
- `organization_id`
- `gc_company_id`
- `name`
- `slug`
- `status`
- `source`
- `project_address`
- `city`
- `state`
- `postal_code`
- `start_date`
- `end_date`
- `notes`
- `created_at`
- `updated_at`

### `project_contacts`

Project-level contacts. These are not auth identities.

Recommended fields:

- `id`
- `project_id`
- `name`
- `company_name`
- `email`
- `phone`
- `role`
- `is_gc_contact`
- `created_at`
- `updated_at`

### `files`

Storage metadata only.

Recommended fields:

- `id`
- `organization_id`
- `bucket`
- `storage_path`
- `file_name`
- `mime_type`
- `size_bytes`
- `uploaded_by_user_id`
- `created_at`

### `file_attachments`

Generic join from file to domain resource.

Recommended fields:

- `id`
- `organization_id`
- `file_id`
- `entity_type`
- `entity_id`
- `attachment_role`
- `created_by_user_id`
- `created_at`

### `access_grants`

One external access/share model.

Recommended fields:

- `id`
- `organization_id`
- `subject_type`
- `subject_id`
- `resource_type`
- `resource_id`
- `permission`
- `project_id`
- `granted_by_user_id`
- `expires_at`
- `revoked_at`
- `created_at`

Notes:

- `subject_type`: `user` or `gc_company`
- `resource_type`: `project`, `document`, or `invoice`
- `permission`: `view` or `status_update`
- Do not use a freeform status field. Derive active state from `expires_at` and `revoked_at`.

### `subscriptions`

Stripe state per organization.

Recommended fields:

- `id`
- `organization_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `status`
- `current_period_end`
- `created_at`
- `updated_at`

### `organization_integrations`

External integration state per organization.

Recommended fields:

- `id`
- `organization_id`
- `provider`
- `status`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `realm_id`
- `token_expires_at`
- `last_synced_at`
- `created_at`
- `updated_at`

### `activity_logs`

Audit trail for invites, grants, file access, and sensitive mutations.

Recommended fields:

- `id`
- `organization_id`
- `actor_type`
- `actor_id`
- `entity_type`
- `entity_id`
- `action`
- `metadata`
- `created_at`

## Workspace Context Strategy

Use org slug in the route as the canonical workspace context.

- Internal app routes: `/app/[orgSlug]/...`
- Internal API routes: `/api/orgs/:orgSlug/...`
- On each request, resolve `orgSlug` to `organization_id`.
- Validate membership server-side before any mutation or protected read.
- Attach `activeOrg` and `activeMembership` to request context in server code.
- Keep a `last_org_slug` cookie only for redirect convenience.
- Never use the cookie as authorization state.
- Never accept `organizationId` from the client for user-driven mutations.

Jobs, webhooks, and admin scripts should pass org by server-owned ID.

## Auth Model

Use one auth-backed identity model for all humans.

- All authenticated humans live in `users`.
- Supabase `auth.users` remains the identity provider.
- Internal access is granted through `organization_memberships`.
- External GC affiliation is granted through `gc_company_memberships`.
- Invites create pending access and become memberships or affiliations upon acceptance.

Engineering rule:

- A GC relationship or lead does not grant portal access by itself.

## External Access Model

Use `access_grants` as the only external access primitive.

- Sharing a resource creates a grant.
- Revoking a share updates the same grant.
- Expiration is handled through `expires_at`.
- Shared access is always explicit, never inherited by default.

Examples:

- Share one compliance document with one GC user.
- Share one invoice with status update permission.
- Share one project view without exposing every document or invoice under it.

## API Contracts To Freeze First

These routes should be treated as the kernel API surface.

- `GET /api/me`
- `POST /api/organizations`
- `GET /api/orgs/:orgSlug/context`
- `POST /api/invitations`
- `POST /api/invitations/accept`
- `POST /api/orgs/:orgSlug/access-grants`
- `PATCH /api/orgs/:orgSlug/access-grants/:grantId`
- `POST /api/orgs/:orgSlug/files`
- `POST /api/orgs/:orgSlug/files/:fileId/attachments`
- `GET /api/orgs/:orgSlug/company-profile`
- `PATCH /api/orgs/:orgSlug/company-profile`
- `GET /api/orgs/:orgSlug/projects`
- `POST /api/orgs/:orgSlug/projects`

## API Rules

- Error envelope stays normalized.
- List endpoints return `{ items, nextCursor? }`.
- Mutations never accept `organizationId` from the client.
- Permission checks run after org resolution and before mutation logic.
- Signed file URLs are issued only through a server endpoint that checks membership or `access_grant`.

## Resolved v1 Assumptions

Engineering should resolve current doc contradictions with these assumptions:

1. `company_profiles` is canonical. Marketplace-specific presentation fields can be separate later, but core company data should not be duplicated.
2. `users` is the only auth-backed human table. Do not create a separate auth root for `gc_users`.
3. `access_grants` replaces overlapping share concepts such as `document_shares` and GC portal grants.
4. Leads do not create portal access.
5. Sharing a project does not automatically expose all invoices or documents under it.
6. `payment_events` is not a kernel table for v1.

## Immediate Build Order

1. Create Prisma schema for the kernel tables.
2. Add request-context resolution for `orgSlug`.
3. Implement session resolution and membership lookup.
4. Add permission guards for org access and external grants.
5. Freeze the kernel API routes.
6. Only then start feature modules such as projects, crew, materials, compliance, invoices, and marketplace.
