import "server-only";

import { prisma } from "@/lib/db/client";
import { getPermissionsForRole, type OrganizationRole } from "@/lib/auth/roles";

export type AccessGrantResourceType = "PROJECT" | "DOCUMENT" | "INVOICE";
export type AccessGrantPermission = "VIEW" | "STATUS_UPDATE";

export async function getActiveMembershipsForUser(userId: string) {
  return prisma.organizationMembership.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      organization: true,
    },
    orderBy: {
      organization: {
        name: "asc",
      },
    },
  });
}

export async function getActiveMembershipForOrganization({
  userId,
  orgSlug,
}: {
  userId: string;
  orgSlug: string;
}) {
  return prisma.organizationMembership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      organization: {
        slug: orgSlug,
      },
    },
    include: {
      organization: true,
    },
  });
}

export async function getDefaultWorkspaceSlug(userId: string) {
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return membership?.organization.slug ?? null;
}

export async function getGcCompanyAffiliations(userId: string) {
  return prisma.gcCompanyMembership.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      gcCompany: true,
    },
  });
}

export async function hasAccessGrant({
  userId,
  organizationId,
  resourceType,
  resourceId,
  permission,
}: {
  userId: string;
  organizationId: string;
  resourceType: AccessGrantResourceType;
  resourceId: string;
  permission: AccessGrantPermission;
}) {
  const now = new Date();
  const gcAffiliations = await getGcCompanyAffiliations(userId);
  const gcCompanyIds = gcAffiliations.map((affiliation) => affiliation.gcCompanyId);

  const grant = await prisma.accessGrant.findFirst({
    where: {
      organizationId,
      resourceType,
      resourceId,
      permission,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [
        {
          OR: [
            {
              subjectType: "USER",
              subjectId: userId,
            },
            ...(gcCompanyIds.length > 0
              ? [
                  {
                    subjectType: "GC_COMPANY" as const,
                    subjectId: { in: gcCompanyIds },
                  },
                ]
              : []),
          ],
        },
      ],
    },
  });

  return Boolean(grant);
}

export function getResolvedPermissions(role: Parameters<typeof getPermissionsForRole>[0]) {
  return getPermissionsForRole(role);
}
