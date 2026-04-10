import "server-only";

import { forbidden, notFound } from "@/lib/api/errors";
import {
  asOrganizationRole,
  getResolvedPermissions,
  hasMinimumRole,
  roleHasPermission,
  type OrganizationRole,
  type WorkspacePermission,
} from "@/lib/auth/roles";
import {
  getActiveMembershipForOrganization,
  hasAccessGrant,
  type AccessGrantPermission,
  type AccessGrantResourceType,
} from "@/lib/auth/memberships";
import { requireCurrentUser } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api/response";

export async function requireAuthenticatedRoute() {
  return requireCurrentUser();
}

export async function requireOrgRouteContext({
  orgSlug,
  minimumRole,
  permission,
}: {
  orgSlug: string;
  minimumRole?: OrganizationRole;
  permission?: WorkspacePermission;
}) {
  const currentUser = await requireCurrentUser();
  const membership = await getActiveMembershipForOrganization({
    userId: currentUser.user.id,
    orgSlug,
  });

  if (!membership) {
    throw notFound("Workspace membership not found.");
  }

  const normalizedRole = asOrganizationRole(membership.role);

  if (minimumRole && !hasMinimumRole(normalizedRole, minimumRole)) {
    throw forbidden("You do not have the required workspace role.");
  }

  if (permission && !roleHasPermission(normalizedRole, permission)) {
    throw forbidden("You do not have permission to access this resource.");
  }

  return {
    currentUser,
    organization: membership.organization,
    membership,
    permissions: getResolvedPermissions(normalizedRole),
  };
}

export async function requireExternalGrant({
  orgId,
  resourceType,
  resourceId,
  permission,
}: {
  orgId: string;
  resourceType: AccessGrantResourceType;
  resourceId: string;
  permission: AccessGrantPermission;
}) {
  const currentUser = await requireCurrentUser();
  const allowed = await hasAccessGrant({
    userId: currentUser.user.id,
    organizationId: orgId,
    resourceType,
    resourceId,
    permission,
  });

  if (!allowed) {
    throw forbidden("You do not have access to this shared resource.");
  }

  return currentUser;
}

export function withRouteErrorHandling<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
