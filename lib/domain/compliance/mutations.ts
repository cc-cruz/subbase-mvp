import "server-only";

import { badRequest, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/db/client";
import type { CreateComplianceDocumentInput } from "@/lib/domain/compliance/schemas";
import { serializeComplianceAttachmentRole } from "@/lib/domain/compliance/queries";
import { createMetadataOnlyComplianceFile } from "@/lib/storage/files";

export async function createComplianceDocument({
  organizationId,
  createdByUserId,
  input,
}: {
  organizationId: string;
  createdByUserId: string;
  input: CreateComplianceDocumentInput;
}) {
  const entityId =
    input.attachmentTarget === "COMPANY"
      ? organizationId
      : await validateProjectTarget({
          organizationId,
          projectId: input.projectId,
        });

  const file = await createMetadataOnlyComplianceFile({
    organizationId,
    uploadedByUserId: createdByUserId,
    fileName: input.fileName,
  });

  const attachment = await prisma.fileAttachment.create({
    data: {
      organizationId,
      fileId: file.id,
      entityType: input.attachmentTarget === "COMPANY" ? "ORGANIZATION" : "PROJECT",
      entityId,
      attachmentRole: serializeComplianceAttachmentRole({
        category: input.category,
        issueDate: input.issueDate,
        expirationDate: input.expirationDate,
        notes: input.notes,
      }),
      createdByUserId,
    },
  });

  return {
    id: attachment.id,
    fileId: file.id,
    fileName: file.fileName,
    category: input.category,
    issueDate: input.issueDate,
    expirationDate: input.expirationDate,
    notes: input.notes ?? null,
    attachmentTarget: input.attachmentTarget,
    projectId: input.attachmentTarget === "PROJECT" ? entityId : null,
    createdAt: attachment.createdAt.toISOString(),
  };
}

async function validateProjectTarget({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId?: string;
}) {
  if (!projectId) {
    throw badRequest("Pick a project for project-level compliance records.");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw notFound("Project target not found.");
  }

  return project.id;
}
