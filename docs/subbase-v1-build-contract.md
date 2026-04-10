# SubBase v1 Build Contract

## Purpose

This document is the engineering contract for v1. It narrows the existing product spec into a build-now scope that does not wait for founder review.

If the original spec, landing page, or this contract conflict, engineering should follow this contract for v1.

## v1 Product Statement

SubBase v1 is a web app for subcontractor companies to manage daily operations across active jobs. The primary value is one internal workspace for projects, crew assignments, material risk, compliance documents, invoice visibility, and lead intake.

The public marketplace and GC portal are supporting surfaces. They exist only to help the subcontractor win work and share selected information. They are not first-class products in v1.

## Frozen Product Assumptions

Engineering should assume all of the following are true unless this document is replaced:

1. The primary user is an internal subcontractor team member, not a GC.
2. The primary surface is the internal subcontractor app.
3. The Dayboard is a read-only summary of underlying modules. It is never the source of truth for edits.
4. A workspace represents exactly one subcontractor company.
5. v1 is a responsive web product only. No native mobile app is required.
6. Projects represent awarded or active jobs. Public leads are separate records until a user converts a lead into a project.
7. v1 does not include a formal bid object. There is no bid workspace, bid response workflow, or win/loss analytics module.
8. A lead can be converted into a project by creating a project from the lead. This can be a simple manual conversion flow.
9. Materials tracking is manual. There are no supplier integrations, purchase orders, or inventory workflows in v1.
10. Compliance requirements are manual. Users choose document categories and expiration dates. The system does not enforce trade-specific required-doc rules.
11. Invoice accounting truth comes from QuickBooks. SubBase stores invoice visibility, internal follow-up notes, share state, and optional GC acknowledgements only.
12. GC users can see only records explicitly shared with them. They do not browse the subcontractor workspace.
13. The marketplace is a searchable public profile and lead form only. There is no matching engine, ranking logic, or bid distribution network in v1.
14. Billing and packaging do not drive product behavior in v1. Engineering should not build tier-based feature entitlements, crew caps, or plan-specific access control.
15. v1 should optimize for office users first. Foreman and field workflows stay minimal.

## Explicitly Deferred From v1

The following items are out of scope even if they appear in marketing copy or the broader spec:

- Formal bid management
- Bid request objects
- Bid response workflow
- Win/loss analytics
- Job profitability tracking
- GPS attendance or time tracking
- Delay attribution and legal claim workflow
- Procore integration
- Vendor or supplier API integrations
- Purchase orders
- Inventory management
- Payroll
- Estimating replacement
- Native mobile app
- Foreman acknowledgement workflow
- Mobile schedule view
- Automated compliance requirement rules by trade or project type
- Automatic compliance sending rules
- General project visibility for GCs
- GC access to crew schedules
- GC access to internal margins or financial detail
- Multi-sub invite and request matching
- Marketplace ranking engine
- Reviews, ratings, or reputation system
- Advanced analytics and reporting
- Tiered billing entitlements
- Crew-count plan caps
- Custom integrations beyond QuickBooks

## Minimal Role Model

v1 will ship with four effective roles plus one unauthenticated public state.

### 1. Admin

Use for owner/admin users.

Permissions:

- Full access to all internal modules
- Manage workspace settings
- Manage internal users and roles
- Manage QuickBooks connection
- Manage billing settings if billing exists
- Publish or unpublish marketplace profile
- Invite GC users
- Share and revoke shared records

### 2. Manager

Use for operations staff and project managers.

Permissions:

- Full create, edit, and archive access to operational records
- Manage projects and contacts
- Manage crew members and assignments
- Manage materials records
- Manage compliance documents
- Manage invoice follow-up notes and share state
- Manage marketplace leads
- Create GC shares and invitations

Restrictions:

- Cannot manage workspace billing
- Cannot manage integrations
- Cannot manage internal users or role assignments

### 3. Foreman

Use for internal field-facing users in v1.

Permissions:

- View assigned projects
- View crew schedule relevant to assigned work
- View material status relevant to assigned work
- View project notes and basic job detail

Restrictions:

- No billing, settings, or integration access
- No invoice access
- No company-level compliance management
- No marketplace or lead management
- No user management

### 4. GC Viewer

Use for invited external GC users.

Permissions:

- View only explicitly shared documents
- View only explicitly shared invoices
- Submit invoice acknowledgement status on shared invoices
- Submit or update lead/contact information where a lead share exists

Restrictions:

- No general project list
- No crew schedule access
- No internal notes
- No workspace browsing
- No billing or settings access

### Public Visitor

Unauthenticated visitor.

Permissions:

- Browse public marketplace listings
- View public subcontractor profile pages
- Submit lead forms

Restrictions:

- No portal access
- No shared document access
- No invoice access

## Required v1 Modules

These modules are in scope and should be treated as the entire v1 product surface.

### 1. Workspace and Auth

Ship:

- Workspace creation
- Sign in
- Invite internal users
- Minimal role assignment using `admin`, `manager`, `foreman`

Do not ship:

- Multi-workspace switching
- SSO
- Fine-grained custom permissions

### 2. Company Profile

Ship:

- Company name
- Trades
- Service area
- About text
- License fields
- Insurance fields
- Contact channels
- Public profile toggle

Do not ship:

- Rich portfolio CMS
- Reviews
- Branded microsites

### 3. Projects and Contacts

Ship:

- Project CRUD
- GC company/contact association
- Address
- Start date
- End date
- Status
- Notes

Required project statuses:

- `draft`
- `active`
- `on_hold`
- `completed`
- `cancelled`

Do not ship:

- `lead` as a project status
- `bidding` as a project status
- RFIs
- Submittals
- Task management

### 4. Crew Scheduling

Ship:

- Crew member records
- Daily assignment to project
- Call time
- Assignment notes
- Conflict indicator

Do not ship:

- Drag-and-drop as a requirement
- GPS attendance
- Time tracking
- Recurring assignments
- Foreman acknowledgement

### 5. Materials Tracking

Ship:

- Material item records
- Vendor as free text or simple vendor record
- Quantity
- Quoted lead time
- Order-by date
- Requested date
- Promised date
- Confirmation status
- Risk flagging

Required material statuses:

- `draft`
- `needs_order`
- `ordered`
- `confirmed`
- `delivered`
- `delayed`
- `cancelled`

Do not ship:

- Purchase order workflow
- Supplier sync
- Inventory counts

### 6. Compliance Documents

Ship:

- File upload
- Company-level or project-level document attachment
- Category
- Issue date
- Expiration date
- Manual sharing to GC users
- Share history

Initial document categories:

- `w9`
- `license`
- `insurance`
- `workers_comp`
- `safety_cert`
- `trade_cert`
- `agreement`
- `other`

Do not ship:

- Required-doc rules by trade
- Automated send rules
- OCR or compliance verification

### 7. Invoice Visibility

Ship:

- Invoice list imported from QuickBooks
- Amount
- Customer
- Due date
- Balance
- Accounting status
- Internal follow-up notes
- Explicit share to GC user
- GC acknowledgement status on shared invoices

Required invoice status model:

- `accounting_status`: `draft`, `sent`, `partially_paid`, `paid`, `void`
- `gc_status`: `unknown`, `received`, `approved`, `scheduled`, `disputed`
- `follow_up_status`: `none`, `queued`, `sent`, `replied`

Do not ship:

- Manual accounting system inside SubBase
- Payment collection workflows
- Profitability reporting

### 8. Leads

Ship:

- Lead inbox or list
- Lead source
- Contact info
- Trade/scope summary
- Notes
- Assignment to admin or manager
- Status tracking
- Manual convert-to-project action

Required lead statuses:

- `new`
- `contacted`
- `qualified`
- `won`
- `lost`
- `archived`

Do not ship:

- Quote builder
- Bid objects
- Bid comparisons
- Win/loss reporting

### 9. Dayboard

Ship:

- Read-only dashboard cards for today's crew assignments
- Read-only dashboard cards for material risks
- Read-only dashboard cards for overdue invoices
- Read-only dashboard cards for expiring compliance docs
- Read-only dashboard cards for new leads
- Drill-down links to underlying records

Do not ship:

- Editable Dayboard widgets
- Custom dashboard builder
- Analytics beyond operational counts and alerts

### 10. Marketplace

Ship:

- Public company profile page
- Search or listing view
- Filter by trade
- Filter by service area
- Lead form submission

Do not ship:

- Ranking engine
- Paid placement
- Review system
- Broadcast bid requests

### 11. GC Portal

Ship:

- Invitation-based sign in
- Shared document view
- Shared invoice view
- Invoice acknowledgement update

Do not ship:

- General project portal
- Schedule access
- Project collaboration workspace
- Full communication hub

## Module Cut List

Use this table when deciding whether a feature belongs in v1.

| Module | Keep in v1 | Cut from v1 |
| --- | --- | --- |
| Auth and workspace | Sign in, invites, 3 internal roles | SSO, custom permissions, multi-org |
| Company profile | Identity, trades, service area, marketplace toggle | Reviews, CMS, branded pages |
| Projects | Active-job CRUD and GC contacts | Lead-stage projects, RFIs, tasks |
| Crew scheduling | Daily assignments and notes | GPS, attendance, recurring logic |
| Materials | Manual risk tracker | Procurement, inventory, supplier APIs |
| Compliance | Upload, expiry, share history | Required-doc automation, auto-send |
| Invoices | QuickBooks visibility plus notes and share state | AR automation, profitability |
| Leads | Inbox, statuses, convert to project | Bid workflow, quoting, analytics |
| Dayboard | Read-only aggregate alerts | Customizable dashboards |
| Marketplace | Public profiles plus lead form | Matching, ranking, multi-sub routing |
| GC portal | Explicitly shared docs and invoices only | General project access, schedules |
| Billing | Optional simple billing shell | Plan gating, tier limits |

## Core v1 User Flows

Engineering should optimize for these flows only:

### Flow 1: Internal Onboarding

1. Admin creates workspace
2. Admin completes company profile
3. Admin invites managers
4. Admin connects QuickBooks
5. Team creates first projects
6. Team uploads compliance docs

### Flow 2: Daily Operations

1. Manager opens Dayboard
2. Reviews crew assignments
3. Reviews material risks
4. Reviews overdue invoices
5. Reviews expiring docs
6. Reviews new leads
7. Clicks into the relevant module to act

### Flow 3: Lead Intake

1. Public visitor submits lead form from marketplace profile
2. Lead appears in internal lead list
3. Manager assigns owner and updates status
4. If won, manager converts lead to project

### Flow 4: GC Sharing

1. Manager invites GC user
2. Manager shares selected documents or invoices
3. GC signs in
4. GC views shared records only
5. GC updates invoice acknowledgement if applicable

## Build Order

Implement modules in this order:

1. Workspace and auth
2. Company profile
3. Projects and contacts
4. Crew scheduling
5. Materials tracking
6. Compliance documents
7. Leads
8. Dayboard
9. QuickBooks sync
10. Invoice visibility
11. Marketplace
12. GC portal

Dayboard should not be started before the underlying project, crew, material, compliance, and lead records exist.

## Final Rule

If a proposed feature does not clearly strengthen one of these v1 loops:

- internal daily operations
- manual lead intake
- explicit GC sharing

it should be deferred.
