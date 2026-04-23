import { z } from "zod";

export const invoiceFollowUpStatusValues = [
  "none",
  "needs_follow_up",
  "in_progress",
  "sent",
  "resolved",
] as const;

export const updateInvoiceFollowUpSchema = z
  .object({
    followUpStatus: z.enum(invoiceFollowUpStatusValues).optional(),
    note: z.string().trim().max(2000).optional(),
  })
  .refine((input) => input.followUpStatus !== undefined || Boolean(input.note), {
    message: "Provide a follow-up status or note.",
  });

export type UpdateInvoiceFollowUpInput = z.infer<typeof updateInvoiceFollowUpSchema>;
