import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { listOrganizationMembers } from "@/lib/domain/members";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "members:manage",
    });
    const members = await listOrganizationMembers({
      organizationId: context.organization.id,
    });

    return ok({
      items: members,
    });
  },
);
