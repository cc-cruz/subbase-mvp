import { ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import { updateInvoiceFollowUp, updateInvoiceFollowUpSchema } from "@/lib/domain/invoices";

export const PATCH = withRouteErrorHandling(
  async (
    request: Request,
    { params }: { params: Promise<{ orgSlug: string; invoiceId: string }> },
  ) => {
    const { orgSlug, invoiceId } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "invoices:manage",
    });
    const input = updateInvoiceFollowUpSchema.parse(await request.json());
    const invoice = await updateInvoiceFollowUp({
      authorUserId: context.currentUser.user.id,
      input,
      invoiceId,
      organizationId: context.organization.id,
    });

    return ok({ invoice });
  },
);
