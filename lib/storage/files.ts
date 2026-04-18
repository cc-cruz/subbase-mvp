import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/client";
import { toSlug } from "@/lib/validation/common";

const metadataOnlyMimeType = "application/vnd.subbase.compliance-record";
const metadataOnlyBucket = "compliance-records";

export async function createMetadataOnlyComplianceFile({
  organizationId,
  uploadedByUserId,
  fileName,
}: {
  organizationId: string;
  uploadedByUserId: string;
  fileName: string;
}) {
  const fileSlug = toSlug(fileName.replace(/\.[^./\\]+$/, "") || fileName);
  const storagePath = [
    "metadata",
    "compliance",
    organizationId,
    `${Date.now()}-${randomUUID()}-${fileSlug}.json`,
  ].join("/");

  return prisma.file.create({
    data: {
      organizationId,
      bucket: metadataOnlyBucket,
      storagePath,
      fileName,
      mimeType: metadataOnlyMimeType,
      sizeBytes: BigInt(0),
      uploadedByUserId,
    },
  });
}
