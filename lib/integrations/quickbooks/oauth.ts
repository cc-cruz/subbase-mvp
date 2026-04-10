import "server-only";

import { randomUUID } from "node:crypto";

import { ApiError, badRequest } from "@/lib/api/errors";
import { getEnv } from "@/lib/env";
import {
  QUICKBOOKS_AUTHORIZE_URL,
  QUICKBOOKS_SCOPE,
  QUICKBOOKS_TOKEN_URL,
} from "@/lib/integrations/quickbooks/constants";
import { sealJson, unsealJson } from "@/lib/security/crypto";

type QuickBooksOAuthState = {
  issuedAt: number;
  nonce: string;
  orgSlug: string;
  returnTo: string;
  userId: string;
};

type QuickBooksTokenResponseBody = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  refresh_token?: string;
  token_type?: string;
  x_refresh_token_expires_in?: number;
};

export type QuickBooksTokenResponse = {
  accessToken: string;
  expiresAt: Date;
  raw: QuickBooksTokenResponseBody;
  refreshToken: string;
  refreshTokenExpiresAt: Date | null;
};

const QUICKBOOKS_STATE_TTL_MS = 10 * 60 * 1000;

function getQuickBooksBasicAuthHeader() {
  const env = getEnv();

  return `Basic ${Buffer.from(`${env.INTUIT_CLIENT_ID}:${env.INTUIT_CLIENT_SECRET}`).toString("base64")}`;
}

function buildQuickBooksTokenExpiry(expiresInSeconds?: number) {
  if (!expiresInSeconds || Number.isNaN(expiresInSeconds)) {
    return null;
  }

  return new Date(Date.now() + expiresInSeconds * 1000);
}

async function readQuickBooksTokenResponse(response: Response) {
  let payload: QuickBooksTokenResponseBody | null = null;

  try {
    payload = (await response.json()) as QuickBooksTokenResponseBody;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.access_token || !payload.refresh_token || !payload.expires_in) {
    const message =
      payload?.error_description ??
      payload?.error ??
      "QuickBooks did not return a usable token response.";

    throw new ApiError("bad_request", message, response.status || 400, payload);
  }

  return {
    accessToken: payload.access_token,
    expiresAt: buildQuickBooksTokenExpiry(payload.expires_in) ?? new Date(Date.now() + 3600 * 1000),
    raw: payload,
    refreshToken: payload.refresh_token,
    refreshTokenExpiresAt: buildQuickBooksTokenExpiry(payload.x_refresh_token_expires_in),
  } satisfies QuickBooksTokenResponse;
}

export function createQuickBooksOAuthState(input: Omit<QuickBooksOAuthState, "issuedAt" | "nonce">) {
  const nonce = randomUUID();

  return {
    nonce,
    state: sealJson<QuickBooksOAuthState>({
      ...input,
      issuedAt: Date.now(),
      nonce,
    }),
  };
}

export function parseQuickBooksOAuthState(value: string) {
  const payload = unsealJson<QuickBooksOAuthState>(value);

  if (!payload.issuedAt || Date.now() - payload.issuedAt > QUICKBOOKS_STATE_TTL_MS) {
    throw badRequest("The QuickBooks connection request has expired.");
  }

  return payload;
}

export function buildQuickBooksAuthorizationUrl({ state }: { state: string }) {
  const env = getEnv();
  const params = new URLSearchParams({
    client_id: env.INTUIT_CLIENT_ID,
    redirect_uri: env.INTUIT_REDIRECT_URI,
    response_type: "code",
    scope: QUICKBOOKS_SCOPE,
    state,
  });

  return `${QUICKBOOKS_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeQuickBooksAuthorizationCode(code: string) {
  const env = getEnv();
  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: env.INTUIT_REDIRECT_URI,
  });

  const response = await fetch(QUICKBOOKS_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: getQuickBooksBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  return readQuickBooksTokenResponse(response);
}

export async function refreshQuickBooksAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(QUICKBOOKS_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: getQuickBooksBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  return readQuickBooksTokenResponse(response);
}
