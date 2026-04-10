import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { getProject, updateProject } from "@/lib/domain/projects";
import { updateProjectSchema } from "@/lib/domain/projects/schemas";
import { notFound } from "@/lib/api/errors";

export const GET = withRouteErrorHandling(
  async (
    _request: Request,
    { params }: { params: Promise<{ orgSlug: string; projectId: string }> },
  ) => {
    const { orgSlug, projectId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "workspace:view",
    });
    const project = await getProject({
      organizationId: context.organization.id,
      projectId,
    });

    if (!project) {
      throw notFound("Project not found.");
    }

    return ok({
      project,
    });
  },
);

export const PATCH = withRouteErrorHandling(
  async (
    request: Request,
    { params }: { params: Promise<{ orgSlug: string; projectId: string }> },
  ) => {
    const { orgSlug, projectId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "projects:manage",
    });
    const input = updateProjectSchema.parse(await request.json());
    const project = await updateProject({
      organizationId: context.organization.id,
      projectId,
      input,
    });

    return ok({
      project,
    });
  },
);
