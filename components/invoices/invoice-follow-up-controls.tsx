"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const followUpStatusOptions = [
  { label: "None", value: "none" },
  { label: "Needs follow-up", value: "needs_follow_up" },
  { label: "In progress", value: "in_progress" },
  { label: "Sent", value: "sent" },
  { label: "Resolved", value: "resolved" },
] as const;

type InvoiceFollowUpStatus = (typeof followUpStatusOptions)[number]["value"];

export function InvoiceFollowUpControls({
  orgSlug,
  invoiceId,
  initialFollowUpStatus,
}: {
  orgSlug: string;
  invoiceId: string;
  initialFollowUpStatus: string;
}) {
  const router = useRouter();
  const [followUpStatus, setFollowUpStatus] = useState<InvoiceFollowUpStatus>(
    followUpStatusOptions.some((option) => option.value === initialFollowUpStatus)
      ? (initialFollowUpStatus as InvoiceFollowUpStatus)
      : "none",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 grid gap-3 border-t-2 border-border pt-4 md:grid-cols-[180px_minmax(0,1fr)_auto]">
      <Select
        value={followUpStatus}
        onValueChange={(value) => setFollowUpStatus(value as InvoiceFollowUpStatus)}
        disabled={isPending}
      >
        <SelectTrigger aria-label="Follow-up status" className="w-full">
          <SelectValue placeholder="Follow-up status" />
        </SelectTrigger>
        <SelectContent>
          {followUpStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional internal follow-up note"
        disabled={isPending}
      />

      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          setMessage(null);

          startTransition(async () => {
            const response = await fetch(`/api/orgs/${orgSlug}/invoices/${invoiceId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                followUpStatus,
                note: note.trim() || undefined,
              }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
              setError(payload?.error?.message ?? "Unable to update invoice follow-up.");
              return;
            }

            setNote("");
            setMessage("Follow-up saved.");
            router.refresh();
          });
        }}
      >
        {isPending ? "Saving..." : "Save"}
      </Button>

      <div className="md:col-span-3">
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
