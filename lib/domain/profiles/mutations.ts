import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { CompanyProfileInput } from "@/lib/domain/profiles/schemas";

export async function upsertCompanyProfile({
  organizationId,
  input,
}: {
  organizationId: string;
  input: CompanyProfileInput;
}) {
  return prisma.companyProfile.upsert({
    where: { organizationId },
    update: {
      legalName: input.legalName,
      displayName: input.displayName,
      dbaName: input.dbaName,
      description: input.description,
      phone: input.phone,
      email: input.email,
      websiteUrl: input.websiteUrl,
      serviceAreaJson: input.serviceArea ? { summary: input.serviceArea } : Prisma.JsonNull,
      licenseSummary: input.licenseSummary,
      insuranceSummary: input.insuranceSummary,
      marketplaceEnabled: input.marketplaceEnabled,
    },
    create: {
      organizationId,
      legalName: input.legalName,
      displayName: input.displayName,
      dbaName: input.dbaName,
      description: input.description,
      phone: input.phone,
      email: input.email,
      websiteUrl: input.websiteUrl,
      serviceAreaJson: input.serviceArea ? { summary: input.serviceArea } : Prisma.JsonNull,
      licenseSummary: input.licenseSummary,
      insuranceSummary: input.insuranceSummary,
      marketplaceEnabled: input.marketplaceEnabled,
    },
  });
}
