"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CompanyProfileRecord = {
  legalName: string;
  displayName: string;
  dbaName: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  serviceAreaJson: unknown;
  licenseSummary: string | null;
  insuranceSummary: string | null;
};

export function CompanyProfileForm({
  orgSlug,
  initialProfile,
  organizationName,
}: {
  orgSlug: string;
  initialProfile: CompanyProfileRecord | null;
  organizationName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formState, setFormState] = useState({
    legalName: initialProfile?.legalName ?? organizationName,
    displayName: initialProfile?.displayName ?? organizationName,
    dbaName: initialProfile?.dbaName ?? "",
    description: initialProfile?.description ?? "",
    phone: initialProfile?.phone ?? "",
    email: initialProfile?.email ?? "",
    websiteUrl: initialProfile?.websiteUrl ?? "",
    serviceArea:
      typeof initialProfile?.serviceAreaJson === "object" &&
      initialProfile?.serviceAreaJson &&
      "summary" in initialProfile.serviceAreaJson
        ? String(initialProfile.serviceAreaJson.summary)
        : "",
    licenseSummary: initialProfile?.licenseSummary ?? "",
    insuranceSummary: initialProfile?.insuranceSummary ?? "",
  });

  function updateField(field: keyof typeof formState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        startTransition(async () => {
          const response = await fetch(`/api/orgs/${orgSlug}/company-profile`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formState),
          });

          const payload = await response.json();

          if (!response.ok) {
            setError(payload.error?.message ?? "Unable to update company profile.");
            return;
          }

          setMessage("Company profile saved.");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="legal-name">Legal name</Label>
          <Input
            id="legal-name"
            value={formState.legalName}
            onChange={(event) => updateField("legalName", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={formState.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dba-name">DBA name</Label>
          <Input
            id="dba-name"
            value={formState.dbaName}
            onChange={(event) => updateField("dbaName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service-area">Service area</Label>
          <Input
            id="service-area"
            value={formState.serviceArea}
            onChange={(event) => updateField("serviceArea", event.target.value)}
            placeholder="San Diego County + 50 miles"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">About</Label>
        <Textarea
          id="description"
          value={formState.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="What the company does, what trades it covers, and where it operates."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={formState.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formState.email} onChange={(event) => updateField("email", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formState.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="license-summary">License summary</Label>
          <Textarea
            id="license-summary"
            value={formState.licenseSummary}
            onChange={(event) => updateField("licenseSummary", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurance-summary">Insurance summary</Label>
          <Textarea
            id="insurance-summary"
            value={formState.insuranceSummary}
            onChange={(event) => updateField("insuranceSummary", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : "Save company profile"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
