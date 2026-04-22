import "server-only";

import { randomUUID } from "node:crypto";

import { conflict, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/db/client";
import type { CreateInternalInvitationInput } from "@/lib/domain/members/schemas";

const pendingInternalInvitationWhere = (organizationId: string, email: string, now: Date) => ({
  organizationId,
  email: {
    equals: email,
    mode: "insensitive" as const,
  },
  inviteType: {
    equals: "internal",
    mode: "insensitive" as const,
  },
  acceptedAt: null,
  revokedAt: null,
  expiresAt: {
    gt: now,
  },
});

export async function createInternalInvitation({
  organizationId,
  createdByUserId,
  input,
}: {
  organizationId: string;
  createdByUserId: string;
  input: CreateInternalInvitationInput;
}) {
  const now = new Date();
  const existingMembership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId,
      status: {
        equals: "active",
        mode: "insensitive",
      },
      user: {
        email: {
          equals: input.email,
          mode: "insensitive",
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (existingMembership) {
    throw conflict("That user is already an active member.");
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: pendingInternalInvitationWhere(organizationId, input.email, now),
    select: {
      id: true,
    },
  });

  if (existingInvitation) {
    throw conflict("A pending internal invite already exists for that email.");
  }

  return prisma.invitation.create({
    data: {
      inviteType: "INTERNAL",
      email: input.email,
      organizationId,
      roleOrPermission: input.role,
      tokenHash: `internal-${randomUUID()}`,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      createdByUserId,
    },
  });
}

export async function revokeInternalInvitation({
  organizationId,
  invitationId,
}: {
  organizationId: string;
  invitationId: string;
}) {
  const now = new Date();
  const invitation = await prisma.invitation.findFirst({
    where: {
      id: invitationId,
      organizationId,
      inviteType: {
        equals: "internal",
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      acceptedAt: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (!invitation) {
    throw notFound("Internal invitation not found.");
  }

  if (invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt <= now) {
    throw conflict("Only pending internal invites can be revoked.");
  }

  return prisma.invitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      revokedAt: now,
    },
  });
}
