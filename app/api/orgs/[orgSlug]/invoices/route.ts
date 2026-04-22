import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { getInvoiceModuleReadiness } from "@/lib/domain/invoices";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "invoices:view",
    });
    const readiness = await getInvoiceModuleReadiness(context.organization.id);

    return ok(readiness);
  },
);
