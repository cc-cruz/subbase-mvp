import "server-only";

import { prisma } from "@/lib/db/client";
import { asOrganizationRole, type OrganizationRole } from "@/lib/auth/roles";

const activeStatusFilter = {
  equals: "active",
  mode: "insensitive" as const,
};

const roleOrder: Record<OrganizationRole, number> = {
  ADMIN: 0,
  MANAGER: 1,
  FOREMAN: 2,
};

function getUserDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return name.length > 0 ? name : user.email;
}

export async function listOrganizationMembers({
  organizationId,
}: {
  organizationId: string;
}) {
  const memberships = await prisma.organizationMembership.findMany({
    where: {
      organizationId,
      status: activeStatusFilter,
    },
    include: {
      user: true,
      invitedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return memberships
    .map((membership) => {
      const role = asOrganizationRole(membership.role);

      return {
        id: membership.id,
        role,
        status: membership.status.trim().toUpperCase(),
        createdAt: membership.createdAt,
        user: {
          id: membership.user.id,
          email: membership.user.email,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          displayName: getUserDisplayName(membership.user),
        },
        invitedByUser: membership.invitedByUser
          ? {
              id: membership.invitedByUser.id,
              email: membership.invitedByUser.email,
              displayName: getUserDisplayName(membership.invitedByUser),
            }
          : null,
      };
    })
    .sort((left, right) => {
      const roleDelta = roleOrder[left.role] - roleOrder[right.role];

      if (roleDelta !== 0) {
        return roleDelta;
      }

      return left.user.displayName.localeCompare(right.user.displayName);
    });
}

export async function listPendingInternalInvitations({
  organizationId,
}: {
  organizationId: string;
}) {
  const now = new Date();
  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId,
      inviteType: {
        equals: "internal",
        mode: "insensitive",
      },
      acceptedAt: null,
      revokedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    include: {
      createdByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: asOrganizationRole(invitation.roleOrPermission),
    createdAt: invitation.createdAt,
    expiresAt: invitation.expiresAt,
    createdByUser: {
      id: invitation.createdByUser.id,
      email: invitation.createdByUser.email,
      displayName: getUserDisplayName(invitation.createdByUser),
    },
  }));
}
