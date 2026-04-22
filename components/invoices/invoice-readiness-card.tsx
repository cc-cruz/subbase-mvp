import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type InvoiceReadinessCardProps = {
  quickBooks: {
    connected: boolean;
    status: string | null;
    realmId: string | null;
    tokenExpiresAt: string | null;
    lastSyncedAt: string | null;
    updatedAt: string | null;
  };
  previewState:
    | "not_connected"
    | "needs_reauth"
    | "connection_ready"
    | "read_only_preview"
    | "preview_error";
  previewMessage: string;
  previewError: string | null;
  dependencyForRealSync: string;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusVariant(status: InvoiceReadinessCardProps["previewState"]) {
  switch (status) {
    case "read_only_preview":
      return "default" as const;
    case "preview_error":
    case "needs_reauth":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function InvoiceReadinessCard({
  quickBooks,
  previewState,
  previewMessage,
  previewError,
  dependencyForRealSync,
}: InvoiceReadinessCardProps) {
  return (
    <Card className="border-4 border-border">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Invoice Module Readiness</CardTitle>
          <Badge variant={getStatusVariant(previewState)}>{previewState.replaceAll("_", " ")}</Badge>
        </div>
        <CardDescription>
          This slice stays honest: it surfaces QuickBooks connection truth first and
          only shows a live invoice preview when that can be done read-only without a
          new shared contract.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border-2 border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Connection
            </p>
            <p className="mt-2 text-lg font-semibold">
              {quickBooks.connected ? "Connected" : "Not connected"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: {quickBooks.status ?? "none"}
            </p>
          </div>

          <div className="rounded-xl border-2 border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Last sync
            </p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(quickBooks.lastSyncedAt)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No invoice import job exists yet in this repo.
            </p>
          </div>

          <div className="rounded-xl border-2 border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Token expires
            </p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(quickBooks.tokenExpiresAt)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Realm: {quickBooks.realmId ?? "not available"}
            </p>
          </div>

          <div className="rounded-xl border-2 border-border bg-background px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Integration record
            </p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(quickBooks.updatedAt)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Latest saved QuickBooks state in SubBase.</p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-background px-4 py-4">
          <p className="font-semibold">Current invoice surface</p>
          <p className="mt-1 text-sm text-muted-foreground">{previewMessage}</p>
          {previewError ? <p className="mt-2 text-sm text-destructive">{previewError}</p> : null}
        </div>

        <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-4">
          <p className="font-semibold">Minimal dependency for real invoice visibility</p>
          <p className="mt-1 text-sm text-muted-foreground">{dependencyForRealSync}</p>
        </div>
      </CardContent>
    </Card>
  );
}
