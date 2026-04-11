import "server-only";

import { z } from "zod";

const serverEnvSchema = z
  .object({
    APP_ENV: z.enum(["local", "preview", "production"]),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEON_AUTH_BASE_URL: z.string().url().optional(),
    NEON_AUTH_URL: z.string().url().optional(),
    NEON_AUTH_COOKIE_SECRET: z.string().min(32).optional(),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z.string().email(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRICE_STARTER: z.string().min(1),
    STRIPE_PRICE_PROFESSIONAL: z.string().min(1),
    STRIPE_PRICE_BUSINESS: z.string().min(1),
    INTUIT_CLIENT_ID: z.string().min(1),
    INTUIT_CLIENT_SECRET: z.string().min(1),
    INTUIT_REDIRECT_URI: z.string().url(),
    INTUIT_ENVIRONMENT: z.enum(["sandbox", "production"]),
    ENCRYPTION_KEY: z.string().min(16),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  })
  .superRefine((value, context) => {
    if (!value.NEON_AUTH_BASE_URL && !value.NEON_AUTH_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide NEON_AUTH_BASE_URL or NEON_AUTH_URL.",
        path: ["NEON_AUTH_BASE_URL"],
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = serverEnvSchema.parse({
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
    NEON_AUTH_URL: process.env.NEON_AUTH_URL,
    NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_STARTER: process.env.STRIPE_PRICE_STARTER,
    STRIPE_PRICE_PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
    STRIPE_PRICE_BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
    INTUIT_CLIENT_ID: process.env.INTUIT_CLIENT_ID,
    INTUIT_CLIENT_SECRET: process.env.INTUIT_CLIENT_SECRET,
    INTUIT_REDIRECT_URI: process.env.INTUIT_REDIRECT_URI,
    INTUIT_ENVIRONMENT: process.env.INTUIT_ENVIRONMENT,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  });

  return cachedEnv;
}
