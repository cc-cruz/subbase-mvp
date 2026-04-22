import "server-only";

import { prisma } from "@/lib/db/client";
import { asOrganizationRole, getPermissionsForRole, type OrganizationRole } from "@/lib/auth/roles";

export type AccessGrantResourceType = "PROJECT" | "DOCUMENT" | "INVOICE";
export type AccessGrantPermission = "VIEW" | "STATUS_UPDATE";

const activeStatusFilter = {
  equals: "active",
  mode: "insensitive" as const,
};

function normalizeEnumLikeValue(value: string) {
  return value.trim().replace(/[\s-]+/g, "_").toUpperCase();
}

function normalizeMembershipRecord<T extends { role: string; status: string }>(membership: T) {
  return {
    ...membership,
    role: asOrganizationRole(membership.role),
    status: normalizeEnumLikeValue(membership.status),
  };
}

function normalizeGcMembershipRecord<T extends { role: string; status: string }>(membership: T) {
  return {
    ...membership,
    role: normalizeEnumLikeValue(membership.role),
    status: normalizeEnumLikeValue(membership.status),
  };
}

export async function getActiveMembershipsForUser(userId: string) {
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      userId,
      status: activeStatusFilter,
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

  return memberships.map(normalizeMembershipRecord);
}

export async function getActiveMembershipForOrganization({
  userId,
  orgSlug,
}: {
  userId: string;
  orgSlug: string;
}) {
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      status: activeStatusFilter,
      organization: {
        slug: orgSlug,
      },
    },
    include: {
      organization: true,
    },
  });

  return membership ? normalizeMembershipRecord(membership) : null;
}

export async function getDefaultWorkspaceSlug(userId: string) {
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      userId,
      status: activeStatusFilter,
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
  const affiliations = await prisma.gcCompanyMembership.findMany({
    where: {
      userId,
      status: activeStatusFilter,
    },
    include: {
      gcCompany: true,
    },
  });

  return affiliations.map(normalizeGcMembershipRecord);
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
      resourceType: {
        equals: resourceType,
        mode: "insensitive",
      },
      resourceId,
      permission: {
        equals: permission,
        mode: "insensitive",
      },
      revokedAt: null,
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        {
          OR: [
            {
              subjectType: {
                equals: "user",
                mode: "insensitive",
              },
              subjectId: userId,
            },
            ...(gcCompanyIds.length > 0
              ? [
                  {
                    subjectType: {
                      equals: "gc_company",
                      mode: "insensitive" as const,
                    },
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
