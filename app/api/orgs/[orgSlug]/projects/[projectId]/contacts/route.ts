import { created, ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { createProjectContact, listProjectContacts } from "@/lib/domain/projects";
import { createProjectContactSchema } from "@/lib/domain/projects/schemas";

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
    const contacts = await listProjectContacts({
      organizationId: context.organization.id,
      projectId,
    });

    return ok({
      items: contacts,
    });
  },
);

export const POST = withRouteErrorHandling(
  async (
    request: Request,
    { params }: { params: Promise<{ orgSlug: string; projectId: string }> },
  ) => {
    const { orgSlug, projectId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "projects:manage",
    });
    const input = createProjectContactSchema.parse(await request.json());
    const contact = await createProjectContact({
      organizationId: context.organization.id,
      projectId,
      input,
    });

    return created({
      contact,
    });
  },
);
