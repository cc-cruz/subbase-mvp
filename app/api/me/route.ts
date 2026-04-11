import { ok } from "@/lib/api/response";
import { withRouteErrorHandling } from "@/lib/api/route-guard";
import { getActiveMembershipsForUser, getGcCompanyAffiliations } from "@/lib/auth/memberships";
import { asOrganizationRole, getPermissionsForRole } from "@/lib/auth/roles";
import { requireCurrentUser } from "@/lib/auth/session";

export const GET = withRouteErrorHandling(async () => {
  const { user } = await requireCurrentUser();
  const memberships = await getActiveMembershipsForUser(user.id);
  const gcAffiliations = await getGcCompanyAffiliations(user.id);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      actorKind: user.actorKind,
    },
    memberships: memberships.map((membership: (typeof memberships)[number]) => ({
      organizationId: membership.organizationId,
      organizationSlug: membership.organization.slug,
      organizationName: membership.organization.name,
      role: membership.role,
      permissions: getPermissionsForRole(asOrganizationRole(membership.role)),
    })),
    gcAffiliations: gcAffiliations.map((affiliation: (typeof gcAffiliations)[number]) => ({
      gcCompanyId: affiliation.gcCompanyId,
      gcCompanyName: affiliation.gcCompany.name,
      role: affiliation.role,
    })),
  });
});
