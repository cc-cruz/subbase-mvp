import { created, ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { createInternalInvitation, createInternalInvitationSchema, listPendingInternalInvitations } from "@/lib/domain/members";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "members:manage",
    });
    const invitations = await listPendingInternalInvitations({
      organizationId: context.organization.id,
    });

    return ok({
      items: invitations,
    });
  },
);

export const POST = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "members:manage",
    });
    const input = createInternalInvitationSchema.parse(await request.json());
    const invitation = await createInternalInvitation({
      organizationId: context.organization.id,
      createdByUserId: context.currentUser.user.id,
      input,
    });

    return created({
      invitation,
    });
  },
);
