import "server-only";

import { prisma } from "@/lib/db/client";
import type {
  CreateProjectContactInput,
  CreateProjectInput,
  UpdateProjectContactInput,
  UpdateProjectInput,
} from "@/lib/domain/projects/schemas";
import { badRequest, conflict, notFound } from "@/lib/api/errors";
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

async function getProjectForMutation({
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
    },
  });
}

function resolveProjectContactCompanyName({
  requestedCompanyName,
  isGcContact,
  gcCompanyName,
  currentCompanyName,
}: {
  requestedCompanyName?: string;
  isGcContact: boolean;
  gcCompanyName?: string | null;
  currentCompanyName?: string;
}) {
  if (isGcContact) {
    if (!gcCompanyName) {
      throw badRequest("Link a GC company to the project before marking a contact as the GC contact.");
    }

    return gcCompanyName;
  }

  const companyName = requestedCompanyName ?? currentCompanyName;

  if (!companyName) {
    throw badRequest("Company name is required for project contacts.");
  }

  return companyName;
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
  const existing = await getProjectForMutation({
    organizationId,
    projectId,
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

  return prisma.$transaction(async (tx) => {
    await tx.project.update({
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

    if (input.gcCompanyName !== undefined) {
      if (gcCompany?.name) {
        await tx.projectContact.updateMany({
          where: {
            projectId: existing.id,
            isGcContact: true,
          },
          data: {
            companyName: gcCompany.name,
          },
        });
      } else {
        await tx.projectContact.updateMany({
          where: {
            projectId: existing.id,
            isGcContact: true,
          },
          data: {
            isGcContact: false,
          },
        });
      }
    }

    const updatedProject = await tx.project.findUnique({
      where: { id: existing.id },
      include: {
        gcCompany: true,
        contacts: {
          orderBy: [{ isGcContact: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
        },
      },
    });

    if (!updatedProject) {
      throw notFound("Project not found.");
    }

    return updatedProject;
  });
}

export async function createProjectContact({
  organizationId,
  projectId,
  input,
}: {
  organizationId: string;
  projectId: string;
  input: CreateProjectContactInput;
}) {
  const project = await getProjectForMutation({
    organizationId,
    projectId,
  });

  if (!project) {
    throw notFound("Project not found.");
  }

  return prisma.projectContact.create({
    data: {
      projectId: project.id,
      name: input.name,
      companyName: resolveProjectContactCompanyName({
        requestedCompanyName: input.companyName,
        isGcContact: input.isGcContact,
        gcCompanyName: project.gcCompany?.name,
      }),
      email: input.email,
      phone: input.phone,
      role: input.role,
      isGcContact: input.isGcContact,
    },
  });
}

export async function updateProjectContact({
  organizationId,
  projectId,
  contactId,
  input,
}: {
  organizationId: string;
  projectId: string;
  contactId: string;
  input: UpdateProjectContactInput;
}) {
  const existing = await prisma.projectContact.findFirst({
    where: {
      id: contactId,
      projectId,
      project: {
        organizationId,
      },
    },
    include: {
      project: {
        include: {
          gcCompany: true,
        },
      },
    },
  });

  if (!existing) {
    throw notFound("Project contact not found.");
  }

  const isGcContact = input.isGcContact ?? existing.isGcContact;

  return prisma.projectContact.update({
    where: {
      id: existing.id,
    },
    data: {
      name: input.name,
      companyName: resolveProjectContactCompanyName({
        requestedCompanyName: input.companyName,
        currentCompanyName: existing.companyName,
        isGcContact,
        gcCompanyName: existing.project.gcCompany?.name,
      }),
      email: input.email,
      phone: input.phone,
      role: input.role,
      isGcContact,
    },
  });
}

export async function deleteProjectContact({
  organizationId,
  projectId,
  contactId,
}: {
  organizationId: string;
  projectId: string;
  contactId: string;
}) {
  const existing = await prisma.projectContact.findFirst({
    where: {
      id: contactId,
      projectId,
      project: {
        organizationId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw notFound("Project contact not found.");
  }

  await prisma.projectContact.delete({
    where: {
      id: existing.id,
    },
  });
}
