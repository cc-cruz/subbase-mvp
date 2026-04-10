import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { getCompanyProfile } from "@/lib/domain/profiles/queries";
import { companyProfileInputSchema } from "@/lib/domain/profiles/schemas";
import { upsertCompanyProfile } from "@/lib/domain/profiles/mutations";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "workspace:view",
    });
    const profile = await getCompanyProfile(context.organization.id);

    return ok({
      profile,
    });
  },
);

export const PATCH = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "company_profile:manage",
    });
    const input = companyProfileInputSchema.parse(await request.json());
    const profile = await upsertCompanyProfile({
      organizationId: context.organization.id,
      input,
    });

    return ok({
      profile,
    });
  },
);
