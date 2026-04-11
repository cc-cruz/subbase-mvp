import { ProjectForm } from "@/components/projects/project-form";
import { ProjectList } from "@/components/projects/project-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { listProjects } from "@/lib/domain/projects";

export default async function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({ orgSlug });
  const projects = await listProjects(context.organization.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <ProjectList orgSlug={orgSlug} projects={projects} />
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Create A Project</CardTitle>
          <CardDescription>
            Start with a clean project record. Crew, materials, and compliance will
            hang off this entity next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm orgSlug={orgSlug} />
        </CardContent>
      </Card>
    </div>
  );
}
