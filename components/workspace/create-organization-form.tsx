"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        startTransition(async () => {
          const response = await fetch("/api/organizations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              slug: slug || undefined,
            }),
          });

          const payload = await response.json();

          if (!response.ok) {
            setError(payload.error?.message ?? "Unable to create workspace.");
            return;
          }

          router.push(payload.redirectPath);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="organization-name">Company name</Label>
          <Input
            id="organization-name"
            name="organization-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Atlas Drywall"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization-slug">Workspace slug</Label>
          <Input
            id="organization-slug"
            name="organization-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="atlas-drywall"
          />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending || name.trim().length < 2}>
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
