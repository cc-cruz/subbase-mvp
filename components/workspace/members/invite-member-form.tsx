"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { organizationRoleValues, type OrganizationRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteMemberForm({
  orgSlug,
}: {
  orgSlug: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>("MANAGER");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        startTransition(async () => {
          const response = await fetch(`/api/orgs/${orgSlug}/invitations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              role,
            }),
          });

          if (!response.ok) {
            const payload = await response.json();
            setError(payload.error?.message ?? "Unable to create internal invite.");
            return;
          }

          setEmail("");
          setRole("MANAGER");
          setMessage("Internal invite created.");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-2">
          <Label htmlFor="member-email">Email</Label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="pm@atlasdrywall.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="member-role">Role</Label>
          <Select value={role} onValueChange={(value) => setRole(value as OrganizationRole)}>
            <SelectTrigger id="member-role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {organizationRoleValues.map((roleValue) => (
                <SelectItem key={roleValue} value={roleValue}>
                  {roleValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Inviting..." : "Send internal invite"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
