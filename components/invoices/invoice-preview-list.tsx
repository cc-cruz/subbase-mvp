import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/workspace/empty-state";
import type { ReadOnlyInvoicePreviewItem } from "@/lib/domain/invoices/queries";

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "USD",
  }).format(value);
}

const statusLabelMap: Record<ReadOnlyInvoicePreviewItem["statusLabel"], string> = {
  paid: "Paid",
  partially_paid: "Partially paid",
  open: "Open",
};

type InvoicePreviewListProps = {
  items: ReadOnlyInvoicePreviewItem[];
  totalCount: number | null;
  previewState:
    | "not_connected"
    | "needs_reauth"
    | "connection_ready"
    | "read_only_preview"
    | "preview_error";
};

export function InvoicePreviewList({
  items,
  totalCount,
  previewState,
}: InvoicePreviewListProps) {
  if (previewState !== "read_only_preview") {
    return (
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Invoice preview</CardTitle>
          <CardDescription>
            No live invoice rows are shown until the QuickBooks preview path is
            confirmed safe in this environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Read-only invoice preview not available yet"
            description="This workspace is still at the invoice-readiness stage. Once QuickBooks preview succeeds, live invoice rows will render here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-4 border-border">
      <CardHeader>
        <CardTitle>QuickBooks invoice preview</CardTitle>
        <CardDescription>
          Read-only preview of the first {items.length}
          {typeof totalCount === "number" ? ` of ${totalCount}` : ""} invoices returned
          directly from QuickBooks. This does not persist follow-up state inside
          SubBase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="No invoices returned"
            description="QuickBooks is connected, but the preview query did not return any invoices in the first page."
          />
        ) : (
          <div className="grid gap-3">
            {items.map((invoice) => (
              <div
                key={invoice.externalId}
                className="rounded-xl border-2 border-border bg-background px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <Badge variant={invoice.statusLabel === "paid" ? "secondary" : "outline"}>
                        {statusLabelMap[invoice.statusLabel]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Txn date {formatDate(invoice.txnDate)}</span>
                      <span>Due {formatDate(invoice.dueDate)}</span>
                    </div>
                    {invoice.note ? <p className="text-sm">{invoice.note}</p> : null}
                  </div>

                  <div className="min-w-[180px] space-y-1 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Balance</span>
                      <span className="font-medium">
                        {formatCurrency(invoice.balance, invoice.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">QuickBooks update</span>
                      <span className="text-right">
                        {invoice.quickBooksUpdatedAt
                          ? new Intl.DateTimeFormat("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(invoice.quickBooksUpdatedAt))
                          : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
