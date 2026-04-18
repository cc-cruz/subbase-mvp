import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/workspace/empty-state";
import { listComplianceDocuments } from "@/lib/domain/compliance";
import { listOrganizationMembers, listPendingInternalInvitations } from "@/lib/domain/members";
import { listProjects } from "@/lib/domain/projects";
import { requireOrgRouteContext } from "@/lib/api/route-guard";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({ orgSlug });
  const [projects, members, pendingInvites, complianceDocuments] = await Promise.all([
    listProjects(context.organization.id),
    listOrganizationMembers({
      organizationId: context.organization.id,
    }),
    listPendingInternalInvitations({
      organizationId: context.organization.id,
    }),
    listComplianceDocuments(context.organization.id),
  ]);
  const activeProjects = projects.filter(
    (project: (typeof projects)[number]) => project.status === "ACTIVE",
  );
  const projectScopedComplianceDocuments = complianceDocuments.filter(
    (document) => document.attachmentTarget === "PROJECT",
  );

  return (
    <div className="space-y-6">
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
            <CardDescription>Workspace Role</CardDescription>
            <CardTitle className="text-2xl">{context.membership.role}</CardTitle>
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

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-4 border-border">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Projects are still the anchor entity. Contacts, compliance, and later
                invoice follow-up all hang off this record.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={`/workspace/${orgSlug}/projects`}>Open Project Board</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Create the first job record to turn this repo into a real product surface."
                actionLabel="Create a project"
                actionHref={`/workspace/${orgSlug}/projects`}
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

        <Card className="border-4 border-border">
          <div>
            <CardHeader>
              <CardTitle>New Operating Surfaces</CardTitle>
              <CardDescription>
                The kernel has now expanded beyond profile and project CRUD. These are
                the next internal modules worth using and pressure-testing.
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
            </CardContent>
          </div>
        </Card>
      </section>
    </div>
  );
}
