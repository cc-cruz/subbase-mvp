import { NextResponse } from "next/server";

import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { QUICKBOOKS_OAUTH_STATE_COOKIE } from "@/lib/integrations/quickbooks/constants";
import {
  buildQuickBooksAuthorizationUrl,
  createQuickBooksOAuthState,
} from "@/lib/integrations/quickbooks/oauth";

export const runtime = "nodejs";

function getReturnTo(orgSlug: string, value: string | null) {
  if (!value || !value.startsWith(`/workspace/${orgSlug}`)) {
    return `/workspace/${orgSlug}/settings/company`;
  }

  return value;
}

export const GET = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "integrations:manage",
    });
    const url = new URL(request.url);
    const returnTo = getReturnTo(orgSlug, url.searchParams.get("returnTo"));
    const { nonce, state } = createQuickBooksOAuthState({
      orgSlug,
      returnTo,
      userId: context.currentUser.user.id,
    });
    const response = NextResponse.redirect(buildQuickBooksAuthorizationUrl({ state }));

    response.cookies.set({
      httpOnly: true,
      maxAge: 10 * 60,
      name: QUICKBOOKS_OAUTH_STATE_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: url.protocol === "https:",
      value: nonce,
    });

    return response;
  },
);
