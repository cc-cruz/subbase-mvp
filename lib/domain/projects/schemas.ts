import { z } from "zod";

import {
  optionalDateStringSchema,
  optionalEmailSchema,
  optionalSlugSchema,
  optionalTextSchema,
} from "@/lib/validation/common";

export const projectStatusValues = [
  "DRAFT",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const;

export const projectSourceValues = ["MANUAL", "MARKETPLACE", "REPEAT_GC", "REFERRAL"] as const;

export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectSource = (typeof projectSourceValues)[number];

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: optionalSlugSchema,
  status: z.enum(projectStatusValues).default("DRAFT"),
  source: z.enum(projectSourceValues).default("MANUAL"),
  gcCompanyName: optionalTextSchema,
  projectAddress: optionalTextSchema,
  city: optionalTextSchema,
  state: optionalTextSchema,
  postalCode: optionalTextSchema,
  startDate: optionalDateStringSchema,
  endDate: optionalDateStringSchema,
  notes: optionalTextSchema,
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  name: z.string().trim().min(2).max(140).optional(),
});

export const createProjectContactSchema = z.object({
  name: z.string().trim().min(2).max(140),
  companyName: optionalTextSchema,
  email: optionalEmailSchema,
  phone: optionalTextSchema,
  role: optionalTextSchema,
  isGcContact: z.boolean().default(false),
});

export const updateProjectContactSchema = createProjectContactSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateProjectContactInput = z.infer<typeof createProjectContactSchema>;
export type UpdateProjectContactInput = z.infer<typeof updateProjectContactSchema>;
