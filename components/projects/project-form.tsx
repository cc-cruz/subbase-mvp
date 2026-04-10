"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  projectSourceValues,
  projectStatusValues,
  type ProjectSource,
  type ProjectStatus,
} from "@/lib/domain/projects/schemas";

type EditableProject = {
  id: string;
  name: string;
  slug: string;
  status: string;
  source: string;
  gcCompany?: { name: string } | null;
  projectAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
};

type ProjectFormState = {
  name: string;
  slug: string;
  status: ProjectStatus;
  source: ProjectSource;
  gcCompanyName: string;
  projectAddress: string;
  city: string;
  state: string;
  postalCode: string;
  startDate: string;
  endDate: string;
  notes: string;
};

function toDateInput(value: Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function normalizeProjectStatus(value: string | undefined): ProjectStatus {
  return projectStatusValues.includes(value as ProjectStatus) ? (value as ProjectStatus) : "DRAFT";
}

function normalizeProjectSource(value: string | undefined): ProjectSource {
  return projectSourceValues.includes(value as ProjectSource) ? (value as ProjectSource) : "MANUAL";
}

export function ProjectForm({
  orgSlug,
  project,
}: {
  orgSlug: string;
  project?: EditableProject;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<ProjectFormState>({
    name: project?.name ?? "",
    slug: project?.slug ?? "",
    status: normalizeProjectStatus(project?.status),
    source: normalizeProjectSource(project?.source),
    gcCompanyName: project?.gcCompany?.name ?? "",
    projectAddress: project?.projectAddress ?? "",
    city: project?.city ?? "",
    state: project?.state ?? "",
    postalCode: project?.postalCode ?? "",
    startDate: toDateInput(project?.startDate ?? null),
    endDate: toDateInput(project?.endDate ?? null),
    notes: project?.notes ?? "",
  });

  function updateField<Key extends keyof ProjectFormState>(field: Key, value: ProjectFormState[Key]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        startTransition(async () => {
          const endpoint = project
            ? `/api/orgs/${orgSlug}/projects/${project.id}`
            : `/api/orgs/${orgSlug}/projects`;
          const method = project ? "PATCH" : "POST";

          const response = await fetch(endpoint, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formState),
          });

          const payload = await response.json();

          if (!response.ok) {
            setError(payload.error?.message ?? "Unable to save project.");
            return;
          }

          const savedProject = payload.project;
          setMessage(project ? "Project updated." : "Project created.");

          if (!project && savedProject?.id) {
            router.push(`/workspace/${orgSlug}/projects/${savedProject.id}`);
          } else {
            router.refresh();
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          value={formState.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="project-slug">Slug</Label>
          <Input
            id="project-slug"
            value={formState.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="riverside-tower"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <select
            id="project-status"
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"
            value={formState.status}
            onChange={(event) => updateField("status", event.target.value as ProjectStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-source">Source</Label>
          <select
            id="project-source"
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none"
            value={formState.source}
            onChange={(event) => updateField("source", event.target.value as ProjectSource)}
          >
            <option value="MANUAL">Manual</option>
            <option value="MARKETPLACE">Marketplace</option>
            <option value="REPEAT_GC">Repeat GC</option>
            <option value="REFERRAL">Referral</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gc-company-name">GC company</Label>
          <Input
            id="gc-company-name"
            value={formState.gcCompanyName}
            onChange={(event) => updateField("gcCompanyName", event.target.value)}
            placeholder="WestBuild GC"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-address">Project address</Label>
          <Input
            id="project-address"
            value={formState.projectAddress}
            onChange={(event) => updateField("projectAddress", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formState.city} onChange={(event) => updateField("city", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={formState.state} onChange={(event) => updateField("state", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal-code">Postal code</Label>
          <Input
            id="postal-code"
            value={formState.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start date</Label>
          <Input
            id="start-date"
            type="date"
            value={formState.startDate}
            onChange={(event) => updateField("startDate", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End date</Label>
          <Input
            id="end-date"
            type="date"
            value={formState.endDate}
            onChange={(event) => updateField("endDate", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-notes">Notes</Label>
        <Textarea
          id="project-notes"
          value={formState.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={isPending || formState.name.trim().length < 2}>
          {isPending ? "Saving..." : project ? "Update project" : "Create project"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
