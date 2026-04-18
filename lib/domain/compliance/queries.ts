import "server-only";

import { prisma } from "@/lib/db/client";

import type {
  ComplianceAttachmentTarget,
  ComplianceCategory,
} from "@/lib/domain/compliance/schemas";

const complianceAttachmentRolePrefix = "COMPLIANCE_V1:";

type ComplianceAttachmentMetadata = {
  category: ComplianceCategory;
  issueDate: string;
  expirationDate: string;
  notes?: string;
};

function parseComplianceAttachmentRole(value: string): ComplianceAttachmentMetadata | null {
  if (!value.startsWith(complianceAttachmentRolePrefix)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      value.slice(complianceAttachmentRolePrefix.length),
    ) as ComplianceAttachmentMetadata;

    if (
      typeof parsed.category !== "string" ||
      typeof parsed.issueDate !== "string" ||
      typeof parsed.expirationDate !== "string"
    ) {
      return null;
    }

    return {
      category: parsed.category,
      issueDate: parsed.issueDate,
      expirationDate: parsed.expirationDate,
      notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
    };
  } catch {
    return null;
  }
}

export function serializeComplianceAttachmentRole(metadata: ComplianceAttachmentMetadata) {
  return `${complianceAttachmentRolePrefix}${JSON.stringify(metadata)}`;
}

export async function listComplianceDocuments(organizationId: string) {
  const attachments = await prisma.fileAttachment.findMany({
    where: {
      organizationId,
      attachmentRole: {
        startsWith: complianceAttachmentRolePrefix,
      },
      entityType: {
        in: ["ORGANIZATION", "PROJECT"],
      },
    },
    include: {
      file: true,
      createdByUser: {
        select: {
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

  const projectIds = attachments
    .filter((attachment) => attachment.entityType === "PROJECT")
    .map((attachment) => attachment.entityId);

  const projectsById = new Map(
    (
      await prisma.project.findMany({
        where: {
          organizationId,
          id: {
            in: projectIds,
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
    ).map((project) => [project.id, project]),
  );

  return attachments.flatMap((attachment) => {
    const metadata = parseComplianceAttachmentRole(attachment.attachmentRole);

    if (!metadata) {
      return [];
    }

    const targetType = attachment.entityType as ComplianceAttachmentTarget;
    const project =
      targetType === "PROJECT" ? projectsById.get(attachment.entityId) ?? null : null;

    return [
      {
        id: attachment.id,
        fileId: attachment.fileId,
        fileName: attachment.file.fileName,
        category: metadata.category,
        issueDate: metadata.issueDate,
        expirationDate: metadata.expirationDate,
        notes: metadata.notes ?? null,
        attachmentTarget: targetType,
        projectId: targetType === "PROJECT" ? attachment.entityId : null,
        projectName: project?.name ?? null,
        projectSlug: project?.slug ?? null,
        createdAt: attachment.createdAt.toISOString(),
        createdBy:
          [attachment.createdByUser.firstName, attachment.createdByUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || attachment.createdByUser.email,
      },
    ];
  });
}

export async function listComplianceProjects(organizationId: string) {
  return prisma.project.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
