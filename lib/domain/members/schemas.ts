import { z } from "zod";

import { organizationRoleValues } from "@/lib/auth/roles";

export const createInternalInvitationSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  role: z.enum(organizationRoleValues),
});

export type CreateInternalInvitationInput = z.infer<typeof createInternalInvitationSchema>;
