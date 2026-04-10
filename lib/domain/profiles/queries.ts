import "server-only";

import { prisma } from "@/lib/db/client";

export async function getCompanyProfile(organizationId: string) {
  return prisma.companyProfile.findUnique({
    where: { organizationId },
  });
}
