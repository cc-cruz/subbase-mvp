# SubBase Product Spec v1

## Document Purpose

This document translates the current positioning deck into a practical product specification for review. It defines what SubBase is, who it serves, what the MVP should include, which integrations matter, and what should be deferred.

This is a working product spec, not a finalized contract. It should be reviewed and corrected by the founder or domain expert before engineering execution.


## Product Summary

SubBase is a multi-tenant software platform built primarily for subcontractors. Its purpose is to give subcontractors one operating system for running jobs, crews, documents, invoices, and business visibility across multiple projects.

SubBase also includes two limited external surfaces:

- A public marketplace where general contractors can discover subcontractors.
- A lightweight GC portal where invited GC users can view specific shared information from a subcontractor.

SubBase is not general construction management software. It is subcontractor operations software with selective GC-facing collaboration features.

## Core Problem

Subcontractors are underserved by existing construction software:

- General-contractor platforms are built for GCs, not subcontractors.
- Subcontractors often operate across multiple jobs with fragmented tools.
- Scheduling, documents, payments, compliance, and job visibility live in separate systems or spreadsheets.
- Subcontractors often lack a system of record for their own business operations.
- GCs have no easy way to discover, vet, and re-engage quality subcontractors in one place.

## Product Vision

SubBase should become the operating system a subcontractor opens every morning to answer:

- Where are my crews today?
- Which jobs are at risk due to materials or missing docs?
- What invoices are outstanding and what is the current payment status?
- Which compliance items are about to expire?
- Which leads, bid opportunities, or GC requests need attention?

## Product Positioning

Primary customer:

- Subcontractor companies with 2 to 50 employees
- Specialty trades such as electrical, plumbing, HVAC, framing, drywall, concrete, roofing, and similar
- Companies running multiple active projects at once

Secondary customer:

- General contractors using the marketplace to discover subcontractors
- GC staff who need shared documents, bid responses, or payment-status coordination

The product is sub-first. GC access exists to support subcontractor workflows, not to replace GC software.

## Definitions

- `Sub`: subcontractor
- `GC`: general contractor
- `Workspace`: a subcontractor company's internal account
- `Project`: a job the subcontractor is working on
- `Dayboard`: the main operational dashboard summarizing the current state of jobs, crews, materials, invoices, and compliance

## Product Principles

- Subcontractor-first: internal workflows are optimized for the subcontractor business, not the GC
- Practical over perfect: the product should solve painful daily workflows before it attempts advanced automation
- Shared, not exposed: GCs only see what a subcontractor intentionally shares
- Source-of-truth separation: accounting truth comes from QuickBooks, operational truth comes from SubBase, external confirmation comes from GC interactions
- Marketplace as growth layer: marketplace should complement the operating system, not become the entire product

## Users and Roles

### Internal Subcontractor Roles

`Owner/Admin`

- Manages billing, workspace settings, company profile, integrations, users, and permissions

`Operations/Office Manager`

- Manages projects, compliance docs, invoices, payment follow-up, documents, and lead intake

`Project Manager`

- Manages project-level schedules, materials, bids, contacts, and coordination

`Foreman`

- Views crew assignments, materials status, job notes, and daily project updates

`Field User`

- Limited access for future use cases such as schedule view, task acknowledgement, or optional attendance

### External Roles

`GC User`

- Limited invited access to marketplace interactions, shared docs, selected project details, payment updates, and future bid requests

`Public Marketplace Visitor`

- Anonymous user browsing subcontractor profiles and submitting lead forms

## Product Scope

### In Scope for MVP

- Multi-tenant subcontractor workspace
- User accounts and role-based access control
- Company profile and service profile
- Project and contact management
- Dayboard dashboard
- Crew scheduling
- Materials tracking with manual lead time logic
- Invoice and payment visibility
- QuickBooks Online integration for accounting sync
- Compliance document storage and sharing
- Public marketplace profile
- Marketplace lead capture
- Lightweight GC portal for shared workflows

### Explicitly Out of Scope for MVP

- Procore integration
- Full vendor or supplier API integrations
- Automatic purchasing workflows
- Hard GPS attendance enforcement
- Native mobile app
- Full bid matching engine
- Bidirectional QuickBooks sync across all accounting entities
- Payroll
- Estimating system replacement
- Field productivity tracking beyond simple scheduling and notes

## High-Level Product Architecture

SubBase should be implemented as a web application with the following surfaces:

- Internal subcontractor app
- Public marketplace pages
- GC portal pages
- API/backend services
- Database and file storage
- Background jobs for syncs, reminders, and expiry alerts

Conceptually, the system separates into:

- `Operations Core`: projects, crews, materials, invoices, compliance, activity
- `External Collaboration`: marketplace, leads, shared docs, GC confirmation flows
- `Integrations`: QuickBooks sync, email delivery, billing

## Functional Modules

### 1. Workspace, Authentication, and Access Control

Purpose:

- Give each subcontractor company an isolated workspace with multiple users and controlled permissions

Requirements:

- Email/password or magic-link sign-in
- Workspace creation flow
- Invite team members
- Role-based access control
- Subscription-aware workspace settings
- Support multiple users under one subcontractor company

Key permissions:

- Admin can manage billing, integrations, and users
- Internal staff can access workspace features based on role
- GC users can only access explicitly shared or invited resources

### 2. Company Profile

Purpose:

- Store the subcontractor's identity, trades, coverage area, qualifications, and marketplace information

Requirements:

- Company legal/business name
- DBA name if applicable
- Trade categories
- License information
- Insurance information
- Service area
- About/description
- Portfolio highlights
- Contact channels
- Marketplace visibility toggle

This profile should power both internal records and public marketplace display.

### 3. Projects and Contacts

Purpose:

- Give subcontractors a clear internal record of every active and historical project

Requirements:

- Create and manage projects
- Associate projects with GC company and contacts
- Store project address, start/end dates, status, and notes
- Attach project files and compliance shares
- Track whether a project came from marketplace, referral, repeat GC, or manual entry

Suggested project statuses:

- `lead`
- `bidding`
- `awarded`
- `active`
- `on_hold`
- `completed`
- `cancelled`

### 4. Dayboard Dashboard

Purpose:

- Provide a single operational view of current business activity

Primary sections:

- Today's crew assignments
- Material risk alerts
- Outstanding invoices and payment follow-up priorities
- Expiring compliance docs
- New leads and GC requests

Requirements:

- Cross-project summary view
- Drill-down links into underlying records
- Filters by date, project, and priority
- Alert states for overdue or expiring items

The Dayboard is an aggregate view. It should not be its own source of truth.

### 5. Crew Scheduling

Purpose:

- Help subcontractors assign people to jobs and know where teams are supposed to be

Requirements:

- Create crew members
- Assign crew members or crews to projects by date
- Store shift or call time
- Support notes such as scope, location, or materials to bring
- Show conflicts or unassigned jobs

Nice-to-have later:

- Recurring assignments
- Foreman acknowledgement
- Mobile schedule view

### 6. Materials Tracking

Purpose:

- Prevent avoidable delays by surfacing order-by dates and unconfirmed deliveries

MVP approach:

- No supplier API dependency
- Manual data entry supported by simple logic

Requirements:

- Track material item, vendor, quantity, and notes
- Store quoted lead time
- Calculate or store order-by date
- Track requested date, promised delivery date, and confirmation state
- Flag risks such as overdue order, missing confirmation, late delivery

Suggested statuses:

- `draft`
- `needs_order`
- `ordered`
- `confirmed`
- `delivered`
- `delayed`
- `cancelled`

### 7. Invoice and Payment Visibility

Purpose:

- Give subcontractors a better picture of cash flow and payment follow-up

Source of truth model:

- Accounting data originates from QuickBooks Online
- SubBase adds operational annotations and GC coordination

Requirements:

- Ingest invoices from QuickBooks Online
- Show invoice amount, customer, due date, balance, and accounting status
- Log internal follow-ups
- Allow GC status updates on shared invoices
- Prioritize overdue or high-value invoices

Recommended status model:

- `accounting_status`: `draft`, `sent`, `partially_paid`, `paid`, `void`
- `gc_status`: `unknown`, `received`, `approved`, `scheduled`, `disputed`
- `follow_up_status`: `none`, `queued`, `sent`, `replied`

Important note:

GC confirmation should not overwrite accounting truth. It should exist alongside it.

### 8. Compliance Documents

Purpose:

- Reduce manual chasing of required documents and make sharing easy

MVP document categories:

- W-9
- Contractor license
- Certificate of insurance
- Workers' compensation proof
- Safety certifications
- Trade-specific certifications
- Signed agreements and supporting docs

Requirements:

- Upload and store documents
- Track issue and expiration dates
- Assign documents at company or project level
- Share selected docs with GC users
- Record share/send history
- Alert on upcoming expirations

### 9. Marketplace

Purpose:

- Create a free public profile system where GCs can discover subcontractors

MVP scope:

- Searchable public company profiles
- Trade filtering
- Service area filtering
- License/certification highlights
- Portfolio/project highlights
- Lead form submission

Not in MVP:

- Automated ranking engine
- Bid distribution network
- Full matching intelligence

The system should still be built with the data model needed for those later features.

### 10. GC Portal

Purpose:

- Give general contractors a limited space to interact with a subcontractor

MVP capabilities:

- Secure login by invitation
- View shared company/project documents
- Submit or manage leads
- View selected invoice/payment updates if shared
- Provide invoice-related status acknowledgements

Non-goals for GC portal:

- Full project management
- Crew management
- Access to subcontractor internal financials or margins
- Admin-level workspace control

### 11. Leads and Future Bid Infrastructure

Purpose:

- Capture marketplace demand now and support bid workflows later

MVP requirements:

- Public lead form
- Lead routing to subcontractor workspace
- Lead status tracking
- Notes and contact handling

Suggested statuses:

- `new`
- `contacted`
- `qualified`
- `quoted`
- `won`
- `lost`
- `archived`

Future expansion:

- Bid request objects
- Bid response workflow
- Multi-sub invite system
- Request matching

## Core User Flows

### Flow A: New Subcontractor Onboarding

1. User creates workspace
2. User enters company profile
3. User invites team members
4. User optionally connects QuickBooks
5. User uploads initial compliance docs
6. User creates first projects
7. User publishes marketplace profile if desired

### Flow B: Daily Operations

1. Office user opens Dayboard
2. Reviews today's crew assignments
3. Reviews materials at risk
4. Reviews overdue invoices
5. Reviews expiring compliance docs
6. Updates projects or sends follow-ups

### Flow C: Invoice Follow-Up

1. QuickBooks sync imports invoice data
2. Dayboard flags overdue invoices
3. User logs follow-up activity or sends reminder
4. GC user optionally acknowledges status via portal
5. Invoice remains tied to QuickBooks payment truth

### Flow D: Compliance Sharing

1. User uploads or updates company/project docs
2. User shares docs to a specific GC or project
3. GC views docs in portal
4. Share log is retained for reference

### Flow E: Marketplace Lead Capture

1. GC or public visitor finds subcontractor profile
2. Visitor submits lead form
3. Lead enters subcontractor workspace
4. User qualifies and follows up
5. Lead can later convert into a project or bid

## Integration Strategy

### Required in MVP

`QuickBooks Online`

- Purpose: invoice and payment visibility
- Direction: one-way sync into SubBase for MVP
- Sync targets: customers, invoices, balances, due dates, payment states

`Transactional Email`

- Purpose: login links, invites, lead notifications, compliance sharing, reminders

`Billing`

- Purpose: SaaS subscription management for paid plans

### Deferred Until Later

`Procore`

- Useful later for project metadata or shared project context
- Not required for MVP and likely complex due to GC-owned accounts and permission issues

`Vendor or Supplier APIs`

- Not required for MVP
- Manual materials workflow is sufficient initially

`GPS Attendance`

- Not required for MVP
- Too much product and mobile complexity without a dedicated attendance strategy

## Recommended Technology Stack

This is a practical stack recommendation for fast execution:

- Frontend: Next.js
- Backend: Next.js server routes and server actions where appropriate
- Database: Postgres
- ORM: Prisma
- Auth: Supabase Auth
- Storage: Supabase Storage
- Hosting: Vercel
- Email: Resend
- Billing: Stripe
- Accounting integration: QuickBooks Online
- Jobs/cron: platform cron or lightweight scheduled jobs

## Required External Accounts and API Credentials

### 1. Supabase

Purpose:

- Postgres database
- Authentication
- File storage

Accounts needed:

- One Supabase account
- One Supabase project

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

### 2. Vercel

Purpose:

- Deployment
- Environment variable management
- Preview environments

Accounts needed:

- One Vercel account
- One linked Vercel project

### 3. Resend

Purpose:

- Transactional email delivery

Accounts needed:

- One Resend account
- Verified sending domain

Environment variables:

- `RESEND_API_KEY`

### 4. Stripe

Purpose:

- Subscription billing

Accounts needed:

- One Stripe account

Environment variables:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 5. Intuit Developer / QuickBooks Online

Purpose:

- QuickBooks Online OAuth and API access

Accounts needed:

- One Intuit developer account
- One QuickBooks app in developer portal
- Sandbox company for testing

Environment variables:

- `INTUIT_CLIENT_ID`
- `INTUIT_CLIENT_SECRET`
- `INTUIT_REDIRECT_URI`
- `INTUIT_ENVIRONMENT`

### 6. Domain / DNS Access

Purpose:

- Custom domain for app
- DNS verification for email

Accounts needed:

- Access to domain registrar or DNS provider

## Data Model Summary

The product should be modeled around these core entities:

- `organizations`
- `users`
- `memberships`
- `subscriptions`
- `company_profiles`
- `projects`
- `gc_companies`
- `contacts`
- `crew_members`
- `crew_assignments`
- `material_orders`
- `material_items`
- `vendors`
- `invoices`
- `payment_events`
- `invoice_follow_ups`
- `compliance_documents`
- `document_shares`
- `files`
- `marketplace_profiles`
- `marketplace_leads`
- `activity_logs`

Schema design should account for future external IDs such as:

- `quickbooks_customer_id`
- `quickbooks_invoice_id`
- `procore_project_id`

Even if Procore is deferred, the schema should leave room for it.

## Non-Functional Requirements

- Multi-tenant data isolation between subcontractor workspaces
- Role-based access control
- Auditability for document shares and payment follow-ups
- Secure storage for uploaded documents
- Reasonable search/filter performance on projects, invoices, docs, and leads
- Basic observability and error tracking
- Reliable integration retry logic for QuickBooks sync jobs

## MVP Success Criteria

The MVP is successful if a subcontractor can:

- Create a workspace and onboard their team
- Track active projects in one place
- Assign crews by day
- Track material risk manually
- View invoices and payment status with QuickBooks sync
- Upload and share compliance docs with GCs
- Publish a profile in the marketplace
- Receive and manage leads

The MVP does not need to fully replace Procore, accounting, payroll, or estimating.

## Risks and Product Caveats

- The deck currently overstates breadth relative to what should ship in MVP
- Marketplace may generate little value until enough profiles and traffic exist
- QuickBooks sync will require careful OAuth and token management
- GC portal scope must stay narrow or it will balloon into a second product
- Materials intelligence is valuable, but the first version should be manual and simple

## Open Questions for Founder Review

- Should GC users see only explicitly shared invoices, or all invoices for a shared project?
- What exact GC status states are meaningful in practice?
- Which compliance documents are mandatory by trade or project type?
- Should leads be assigned to a shared inbox, a specific user, or both?
- How much project information should be visible to GCs by default?
- Is crew scheduling strictly internal, or should some schedule slices be shareable later?
- Is bid management in MVP limited to lead tracking, or should formal bid records ship in v1?

## Recommended Build Phases

### Phase 1: Foundation

- Auth
- Multi-tenant workspace
- Company profile
- Projects and contacts

### Phase 2: Operational Core

- Dayboard
- Crew scheduling
- Materials tracking
- Compliance documents

### Phase 3: Revenue and External Collaboration

- Invoices and payment board
- QuickBooks sync
- Marketplace profile
- Lead capture
- GC portal

### Phase 4: Post-MVP Expansion

- Formal bid workflows
- Richer marketplace matching
- Deeper analytics
- Procore integration
- Attendance strategy if justified

## Final Recommendation

SubBase should be built and communicated as:

"The operating system for subcontractors, with a lightweight GC-facing collaboration layer and a marketplace for discovery."

That framing is technically coherent, consistent with the current deck, and narrow enough to support an MVP without collapsing under integration or mobile complexity.
