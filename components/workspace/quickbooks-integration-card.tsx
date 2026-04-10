import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuickBooksIntegrationCardProps = {
  canManage: boolean;
  integration: {
    lastSyncedAt: Date | null;
    realmId: string | null;
    status: string;
    tokenExpiresAt: Date | null;
    updatedAt: Date;
  } | null;
  orgSlug: string;
  statusReason?: string | null;
  statusResult?: string | null;
};

const statusLabels: Record<string, string> = {
  active: "Connected",
  disconnected: "Disconnected",
  needs_reauth: "Reconnect required",
};

const statusMessages: Record<string, string> = {
  connected: "QuickBooks connected. Tokens are now stored on the workspace.",
  disconnected: "QuickBooks disconnected for this workspace.",
  error: "QuickBooks connection failed. Review the reason below and try again.",
};

const reasonMessages: Record<string, string> = {
  access_denied: "The QuickBooks user declined the authorization request.",
  invalid_grant: "Intuit rejected the code or refresh token. Reconnect the workspace.",
  invalid_state: "The QuickBooks callback could not be verified. Start the connection again.",
  missing_code: "QuickBooks returned without an authorization code.",
  missing_realm: "QuickBooks returned without a company identifier.",
  session_required:
    "Your workspace session expired during the connection flow. Sign back in and reconnect.",
};

function formatTimestamp(value: Date | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function QuickBooksIntegrationCard({
  canManage,
  integration,
  orgSlug,
  statusReason,
  statusResult,
}: QuickBooksIntegrationCardProps) {
  const connectionHref = `/api/orgs/${orgSlug}/integrations/quickbooks/connect?returnTo=${encodeURIComponent(`/workspace/${orgSlug}/settings/company`)}`;
  const isConnected = integration?.status === "active";
  const statusLabel = statusLabels[integration?.status ?? "disconnected"] ?? "Not connected";
  const message = statusResult ? statusMessages[statusResult] : null;
  const reasonMessage = statusReason ? reasonMessages[statusReason] ?? null : null;

  return (
    <Card className="border-4 border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>QuickBooks Online</CardTitle>
          <CardDescription>
            This will back the first invoice and accounting sync surface. For now,
            the integration only stores the connection and token lifecycle.
          </CardDescription>
        </div>
        <Badge variant={isConnected ? "default" : "outline"}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {reasonMessage ? <p className="text-sm text-destructive">{reasonMessage}</p> : null}

        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1 rounded-none border-2 border-border bg-muted/30 p-3">
            <dt className="font-semibold">Realm ID</dt>
            <dd className="text-muted-foreground">{integration?.realmId ?? "Not connected"}</dd>
          </div>
          <div className="space-y-1 rounded-none border-2 border-border bg-muted/30 p-3">
            <dt className="font-semibold">Access token expiry</dt>
            <dd className="text-muted-foreground">
              {formatTimestamp(integration?.tokenExpiresAt ?? null)}
            </dd>
          </div>
          <div className="space-y-1 rounded-none border-2 border-border bg-muted/30 p-3">
            <dt className="font-semibold">Last sync</dt>
            <dd className="text-muted-foreground">
              {formatTimestamp(integration?.lastSyncedAt ?? null)}
            </dd>
          </div>
          <div className="space-y-1 rounded-none border-2 border-border bg-muted/30 p-3">
            <dt className="font-semibold">Integration updated</dt>
            <dd className="text-muted-foreground">
              {formatTimestamp(integration?.updatedAt ?? null)}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-3">
        {canManage ? (
          <>
            <Button asChild size="lg">
              <a href={connectionHref}>{isConnected ? "Reconnect QuickBooks" : "Connect QuickBooks"}</a>
            </Button>
            <form action={`/api/orgs/${orgSlug}/integrations/quickbooks/disconnect`} method="post">
              <Button type="submit" size="lg" variant="outline" disabled={!integration}>
                Disconnect
              </Button>
            </form>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only workspace admins can manage this connection.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
