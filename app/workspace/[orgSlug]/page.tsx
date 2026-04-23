import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  HelpCircle,
  PlugZap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyState } from "@/components/workspace/empty-state";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { listComplianceDocuments } from "@/lib/domain/compliance";
import { getQuickBooksIntegration } from "@/lib/domain/integrations/quickbooks";
import { listOrganizationMembers, listPendingInternalInvitations } from "@/lib/domain/members";
import { getCompanyProfile } from "@/lib/domain/profiles/queries";
import { listProjects } from "@/lib/domain/projects";
import { cn } from "@/lib/utils";

type SetupCard = {
  title: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  isComplete: boolean;
  tooltip: string;
  icon: typeof Building2;
};

function isProfileConfigured(profile: Awaited<ReturnType<typeof getCompanyProfile>>) {
  return Boolean(
    profile?.phone ||
      profile?.email ||
      profile?.websiteUrl ||
      profile?.description ||
      profile?.licenseSummary ||
      profile?.insuranceSummary ||
      profile?.marketplaceEnabled,
  );
}

function SetupTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label="Task details"
          className="inline-flex h-8 w-8 items-center justify-center border-2 border-border bg-background text-muted-foreground transition hover:-translate-y-0.5 hover:bg-secondary hover:text-secondary-foreground"
          type="button"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 border-2 border-border text-xs leading-5" sideOffset={6}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function SetupTaskCard({ task }: { task: SetupCard }) {
  const Icon = task.icon;

  return (
    <Card className="border-4 border-border">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={task.isComplete ? "default" : "outline"}
              className="border-2 border-border font-mono text-[10px] uppercase tracking-[0.14em]"
            >
              {task.isComplete ? "Ready" : "Next"}
            </Badge>
            <SetupTooltip content={task.tooltip} />
          </div>
        </div>
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {task.eyebrow}
          </p>
          <CardTitle className="mt-2 text-xl">{task.title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            {task.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row">
        <Button asChild className="gap-2">
          <Link href={task.ctaHref}>
            {task.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        {task.secondaryHref && task.secondaryLabel ? (
          <Button asChild variant="outline">
            <Link href={task.secondaryHref}>{task.secondaryLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({ orgSlug }).catch(() =>
    redirect("/workspace"),
  );
  const [
    projects,
    members,
    pendingInvites,
    complianceDocuments,
    profile,
    quickBooksIntegration,
  ] = await Promise.all([
    listProjects(context.organization.id),
    listOrganizationMembers({
      organizationId: context.organization.id,
    }),
    listPendingInternalInvitations({
      organizationId: context.organization.id,
    }),
    listComplianceDocuments(context.organization.id),
    getCompanyProfile(context.organization.id),
    getQuickBooksIntegration(context.organization.id),
  ]);
  const activeProjects = projects.filter(
    (project: (typeof projects)[number]) => project.status === "ACTIVE",
  );
  const totalContacts = projects.reduce(
    (count, project) => count + project.contacts.length,
    0,
  );
  const projectScopedComplianceDocuments = complianceDocuments.filter(
    (document) => document.attachmentTarget === "PROJECT",
  );
  const profileConfigured = isProfileConfigured(profile);
  const hasProject = projects.length > 0;
  const quickBooksConnected = quickBooksIntegration?.status === "active";
  const setupSteps = [
    profileConfigured,
    hasProject,
    quickBooksConnected,
  ].filter(Boolean).length;
  const setupProgress = Math.round((setupSteps / 3) * 100);
  const canManageIntegrations = context.permissions.includes("integrations:manage");
  const settingsHref = `/workspace/${orgSlug}/settings/company`;
  const projectsHref = `/workspace/${orgSlug}/projects`;
  const quickBooksHref = canManageIntegrations
    ? `/api/orgs/${orgSlug}/integrations/quickbooks/connect?returnTo=${encodeURIComponent(settingsHref)}`
    : settingsHref;
  const firstName =
    context.currentUser.user.firstName ?? context.currentUser.user.email.split("@")[0];
  const setupCards: SetupCard[] = [
    {
      title: "Finish company profile",
      eyebrow: "Company base",
      description:
        "Set the company details that power marketplace, docs, and GC-facing records.",
      ctaLabel: profileConfigured ? "Review profile" : "Update profile",
      ctaHref: settingsHref,
      secondaryLabel: "Company settings",
      secondaryHref: settingsHref,
      isComplete: profileConfigured,
      tooltip:
        "This is the canonical profile for the workspace. Phone, email, website, license, insurance, and marketplace fields all live here.",
      icon: Building2,
    },
    {
      title: "Create the first job",
      eyebrow: "Project board",
      description:
        "Add a real project so crews, materials, contacts, and payment follow-up have a home.",
      ctaLabel: hasProject ? "Open projects" : "Create project",
      ctaHref: projectsHref,
      secondaryLabel: hasProject ? "View recent jobs" : undefined,
      secondaryHref: hasProject ? `/workspace/${orgSlug}` : undefined,
      isComplete: hasProject,
      tooltip:
        "The Dayboard is derived from project records. Start here before adding crew, material, or cash workflows.",
      icon: ClipboardList,
    },
    {
      title: "Connect QuickBooks",
      eyebrow: "Cash visibility",
      description:
        "Connect accounting when you are ready to pull invoice state into the operating board.",
      ctaLabel: quickBooksConnected ? "Review connection" : "Connect QuickBooks",
      ctaHref: quickBooksHref,
      secondaryLabel: "Why it matters",
      secondaryHref: settingsHref,
      isComplete: quickBooksConnected,
      tooltip:
        canManageIntegrations
          ? "This starts the QuickBooks OAuth flow and returns to company settings after Intuit finishes."
          : "Only workspace admins can manage the QuickBooks connection.",
      icon: PlugZap,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="border-4 border-border bg-card p-5 shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="inline-flex border-2 border-border bg-secondary px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
              Getting started
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Build the operating board, {firstName}.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Start with the pieces that make the SubBase Dayboard useful:
              company truth, live jobs, and cash visibility.
            </p>
          </div>

          <div className="border-2 border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Setup progress
              </p>
              <Badge
                variant="secondary"
                className="border-2 border-border font-mono text-[10px] uppercase tracking-[0.14em]"
              >
                {setupSteps}/3 ready
              </Badge>
            </div>
            <div className="mt-4 h-4 overflow-hidden border-2 border-border bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${setupProgress}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {setupCards.map((task) => (
                <div
                  key={task.title}
                  className={cn(
                    "h-2 border border-border",
                    task.isComplete ? "bg-secondary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-4 border-border">
          <CardHeader>
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-4xl">{projects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-4 border-border">
          <CardHeader>
            <CardDescription>Active Jobs</CardDescription>
            <CardTitle className="text-4xl">{activeProjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-4 border-border">
          <CardHeader>
            <CardDescription>Team Footprint</CardDescription>
            <CardTitle className="text-4xl">{members.length}</CardTitle>
            <CardDescription>{pendingInvites.length} pending internal invites</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-4 border-border">
          <CardHeader>
            <CardDescription>Compliance Records</CardDescription>
            <CardTitle className="text-4xl">{complianceDocuments.length}</CardTitle>
            <CardDescription>
              {projectScopedComplianceDocuments.length} attached to active project scopes
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {setupCards.map((task) => (
          <SetupTaskCard key={task.title} task={task} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-4 border-border">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Projects are still the anchor entity. Contacts, compliance, and later
                invoice follow-up all hang off this record.
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href={projectsHref}>Open board</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Create the first job record to turn this workspace into a real operating surface."
                actionLabel="Create a project"
                actionHref={projectsHref}
              />
            ) : (
              <div className="grid gap-3">
                {projects.slice(0, 4).map((project: (typeof projects)[number]) => (
                  <Link
                    key={project.id}
                    href={`/workspace/${orgSlug}/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 border-2 border-border bg-card px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <p className="font-semibold">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.city && project.state
                          ? `${project.city}, ${project.state}`
                          : "Location not set"}
                      </p>
                    </div>
                    <Badge variant={project.status === "ACTIVE" ? "default" : "outline"}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-4 border-border">
            <CardHeader>
              <CardTitle>Dayboard Readiness</CardTitle>
              <CardDescription>
                What the current workspace can show today.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Company base",
                  ready: profileConfigured,
                },
                {
                  label: "Live job records",
                  ready: hasProject,
                },
                {
                  label: "Accounting signal",
                  ready: quickBooksConnected,
                },
                {
                  label: "Project contacts",
                  ready: totalContacts > 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 border-2 border-border bg-background px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {item.ready ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />
                    ) : (
                      <CircleDollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm font-semibold">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.ready ? "ready" : "queued"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-4 border-border">
            <CardHeader>
              <CardTitle>Operating Surfaces</CardTitle>
              <CardDescription>
                The next modules worth using and pressure-testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href={`/workspace/${orgSlug}/compliance`}
                className="block border-2 border-border bg-background px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold">Compliance</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {complianceDocuments.length} metadata-backed records across company and project scopes.
                </p>
              </Link>
              <Link
                href={`/workspace/${orgSlug}/settings/members`}
                className="block border-2 border-border bg-background px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold">Members</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {members.length} active team members and {pendingInvites.length} pending invites.
                </p>
              </Link>
              <Link
                href={`/workspace/${orgSlug}/invoices`}
                className="block border-2 border-border bg-background px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-semibold">Invoices</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check QuickBooks readiness before reserving persistent invoice sync state.
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
