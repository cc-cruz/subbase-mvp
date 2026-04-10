import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getActiveMembershipForOrganization } from "@/lib/auth/memberships";
import { asOrganizationRole, roleHasPermission } from "@/lib/auth/roles";
import { requireCurrentUser } from "@/lib/auth/session";
import { upsertQuickBooksIntegration } from "@/lib/domain/integrations/quickbooks";
import { QUICKBOOKS_OAUTH_STATE_COOKIE } from "@/lib/integrations/quickbooks/constants";
import {
  exchangeQuickBooksAuthorizationCode,
  parseQuickBooksOAuthState,
} from "@/lib/integrations/quickbooks/oauth";

export const runtime = "nodejs";

function buildRedirectResponse(
  origin: string,
  returnTo: string,
  result: "connected" | "error",
  reason?: string,
) {
  const redirectUrl = new URL(returnTo, origin);

  redirectUrl.searchParams.set("qbo", result);

  if (reason) {
    redirectUrl.searchParams.set("reason", reason);
  }

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({
    maxAge: 0,
    name: QUICKBOOKS_OAUTH_STATE_COOKIE,
    path: "/",
    value: "",
  });

  return response;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const realmId = requestUrl.searchParams.get("realmId");
  const stateValue = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const cookieNonce = cookieStore.get(QUICKBOOKS_OAUTH_STATE_COOKIE)?.value;

  if (!stateValue) {
    return buildRedirectResponse(requestUrl.origin, "/workspace", "error", "invalid_state");
  }

  let state;

  try {
    state = parseQuickBooksOAuthState(stateValue);
  } catch {
    return buildRedirectResponse(requestUrl.origin, "/workspace", "error", "invalid_state");
  }

  if (!cookieNonce || cookieNonce !== state.nonce) {
    return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "invalid_state");
  }

  if (error) {
    return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", error);
  }

  if (!code) {
    return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "missing_code");
  }

  if (!realmId) {
    return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "missing_realm");
  }

  try {
    const currentUser = await requireCurrentUser();

    if (currentUser.user.id !== state.userId) {
      return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "session_required");
    }

    const membership = await getActiveMembershipForOrganization({
      orgSlug: state.orgSlug,
      userId: currentUser.user.id,
    });

    if (!membership) {
      return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "session_required");
    }

    if (!roleHasPermission(asOrganizationRole(membership.role), "integrations:manage")) {
      return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", "session_required");
    }

    const tokenResponse = await exchangeQuickBooksAuthorizationCode(code);

    await upsertQuickBooksIntegration({
      organizationId: membership.organization.id,
      realmId,
      tokenResponse,
    });

    return buildRedirectResponse(requestUrl.origin, state.returnTo, "connected");
  } catch (error) {
    const reason =
      error instanceof Error && error.message.toLowerCase().includes("invalid_grant")
        ? "invalid_grant"
        : undefined;

    return buildRedirectResponse(requestUrl.origin, state.returnTo, "error", reason);
  }
}
