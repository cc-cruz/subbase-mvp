import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";

const projectContactsOrderBy: Prisma.ProjectContactOrderByWithRelationInput[] = [
  { isGcContact: "desc" },
  { updatedAt: "desc" },
  { name: "asc" },
];

const projectWithRelationsInclude = {
  gcCompany: true,
  contacts: {
    orderBy: projectContactsOrderBy,
  },
} satisfies Prisma.ProjectInclude;

export async function listProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: projectWithRelationsInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getProject({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
    include: projectWithRelationsInclude,
  });
}

export async function listProjectContacts({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  return prisma.projectContact.findMany({
    where: {
      projectId,
      project: {
        organizationId,
      },
    },
    orderBy: projectContactsOrderBy,
  });
}
