# SubBase Next Phase Swarm Brief

Status: canonical execution doc for the next swarm phase. Use this with `docs/subbase-current-state.md` and the build contract. Do not use the older implementation/spec docs as route or provider truth.

## Purpose

This document is the execution plan for the next SubBase build phase.

It is not a replacement for the v1 build contract. It translates the current repo state into a swarm-safe implementation plan with explicit ownership boundaries.

## Canonical Inputs

Use these sources in this order:

1. `docs/subbase-v1-build-contract.md`
2. `docs/subbase-current-state.md`
3. live code in `app/`, `lib/`, `components/`, and `prisma/`
4. this swarm brief

Treat these docs as reference-only unless they are updated:

- `docs/subbase-implementation-plan.md`
- `docs/subbase-technical-spec-v1.md`
- `docs/subbase-product-spec-v1.md`
- `docs/subbase-architecture-defaults-memo.md`
- `docs/subbase-platform-kernel-spec.md`

Reason: they still contain stale Supabase and route-shape assumptions that do not match the current repo.

## Current Repo Truth

What is actually shipped today:

- Neon Auth-backed workspace sign-in/onboarding
- Prisma + Postgres app data with org-scoped API routes under `app/api/orgs/[orgSlug]/*`
- workspace auth/bootstrap
- company profile CRUD
- project CRUD
- QuickBooks connection and token lifecycle scaffolding

Shared contract note:

- New code should write canonical uppercase enum-like values for workspace roles, active-status flags, project statuses/sources, and access-grant keys.
- Shared auth/membership/access-grant helpers are tolerant of legacy lowercase rows and legacy role aliases such as `owner` and `member`.
- Wave 1 does not require a new shared migration. Existing `Invitation`, `ProjectContact`, `File`, `FileAttachment`, and `AccessGrant` tables are the frozen primitives for the first feature workers.

What is not yet shipped as a real product surface:

- project contacts workflow
- internal user invites and role management UI
- compliance docs
- invoice visibility
- crew scheduling
- materials tracking
- Dayboard
- marketplace
- GC portal

## Phase Goal

The next phase is not "finish all of v1."

The next phase is:

1. freeze current platform truth
2. finish the thin layers adjacent to the kernel
3. ship one narrow, cash-adjacent vertical
4. leave broader module expansion for the following wave

## Wave Plan

### Wave 0: Truth Freeze

Land first:

- provider and route truth cleanup
- shared schema reservations
- shared auth and role semantics
- seed strategy
- one current-state status doc if needed

### Wave 1: Kernel Completion

Land next:

- project contacts and GC contact association
- internal user invites and role management
- compliance docs and explicit sharing

### Wave 2: First Sellable Wedge

Land after Wave 1 contracts are stable:

- invoice visibility
- QuickBooks read/sync expansion
- follow-up state and note tracking

### Wave 3: Broader Ops Expansion

Land later:

- crew scheduling
- materials tracking
- Dayboard derived from stable module queries
- leads
- marketplace
- GC portal

## Operating Rules

### Single-Owner Files

Only the `kernel-platform` owner may edit:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`
- `lib/auth/roles.ts`
- `lib/auth/memberships.ts`
- `lib/api/route-guard.ts`
- shared env/config docs

Only the `workspace-shell-dayboard` owner may edit:

- `components/workspace/sidebar.tsx`
- `app/workspace/[orgSlug]/layout.tsx`
- `app/workspace/[orgSlug]/page.tsx`

### General Rules

- Vertical workers own their own domain folder, routes, pages, and components.
- Vertical workers do not add nav items directly.
- Vertical workers do not change auth semantics directly.
- Vertical workers do not create migrations directly unless the `kernel-platform` owner explicitly reserves and lands the schema contract first.
- Shared UI text should stay honest about what exists today.
- Build contract wins when scope questions come up.

## Worker Topology

Use 6 active lanes:

1. `kernel-platform`
2. `projects-contacts`
3. `members-invites`
4. `compliance-files`
5. `invoices-ar`
6. `workspace-shell-dayboard`

Do not open `crew`, `materials`, `marketplace`, or `gc-portal` lanes yet unless the first 6 lanes are stable.

## Lane Definitions

### 1. kernel-platform

Mission:
Freeze the shared platform contracts so the vertical workers can build without fighting over schema, auth, or route guards.

Owns:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`
- `lib/auth/roles.ts`
- `lib/auth/memberships.ts`
- `lib/api/route-guard.ts`
- `app/api/orgs/[orgSlug]/context/route.ts`
- provider/config docs

Deliverables:

- provider truth aligned to Neon/Auth plus current Postgres usage
- reserved schema changes for Wave 1 and Wave 2
- stable role and membership semantics for internal users
- explicit access-grant semantics for shared records
- seed data strategy that supports demos and smoke testing

Out of scope:

- feature-specific page work
- nav changes
- module-specific components

Verification:

- `npm run lint`
- `DATABASE_URL='' npm run build`
- seed still generates

### 2. projects-contacts

Mission:
Finish the `Projects and Contacts` part of the contract and make projects the real anchor record for downstream modules.

Owns:

- `lib/domain/projects/*`
- `app/api/orgs/[orgSlug]/projects/route.ts`
- `app/api/orgs/[orgSlug]/projects/[projectId]/route.ts`
- `app/workspace/[orgSlug]/projects/page.tsx`
- `app/workspace/[orgSlug]/projects/[projectId]/page.tsx`
- `components/projects/*`

Deliverables:

- `ProjectContact` CRUD
- GC contact association on projects
- project detail page with usable contact management
- API/domain exports that other modules can depend on

Out of scope:

- global workspace shell changes
- invitation flows
- compliance uploads

Verification:

- create project
- add contact
- edit contact
- delete contact
- project detail renders correct contact state

### 3. members-invites

Mission:
Finish the missing workspace/auth surface required by the contract: internal user invites and minimal role assignment.

Owns:

- new member/invitation domain code
- new member/invitation routes
- workspace settings member-management pages/components

Suggested file targets:

- `lib/domain/members/*`
- `app/api/orgs/[orgSlug]/members/*`
- `app/api/orgs/[orgSlug]/invitations/*`
- `app/workspace/[orgSlug]/settings/members/*`
- `components/workspace/members/*`

Deliverables:

- invite internal user
- assign `admin`, `manager`, or `foreman`
- list active members and pending invites
- revoke or deactivate minimal flow

Out of scope:

- GC portal users
- external invitation workflows beyond what is needed for later primitives
- custom permissions

Verification:

- invite lifecycle works
- role assignment persists
- access control respects assigned role

### 4. compliance-files

Mission:
Turn existing file and grant primitives into the first real compliance workflow.

Owns:

- `lib/storage/*`
- `lib/domain/compliance/*`
- compliance routes
- compliance pages/components
- document attachment/share flows

Suggested file targets:

- `lib/storage/files.ts`
- `lib/storage/uploads.ts`
- `lib/domain/compliance/*`
- `app/api/orgs/[orgSlug]/compliance/*`
- `app/api/orgs/[orgSlug]/files/*`
- `app/workspace/[orgSlug]/compliance/*`
- `components/compliance/*`

Deliverables:

- upload file metadata
- attach to company or project
- category, issue date, expiration date
- explicit share history or share action built on grants

Out of scope:

- OCR
- automated compliance rules
- marketplace asset system

Verification:

- upload works
- attachment linkage works
- company/project scoping works
- only explicitly shared records are externally visible

### 5. invoices-ar

Mission:
Build the first cash-adjacent wedge on top of QuickBooks connectivity.

Owns:

- `lib/domain/invoices/*`
- invoice routes/pages/components
- QuickBooks read/sync expansion
- invoice follow-up state

Suggested file targets:

- `lib/domain/invoices/*`
- `app/api/orgs/[orgSlug]/invoices/*`
- `app/workspace/[orgSlug]/invoices/*`
- `components/invoices/*`
- `lib/domain/integrations/quickbooks.ts` only with `kernel-platform` coordination

Deliverables:

- invoice import/listing from QuickBooks
- amount, customer, due date, balance, accounting status
- internal follow-up notes/status
- explicit share state for GC users

Out of scope:

- payment collection
- profitability reporting
- autonomous outbound sending

Verification:

- QuickBooks refresh path still works
- invoice sync/import works
- invoice list renders stable state
- follow-up state persists

### 6. workspace-shell-dayboard

Mission:
Keep the workspace coherent while modules land, then add a read-only operational overview once real module data exists.

Owns:

- `components/workspace/sidebar.tsx`
- `app/workspace/[orgSlug]/layout.tsx`
- `app/workspace/[orgSlug]/page.tsx`
- later `dayboard` read model/page

Deliverables:

- add nav items only after routes are stable
- keep overview honest during expansion
- build read-only Dayboard only after enough module queries exist

Out of scope:

- defining module schema
- feature-domain mutations

Verification:

- nav reflects only real routes
- overview remains derived and read-only
- no duplicate source of truth introduced

## Sequencing

### Gate 1

Start `kernel-platform` first.

Exit criteria:

- shared contracts frozen
- docs/stack truth clarified
- schema reservations agreed

### Gate 2

Start `projects-contacts`.

Exit criteria:

- projects are complete enough to anchor later modules

### Gate 3

Start `members-invites` and `compliance-files` in parallel.

Exit criteria:

- internal workspace management exists
- first explicit sharing workflow exists

### Gate 4

Start `invoices-ar`.

Exit criteria:

- first cash-adjacent vertical is real

### Gate 5

Start `workspace-shell-dayboard`.

Exit criteria:

- nav and overview catch up to real module surface

## Handoff Contract

Every lane must hand back:

- route contract
- domain exports
- UI entrypoints
- verification notes
- any unresolved dependency on another lane

The handoff should be explicit enough that the shell/Dayboard lane can consume query functions without reaching into another lane's page code.

## Kickoff Briefs

These can be pasted directly into subagent tasks.

### Brief: kernel-platform

You own the shared platform layer for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.ts`
- `lib/auth/roles.ts`
- `lib/auth/memberships.ts`
- `lib/api/route-guard.ts`
- `app/api/orgs/[orgSlug]/context/route.ts`
- docs that define current stack truth

Your job:

- align provider and route truth with the current Neon/Auth and org-scoped codebase
- reserve and land shared schema changes needed by `projects-contacts`, `members-invites`, `compliance-files`, and `invoices-ar`
- define stable role, membership, and access-grant semantics
- keep seed/demo support coherent

Rules:

- you are not alone in the codebase
- do not revert others' changes
- do not build feature pages unless required to unblock contracts
- coordinate any change to shared contracts carefully

Done means:

- shared contracts are stable
- docs no longer point workers at stale provider assumptions
- lint and build pass

### Brief: projects-contacts

You own the projects vertical for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `lib/domain/projects/*`
- `app/api/orgs/[orgSlug]/projects/route.ts`
- `app/api/orgs/[orgSlug]/projects/[projectId]/route.ts`
- `app/workspace/[orgSlug]/projects/page.tsx`
- `app/workspace/[orgSlug]/projects/[projectId]/page.tsx`
- `components/projects/*`

Your job:

- ship real `ProjectContact` CRUD
- support GC contact association on projects
- make the project detail page complete enough to serve as the anchor entity for later modules

Rules:

- you are not alone in the codebase
- do not touch shared auth, nav, or schema unless the platform owner asks you to
- do not revert others' changes

Done means:

- users can manage contacts from the project experience
- domain exports are stable for downstream modules
- lint and build pass

### Brief: members-invites

You own internal member management for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `lib/domain/members/*`
- `app/api/orgs/[orgSlug]/members/*`
- `app/api/orgs/[orgSlug]/invitations/*`
- `app/workspace/[orgSlug]/settings/members/*`
- `components/workspace/members/*`

Your job:

- ship internal user invites
- ship minimal role assignment using `admin`, `manager`, and `foreman`
- show active members and pending invites

Rules:

- you are not alone in the codebase
- do not redefine role semantics yourself; consume the platform contract
- do not edit nav/layout files
- do not revert others' changes

Done means:

- internal workspace membership can be managed from the app
- lint and build pass

### Brief: compliance-files

You own compliance docs and file attachment flows for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `lib/storage/*`
- `lib/domain/compliance/*`
- `app/api/orgs/[orgSlug]/files/*`
- `app/api/orgs/[orgSlug]/compliance/*`
- `app/workspace/[orgSlug]/compliance/*`
- `components/compliance/*`

Your job:

- ship file metadata and attachment flows
- support company-level and project-level compliance docs
- ship explicit share behavior based on existing grant primitives

Rules:

- you are not alone in the codebase
- do not redefine grant semantics; consume platform contracts
- do not edit workspace shell files
- do not revert others' changes

Done means:

- upload, attach, categorize, and share flows work
- visibility stays explicit-share-only
- lint and build pass

### Brief: invoices-ar

You own invoice visibility and AR follow-up groundwork for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `lib/domain/invoices/*`
- `app/api/orgs/[orgSlug]/invoices/*`
- `app/workspace/[orgSlug]/invoices/*`
- `components/invoices/*`

Shared file requiring coordination:

- `lib/domain/integrations/quickbooks.ts`

Your job:

- expand QuickBooks integration from connection-only to invoice visibility
- ship imported invoice list and detail state
- ship follow-up note or status tracking

Rules:

- you are not alone in the codebase
- coordinate with the platform owner before changing shared QuickBooks contracts
- do not edit nav/layout files
- do not revert others' changes

Done means:

- invoice visibility is real
- follow-up state persists
- lint and build pass

### Brief: workspace-shell-dayboard

You own workspace navigation and the later derived overview layer for the next SubBase phase in `/Users/carsoncruz/SubBase-work-in-progress`.

Owned files:

- `components/workspace/sidebar.tsx`
- `app/workspace/[orgSlug]/layout.tsx`
- `app/workspace/[orgSlug]/page.tsx`
- later `dayboard` files

Your job:

- keep nav and overview aligned with the real shipped module surface
- add module entry points only after routes stabilize
- build a read-only Dayboard later from stable query contracts

Rules:

- you are not alone in the codebase
- do not invent module behavior yourself
- consume stable query/domain exports from other lanes
- do not revert others' changes

Done means:

- workspace shell stays coherent during expansion
- overview stays derived and honest
- lint and build pass

## Recommendation

If starting immediately, open only these lanes first:

1. `kernel-platform`
2. `projects-contacts`

Then open:

3. `members-invites`
4. `compliance-files`

Then open:

5. `invoices-ar`

Start `workspace-shell-dayboard` only when at least two vertical lanes have stable route and query contracts.
