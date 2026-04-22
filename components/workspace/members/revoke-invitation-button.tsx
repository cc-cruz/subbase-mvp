"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function RevokeInvitationButton({
  orgSlug,
  invitationId,
  email,
}: {
  orgSlug: string;
  invitationId: string;
  email: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(`Revoke the pending invite for ${email}?`)) {
          return;
        }

        startTransition(async () => {
          const response = await fetch(`/api/orgs/${orgSlug}/invitations/${invitationId}`, {
            method: "PATCH",
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            window.alert(payload?.error?.message ?? "Unable to revoke internal invite.");
            return;
          }

          router.refresh();
        });
      }}
    >
      {isPending ? "Revoking..." : "Revoke"}
    </Button>
  );
}
