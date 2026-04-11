import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/workspace/empty-state";
import { listProjects } from "@/lib/domain/projects";
import { requireOrgRouteContext } from "@/lib/api/route-guard";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({ orgSlug });
  const projects = await listProjects(context.organization.id);
  const activeProjects = projects.filter(
    (project: (typeof projects)[number]) => project.status === "ACTIVE",
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
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
      </section>

      <Card className="border-4 border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Milestone 1 is about proving the workspace kernel with real org and
              project data.
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
    </div>
  );
}
