# SubBase Implementation Plan

## Purpose

This document turns the v1 build contract and platform kernel into a concrete first implementation plan.

## Milestone 1

Goal: get a real internal workspace running with auth, tenancy, org bootstrap, company profile, and project CRUD.

Use `/workspace` as the internal route prefix for the first implementation pass.

### Backend Bootstrap

Create:

- `.env.example`
- `lib/env.ts`

Update:

- `package.json`

Add dependencies for:

- `prisma`
- `@prisma/client`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `stripe`
- `resend`
- `postgres`

### Database Foundation

Create:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/db/client.ts`
- `lib/db/organization-scope.ts`

First tables:

- `users`
- `organizations`
- `organization_memberships`
- `company_profiles`
- `gc_companies`
- `projects`
- `project_contacts`
- `subscriptions`

### Auth and Membership Plumbing

Create:

- `lib/auth/session.ts`
- `lib/auth/roles.ts`
- `lib/auth/memberships.ts`
- `middleware.ts` if route-level protection is useful

### API Primitives

Create:

- `lib/api/errors.ts`
- `lib/api/response.ts`
- `lib/api/route-guard.ts`
- `lib/validation/common.ts`

### Organization Bootstrap Flow

Create:

- `app/api/me/route.ts`
- `app/api/organizations/route.ts`
- `app/workspace/layout.tsx`
- `app/workspace/page.tsx`
- `app/workspace/onboarding/page.tsx`
- `components/workspace/create-organization-form.tsx`

### Company Profile CRUD

Create:

- `app/api/company-profile/route.ts`
- `lib/domain/profiles/queries.ts`
- `lib/domain/profiles/mutations.ts`
- `components/workspace/company-profile-form.tsx`

### Projects CRUD

Create:

- `app/api/projects/route.ts`
- `app/api/projects/[projectId]/route.ts`
- `lib/domain/projects/queries.ts`
- `lib/domain/projects/mutations.ts`
- `lib/domain/projects/schemas.ts`
- `app/workspace/projects/page.tsx`
- `app/workspace/projects/[projectId]/page.tsx`
- `components/projects/project-form.tsx`
- `components/projects/project-list.tsx`

### Workspace Shell

Create:

- `components/workspace/sidebar.tsx`
- `components/workspace/header.tsx`
- `components/workspace/empty-state.tsx`

## Milestone 2

Goal: add the first operational modules that make the product feel like SubBase instead of generic SaaS CRUD.

### Crew Scheduling

Extend:

- `prisma/schema.prisma`

Create:

- `lib/domain/crew/queries.ts`
- `lib/domain/crew/mutations.ts`
- `lib/domain/crew/schemas.ts`
- `app/api/crew-members/route.ts`
- `app/api/crew-assignments/route.ts`
- `app/api/crew-assignments/[assignmentId]/route.ts`
- `app/workspace/crew/page.tsx`
- `components/crew/assignment-form.tsx`

### Materials Tracking

Extend:

- `prisma/schema.prisma`

Create:

- `lib/domain/materials/queries.ts`
- `lib/domain/materials/mutations.ts`
- `app/api/material-orders/route.ts`
- `app/api/material-orders/[orderId]/route.ts`
- `app/api/material-orders/[orderId]/items/route.ts`
- `app/workspace/materials/page.tsx`
- `components/materials/order-form.tsx`

### File Storage and Compliance

Create:

- `lib/storage/supabase.ts`
- `lib/storage/files.ts`
- `app/api/files/upload-url/route.ts`
- `lib/domain/compliance/queries.ts`
- `lib/domain/compliance/mutations.ts`
- `app/api/compliance-documents/route.ts`
- `app/api/compliance-documents/[documentId]/share/route.ts`
- `app/workspace/compliance/page.tsx`
- `components/compliance/document-form.tsx`

### Dayboard v1

Create:

- `lib/domain/dayboard/service.ts`
- `app/api/dayboard/route.ts`
- `app/workspace/dayboard/page.tsx`
- `components/dayboard/summary-cards.tsx`
- `components/dayboard/crew-panel.tsx`
- `components/dayboard/material-risks-panel.tsx`
- `components/dayboard/compliance-panel.tsx`

### Activity and Audit Support

Create:

- `lib/domain/activity/log.ts`

Write activity logs from:

- org bootstrap
- compliance sharing
- project mutations
- crew mutations

## Critical Path

1. Add backend dependencies, env validation, and `.env.example`.
2. Create Prisma schema, first migration, and seed data.
3. Wire Supabase auth/session plus membership resolution.
4. Add shared API guards and normalized error utilities.
5. Build organization creation and company-profile onboarding.
6. Build project CRUD and workspace shell.
7. Demo the internal workspace with real auth and real org/project data.
8. Extend schema for crew, materials, files, and compliance.
9. Implement signed file upload flow.
10. Build Dayboard last because it depends on real operational data.

## Safe Parallel Work After Step 4

- Workspace shell and onboarding UI
- Project domain, routes, and pages
- Prisma seed and demo data
- Basic org and profile API contracts

## Smallest Internal Demo

Ship this first:

- authenticated user signs in
- user creates a workspace
- user fills in a company profile
- user creates projects
- user sees those projects in `/workspace/projects`

This proves:

- Supabase auth works
- multi-tenant org scoping works
- Prisma and DB plumbing work
- internal app shell exists
- the repo is now a product, not only a landing page

## Slightly Better Demo Without Major Scope Increase

Add a thin `/workspace/dayboard` that shows:

- project count
- active project count
- next upcoming project dates

That gives stakeholders something that feels like an operating dashboard without waiting on crew, materials, or compliance to be fully built.

## Recommended Start

Start by implementing Milestone 1 only. Do not start GC portal, marketplace matching, invoice UI, or QuickBooks flows until the workspace kernel is real and demoable.
