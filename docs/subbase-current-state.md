# SubBase Current State

Status: canonical current-state note for the live repo as of the first swarm wave. Use this for stack truth and shared platform contracts.

## Stack Truth

- Auth provider: Neon Auth
- App data layer: Prisma against Postgres
- Internal workspace routing: `app/workspace/[orgSlug]/*`
- Internal API routing: `app/api/orgs/[orgSlug]/*`

Older docs that still describe Supabase or flat `/api/*` contracts are reference-only until rewritten.

## Shipped Surface

What is actually implemented today:

- workspace sign-in and onboarding
- organization bootstrap
- company profile CRUD
- project CRUD
- QuickBooks OAuth connection and token lifecycle scaffolding

What is not yet a real shipped module:

- project contacts workflow
- internal member/invite management UI
- compliance documents
- invoice persistence and follow-up state
- crew scheduling
- materials tracking
- Dayboard
- marketplace
- GC portal

## Invoice Readiness State

The workspace now has an invoice-readiness surface at `/workspace/[orgSlug]/invoices`.

That surface can show:

- QuickBooks connection state
- integration status
- token expiry
- last sync timestamp if present
- an optional read-only QuickBooks preview when a connected workspace can safely hydrate it live

It does not yet provide durable invoice visibility or follow-up workflows.

The minimum shared contract for real invoice sync is:

- a canonical invoice table keyed by `organization_id` plus external invoice id
- QuickBooks sync cursor and job ownership
- stored customer, amount, balance, due date, and accounting status
- stored internal follow-up status and notes
- stored share state and GC acknowledgement state

## Shared Platform Contract

### Canonical role model

Internal workspace roles are:

- `ADMIN`
- `MANAGER`
- `FOREMAN`

Legacy stored aliases are still accepted by shared helpers:

- `OWNER` resolves to `ADMIN`
- `MEMBER` resolves to `FOREMAN`

### Canonical active-state rule

Shared membership and grant checks treat active-style values case-insensitively so older lowercase rows still work. New writes should use uppercase enum-like values for:

- membership roles and statuses
- project statuses and sources
- access-grant subject/resource/permission keys

### Wave 1 schema freeze

No shared migration is required to start the first feature workers. These existing tables are the frozen primitives for Wave 1:

- `Invitation`
- `ProjectContact`
- `File`
- `FileAttachment`
- `AccessGrant`

If a later lane needs new shared tables for invoice sync or jobs, that should come back through the `kernel-platform` owner as a separate schema reservation.
