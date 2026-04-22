import { InvoicePreviewList } from "@/components/invoices/invoice-preview-list";
import { InvoiceReadinessCard } from "@/components/invoices/invoice-readiness-card";
import { InvoiceSyncButton } from "@/components/invoices/invoice-sync-button";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { getInvoiceModuleReadiness, listPersistedInvoices } from "@/lib/domain/invoices";

export default async function WorkspaceInvoicesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({
    orgSlug,
    permission: "invoices:view",
  });
  const [readiness, persistedInvoices] = await Promise.all([
    getInvoiceModuleReadiness(context.organization.id),
    listPersistedInvoices(context.organization.id),
  ]);

  return (
    <div className="space-y-6">
      <InvoiceReadinessCard
        quickBooks={readiness.quickBooks}
        previewState={readiness.previewState}
        previewMessage={readiness.previewMessage}
        previewError={readiness.previewError}
        dependencyForRealSync={readiness.dependencyForRealSync}
      />

      {context.permissions.includes("invoices:manage") ? (
        <div className="flex justify-end">
          <InvoiceSyncButton orgSlug={orgSlug} />
        </div>
      ) : null}

      <InvoicePreviewList
        persistedItems={persistedInvoices}
        previewItems={readiness.items}
        totalCount={readiness.totalCount}
        previewState={readiness.previewState}
      />
    </div>
  );
}
