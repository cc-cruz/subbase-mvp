"use client";

import { createAuthClient } from "@neondatabase/auth/next";

let browserAuthClient: ReturnType<typeof createAuthClient> | undefined;

export function getBrowserAuthClient() {
  if (browserAuthClient) {
    return browserAuthClient;
  }

  browserAuthClient = createAuthClient();

  return browserAuthClient;
}
