import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({ orgSlug });

    return ok({
      organization: {
        id: context.organization.id,
        slug: context.organization.slug,
        name: context.organization.name,
        planTier: context.organization.planTier,
      },
      membership: {
        id: context.membership.id,
        role: context.membership.role,
        status: context.membership.status,
      },
      permissions: context.permissions,
    });
  },
);
