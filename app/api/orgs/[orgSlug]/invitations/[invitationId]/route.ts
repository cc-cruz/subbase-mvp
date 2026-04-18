import { noContent } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { revokeInternalInvitation } from "@/lib/domain/members";

export const PATCH = withRouteErrorHandling(
  async (
    _request: Request,
    { params }: { params: Promise<{ orgSlug: string; invitationId: string }> },
  ) => {
    const { orgSlug, invitationId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "members:manage",
    });

    await revokeInternalInvitation({
      organizationId: context.organization.id,
      invitationId,
    });

    return noContent();
  },
);
