import "server-only";

import { z } from "zod";

function trimEnvValue(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function trimmed<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return z.preprocess(trimEnvValue, schema);
}

function optionalTrimmed<TSchema extends z.ZodTypeAny>(schema: TSchema) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, schema.optional());
}

const senderAddressSchema = trimmed(
  z.string().min(1).refine((value) => {
    const addressMatch = value.match(/<([^<>]+)>$/);
    const address = addressMatch?.[1]?.trim() ?? value;

    return z.string().email().safeParse(address).success;
  }, "Invalid email"),
);

const serverEnvSchema = z
  .object({
    APP_ENV: trimmed(z.enum(["local", "preview", "production"])),
    NEXT_PUBLIC_APP_URL: trimmed(z.string().url()),
    NEON_AUTH_BASE_URL: optionalTrimmed(z.string().url()),
    NEON_AUTH_URL: optionalTrimmed(z.string().url()),
    NEON_AUTH_COOKIE_SECRET: optionalTrimmed(z.string().min(32)),
    DATABASE_URL: trimmed(z.string().min(1)),
    DIRECT_URL: optionalTrimmed(z.string().min(1)),
    RESEND_API_KEY: trimmed(z.string().min(1)),
    RESEND_FROM_EMAIL: senderAddressSchema,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: trimmed(z.string().min(1)),
    STRIPE_SECRET_KEY: trimmed(z.string().min(1)),
    STRIPE_WEBHOOK_SECRET: trimmed(z.string().min(1)),
    STRIPE_PRICE_STARTER: trimmed(z.string().min(1)),
    STRIPE_PRICE_PROFESSIONAL: trimmed(z.string().min(1)),
    STRIPE_PRICE_BUSINESS: trimmed(z.string().min(1)),
    INTUIT_CLIENT_ID: trimmed(z.string().min(1)),
    INTUIT_CLIENT_SECRET: trimmed(z.string().min(1)),
    INTUIT_REDIRECT_URI: trimmed(z.string().url()),
    INTUIT_ENVIRONMENT: trimmed(z.enum(["sandbox", "production"])),
    ENCRYPTION_KEY: trimmed(z.string().min(16)),
    LOG_LEVEL: trimmed(z.enum(["debug", "info", "warn", "error"])).default("info"),
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
