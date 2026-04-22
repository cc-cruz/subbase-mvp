"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  complianceAttachmentTargetValues,
  complianceCategoryValues,
  type ComplianceAttachmentTarget,
  type ComplianceCategory,
} from "@/lib/domain/compliance/schemas";

export type ComplianceDocumentFormValue = {
  fileName: string;
  category: ComplianceCategory;
  issueDate: string;
  expirationDate: string;
  attachmentTarget: ComplianceAttachmentTarget;
  projectId: string;
  notes: string;
};

const categoryLabels: Record<ComplianceCategory, string> = {
  w9: "W-9",
  license: "License",
  insurance: "Insurance",
  workers_comp: "Workers comp",
  safety_cert: "Safety cert",
  trade_cert: "Trade cert",
  agreement: "Agreement",
  other: "Other",
};

function getInitialValue(): ComplianceDocumentFormValue {
  return {
    fileName: "",
    category: "license",
    issueDate: "",
    expirationDate: "",
    attachmentTarget: "COMPANY",
    projectId: "",
    notes: "",
  };
}

export function ComplianceDocumentForm({
  projects,
  onSubmit,
}: {
  projects: Array<{ id: string; name: string; status: string }>;
  onSubmit: (value: ComplianceDocumentFormValue) => Promise<string | null>;
}) {
  const [formState, setFormState] = useState<ComplianceDocumentFormValue>(getInitialValue());
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function updateField<Key extends keyof ComplianceDocumentFormValue>(
    field: Key,
    value: ComplianceDocumentFormValue[Key],
  ) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);

        const nextError = await onSubmit(formState);

        setIsPending(false);

        if (nextError) {
          setError(nextError);
          return;
        }

        setFormState(getInitialValue());
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="compliance-file-name">File name</Label>
          <Input
            id="compliance-file-name"
            value={formState.fileName}
            onChange={(event) => updateField("fileName", event.target.value)}
            placeholder="2026-atlas-general-liability.pdf"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-category">Category</Label>
          <Select
            value={formState.category}
            onValueChange={(value) => updateField("category", value as ComplianceCategory)}
          >
            <SelectTrigger id="compliance-category" className="w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {complianceCategoryValues.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryLabels[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="compliance-issue-date">Issue date</Label>
          <Input
            id="compliance-issue-date"
            type="date"
            value={formState.issueDate}
            onChange={(event) => updateField("issueDate", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-expiration-date">Expiration date</Label>
          <Input
            id="compliance-expiration-date"
            type="date"
            value={formState.expirationDate}
            onChange={(event) => updateField("expirationDate", event.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="compliance-target">Attachment target</Label>
          <Select
            value={formState.attachmentTarget}
            onValueChange={(value) => {
              const target = value as ComplianceAttachmentTarget;
              updateField("attachmentTarget", target);
              if (target === "COMPANY") {
                updateField("projectId", "");
              }
            }}
          >
            <SelectTrigger id="compliance-target" className="w-full">
              <SelectValue placeholder="Choose a target" />
            </SelectTrigger>
            <SelectContent>
              {complianceAttachmentTargetValues.map((target) => (
                <SelectItem key={target} value={target}>
                  {target === "COMPANY" ? "Company-level" : "Project-level"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance-project-target">Project</Label>
          <Select
            value={formState.projectId}
            disabled={formState.attachmentTarget !== "PROJECT" || projects.length === 0}
            onValueChange={(value) => updateField("projectId", value)}
          >
            <SelectTrigger id="compliance-project-target" className="w-full">
              <SelectValue
                placeholder={
                  projects.length === 0 ? "No projects yet" : "Choose a project target"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="compliance-notes">Notes</Label>
        <Textarea
          id="compliance-notes"
          value={formState.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Optional note about renewal timing, broker follow-up, or scope."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={
            isPending ||
            formState.fileName.trim().length < 2 ||
            !formState.issueDate ||
            !formState.expirationDate ||
            (formState.attachmentTarget === "PROJECT" && !formState.projectId)
          }
        >
          {isPending ? "Saving..." : "Add compliance record"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
