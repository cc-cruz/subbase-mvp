import "server-only";

import { prisma } from "@/lib/db/client";

export async function listProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      gcCompany: true,
      contacts: true,
    },
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
    include: {
      gcCompany: true,
      contacts: true,
    },
  });
}
