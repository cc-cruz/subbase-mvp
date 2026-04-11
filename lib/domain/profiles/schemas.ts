import { z } from "zod";

import { optionalEmailSchema, optionalTextSchema } from "@/lib/validation/common";

export const companyProfileInputSchema = z.object({
  legalName: z.string().trim().min(2).max(120),
  displayName: z.string().trim().min(2).max(120),
  dbaName: optionalTextSchema,
  description: optionalTextSchema,
  phone: optionalTextSchema,
  email: optionalEmailSchema,
  websiteUrl: z
    .union([z.string().trim().url(), z.literal("")])
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  serviceArea: z.string().trim().max(240).optional(),
  licenseSummary: optionalTextSchema,
  insuranceSummary: optionalTextSchema,
  marketplaceEnabled: z.boolean().default(false),
});

export type CompanyProfileInput = z.infer<typeof companyProfileInputSchema>;
