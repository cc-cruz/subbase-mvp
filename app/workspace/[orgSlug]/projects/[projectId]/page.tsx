import { notFound, redirect } from "next/navigation";

import { ProjectContactManager } from "@/components/projects/project-contact-manager";
import { ProjectForm } from "@/components/projects/project-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { getProject } from "@/lib/domain/projects";

export default async function WorkspaceProjectDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; projectId: string }>;
}) {
  const { orgSlug, projectId } = await params;
  const context = await requireOrgRouteContext({ orgSlug }).catch(() =>
    redirect("/workspace"),
  );
  const project = await getProject({
    organizationId: context.organization.id,
    projectId,
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card className="border-4 border-border">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <Badge variant={project.status === "ACTIVE" ? "default" : "outline"}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <CardDescription>
              {project.projectAddress
                ? `${project.projectAddress}${project.city ? `, ${project.city}` : ""}${project.state ? `, ${project.state}` : ""}`
                : "Project address not set yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Slug
                </p>
                <p className="mt-2 font-semibold">{project.slug}</p>
              </div>
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Source
                </p>
                <p className="mt-2 font-semibold">{project.source.replace("_", " ")}</p>
              </div>
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  GC Company
                </p>
                <p className="mt-2 font-semibold">{project.gcCompany?.name ?? "Not linked"}</p>
              </div>
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Contact Coverage
                </p>
                <p className="mt-2 font-semibold">
                  {project.contacts.length > 0 ? `${project.contacts.length} contact records` : "No contacts yet"}
                </p>
              </div>
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Start Date
                </p>
                <p className="mt-2 font-semibold">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not scheduled"}
                </p>
              </div>
              <div className="border-2 border-border bg-background px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  End Date
                </p>
                <p className="mt-2 font-semibold">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not scheduled"}
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-border bg-background px-4 py-4">
              <p className="text-sm font-semibold">Notes</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {project.notes ?? "No project notes yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <ProjectContactManager orgSlug={orgSlug} project={project} />
      </div>

      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
          <CardDescription>
            Keep the anchor record current so later crew, materials, compliance, and
            invoice workflows can hang off a clean project record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm orgSlug={orgSlug} project={project} />
        </CardContent>
      </Card>
    </div>
  );
}
