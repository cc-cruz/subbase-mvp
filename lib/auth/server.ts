import "server-only";

import { createHash } from "node:crypto";

import { createNeonAuth } from "@neondatabase/auth/next/server";

import { getEnv } from "@/lib/env";

function getNeonAuthBaseUrl() {
  const env = getEnv();

  return env.NEON_AUTH_BASE_URL ?? env.NEON_AUTH_URL ?? "";
}

function getNeonAuthCookieSecret() {
  const env = getEnv();

  if (env.NEON_AUTH_COOKIE_SECRET) {
    return env.NEON_AUTH_COOKIE_SECRET;
  }

  return createHash("sha256").update(env.ENCRYPTION_KEY).digest("hex");
}

export const auth = createNeonAuth({
  baseUrl: getNeonAuthBaseUrl(),
  cookies: {
    secret: getNeonAuthCookieSecret(),
  },
});
