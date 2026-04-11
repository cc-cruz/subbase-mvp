import "server-only";

import { createHash } from "node:crypto";

import { createNeonAuth } from "@neondatabase/auth/next/server";

function getNeonAuthBaseUrl() {
  return (
    process.env.NEON_AUTH_BASE_URL ??
    process.env.NEON_AUTH_URL ??
    "https://example.invalid/neondb/auth"
  );
}

function getNeonAuthCookieSecret() {
  const explicitSecret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (explicitSecret) {
    return explicitSecret;
  }

  return createHash("sha256")
    .update(process.env.ENCRYPTION_KEY ?? "subbase-neon-auth-build-secret")
    .digest("hex");
}

export const auth = createNeonAuth({
  baseUrl: getNeonAuthBaseUrl(),
  cookies: {
    secret: getNeonAuthCookieSecret(),
  },
});
