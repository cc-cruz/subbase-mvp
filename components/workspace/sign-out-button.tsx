"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { getBrowserAuthClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const authClient = getBrowserAuthClient();
            const { error: signOutError } = await authClient.signOut();

            if (signOutError) {
              setError(signOutError.message ?? "Unable to sign out.");
              return;
            }

            router.push("/workspace/sign-in");
            router.refresh();
          });
        }}
        disabled={isPending}
      >
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
