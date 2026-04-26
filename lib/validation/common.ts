import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.");

export const optionalSlugSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  },
  slugSchema.optional(),
);

export const optionalDateStringSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  },
  z.string().date().optional(),
);

export const optionalTextSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .union([z.string().max(2000), z.literal("")])
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
);

export const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .union([z.string().email(), z.literal("")])
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
);

export function toSlug(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug.length > 0 ? slug : "workspace";
}
