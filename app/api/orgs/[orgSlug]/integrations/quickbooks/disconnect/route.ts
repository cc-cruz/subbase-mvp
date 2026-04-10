import { NextResponse } from "next/server";

import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { disconnectQuickBooksIntegration } from "@/lib/domain/integrations/quickbooks";

export const runtime = "nodejs";

export const POST = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "integrations:manage",
    });

    await disconnectQuickBooksIntegration(context.organization.id);

    return NextResponse.redirect(
      new URL(`/workspace/${orgSlug}/settings/company?qbo=disconnected`, request.url),
      { status: 303 },
    );
  },
);
