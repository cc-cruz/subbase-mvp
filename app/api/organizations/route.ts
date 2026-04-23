import { created } from "@/lib/api/response";
import { withRouteErrorHandling } from "@/lib/api/route-guard";
import { conflict } from "@/lib/api/errors";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { slugSchema, toSlug } from "@/lib/validation/common";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema.optional(),
});

export const POST = withRouteErrorHandling(async (request: Request) => {
  const { user } = await requireCurrentUser();
  const body = createOrganizationSchema.parse(await request.json());
  const slug = toSlug(body.slug ?? body.name);

  const existing = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    throw conflict("That workspace slug is already taken.");
  }

  const organization = await prisma.$transaction(async (tx) => {
    const createdOrganization = await tx.organization.create({
      data: {
        name: body.name,
        slug,
      },
    });

    await tx.organizationMembership.create({
      data: {
        organizationId: createdOrganization.id,
        userId: user.id,
        role: "ADMIN",
      },
    });

    await tx.companyProfile.create({
      data: {
        organizationId: createdOrganization.id,
        legalName: body.name,
        displayName: body.name,
      },
    });

    return createdOrganization;
  });

  return created({
    organizationId: organization.id,
    organizationSlug: organization.slug,
    redirectPath: `/workspace/${organization.slug}`,
  });
});
