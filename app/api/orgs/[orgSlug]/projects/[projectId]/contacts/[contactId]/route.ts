import { noContent, ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { deleteProjectContact, updateProjectContact } from "@/lib/domain/projects";
import { updateProjectContactSchema } from "@/lib/domain/projects/schemas";

export const PATCH = withRouteErrorHandling(
  async (
    request: Request,
    { params }: { params: Promise<{ orgSlug: string; projectId: string; contactId: string }> },
  ) => {
    const { orgSlug, projectId, contactId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "projects:manage",
    });
    const input = updateProjectContactSchema.parse(await request.json());
    const contact = await updateProjectContact({
      organizationId: context.organization.id,
      projectId,
      contactId,
      input,
    });

    return ok({
      contact,
    });
  },
);

export const DELETE = withRouteErrorHandling(
  async (
    _request: Request,
    { params }: { params: Promise<{ orgSlug: string; projectId: string; contactId: string }> },
  ) => {
    const { orgSlug, projectId, contactId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "projects:manage",
    });
    await deleteProjectContact({
      organizationId: context.organization.id,
      projectId,
      contactId,
    });

    return noContent();
  },
);
