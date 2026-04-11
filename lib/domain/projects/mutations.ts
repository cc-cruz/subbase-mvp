import "server-only";

import { prisma } from "@/lib/db/client";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/domain/projects/schemas";
import { conflict, notFound } from "@/lib/api/errors";
import { toSlug } from "@/lib/validation/common";

async function ensureProjectSlug({
  organizationId,
  requestedSlug,
  name,
  excludeProjectId,
}: {
  organizationId: string;
  requestedSlug?: string;
  name: string;
  excludeProjectId?: string;
}) {
  const baseSlug = toSlug(requestedSlug ?? name);
  let candidate = baseSlug;
  let iteration = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug: candidate,
        },
      },
      select: { id: true },
    });

    if (!existing || existing.id === excludeProjectId) {
      return candidate;
    }

    iteration += 1;
    candidate = `${baseSlug}-${iteration}`;
  }
}

async function findOrCreateGcCompany({
  organizationId,
  gcCompanyName,
}: {
  organizationId: string;
  gcCompanyName?: string;
}) {
  if (!gcCompanyName) {
    return null;
  }

  const existing = await prisma.gcCompany.findFirst({
    where: {
      organization: {
        is: {
          id: organizationId,
        },
      },
      name: gcCompanyName,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.gcCompany.create({
    data: {
      name: gcCompanyName,
      organization: {
        connect: {
          id: organizationId,
        },
      },
    },
  });
}

export async function createProject({
  organizationId,
  input,
}: {
  organizationId: string;
  input: CreateProjectInput;
}) {
  const slug = await ensureProjectSlug({
    organizationId,
    requestedSlug: input.slug,
    name: input.name,
  });
  const gcCompany = await findOrCreateGcCompany({
    organizationId,
    gcCompanyName: input.gcCompanyName,
  });

  try {
    return await prisma.project.create({
      data: {
        organizationId,
        gcCompanyId: gcCompany?.id,
        name: input.name,
        slug,
        status: input.status,
        source: input.source,
        projectAddress: input.projectAddress,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        notes: input.notes,
      },
    });
  } catch (error) {
    throw conflict("Unable to create project.", error);
  }
}

export async function updateProject({
  organizationId,
  projectId,
  input,
}: {
  organizationId: string;
  projectId: string;
  input: UpdateProjectInput;
}) {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
  });

  if (!existing) {
    throw notFound("Project not found.");
  }

  const slug =
    input.slug || input.name
      ? await ensureProjectSlug({
          organizationId,
          requestedSlug: input.slug ?? existing.slug,
          name: input.name ?? existing.name,
          excludeProjectId: existing.id,
        })
      : existing.slug;

  const gcCompany =
    input.gcCompanyName !== undefined
      ? await findOrCreateGcCompany({
          organizationId,
          gcCompanyName: input.gcCompanyName,
        })
      : undefined;

  return prisma.project.update({
    where: { id: existing.id },
    data: {
      gcCompanyId: gcCompany ? gcCompany.id : input.gcCompanyName === undefined ? undefined : null,
      name: input.name,
      slug,
      status: input.status,
      source: input.source,
      projectAddress: input.projectAddress,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      startDate: input.startDate ? new Date(input.startDate) : input.startDate === undefined ? undefined : null,
      endDate: input.endDate ? new Date(input.endDate) : input.endDate === undefined ? undefined : null,
      notes: input.notes,
    },
  });
}
