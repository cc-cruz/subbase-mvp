import { created, ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { createProject, listProjects } from "@/lib/domain/projects";
import { createProjectSchema } from "@/lib/domain/projects/schemas";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "workspace:view",
    });
    const projects = await listProjects(context.organization.id);

    return ok({
      items: projects,
    });
  },
);

export const POST = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "projects:manage",
    });
    const input = createProjectSchema.parse(await request.json());
    const project = await createProject({
      organizationId: context.organization.id,
      input,
    });

    return created({
      project,
    });
  },
);
