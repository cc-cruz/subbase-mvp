import { z } from "zod";

import { optionalTextSchema, uuidSchema } from "@/lib/validation/common";

export const complianceCategoryValues = [
  "w9",
  "license",
  "insurance",
  "workers_comp",
  "safety_cert",
  "trade_cert",
  "agreement",
  "other",
] as const;

export const complianceAttachmentTargetValues = ["COMPANY", "PROJECT"] as const;

export type ComplianceCategory = (typeof complianceCategoryValues)[number];
export type ComplianceAttachmentTarget = (typeof complianceAttachmentTargetValues)[number];

export const createComplianceDocumentSchema = z
  .object({
    fileName: z.string().trim().min(2).max(180),
    category: z.enum(complianceCategoryValues),
    issueDate: z.string().date(),
    expirationDate: z.string().date(),
    attachmentTarget: z.enum(complianceAttachmentTargetValues),
    projectId: uuidSchema.optional(),
    notes: optionalTextSchema,
  })
  .superRefine((value, context) => {
    if (value.attachmentTarget === "PROJECT" && !value.projectId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick a project for project-level compliance records.",
        path: ["projectId"],
      });
    }

    if (value.expirationDate < value.issueDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiration date must be on or after the issue date.",
        path: ["expirationDate"],
      });
    }
  });

export type CreateComplianceDocumentInput = z.infer<typeof createComplianceDocumentSchema>;
