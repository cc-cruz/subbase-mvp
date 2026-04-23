"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function InvoiceSyncButton({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setMessage(null);

          startTransition(async () => {
            const response = await fetch(`/api/orgs/${orgSlug}/invoices`, {
              method: "POST",
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
              setError(payload?.error?.message ?? "Unable to sync QuickBooks invoices.");
              return;
            }

            const syncedCount = payload?.sync?.syncedCount;
            setMessage(
              typeof syncedCount === "number"
                ? `Synced ${syncedCount} QuickBooks invoices.`
                : "QuickBooks invoice sync finished.",
            );
            router.refresh();
          });
        }}
      >
        {isPending ? "Syncing..." : "Sync QuickBooks invoices"}
      </Button>

      {message ? <p className="text-right text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-right text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
