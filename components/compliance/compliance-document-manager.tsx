"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ComplianceDocumentForm,
  type ComplianceDocumentFormValue,
} from "@/components/compliance/compliance-document-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ComplianceDocumentRecord = {
  id: string;
  fileName: string;
  category: string;
  issueDate: string;
  expirationDate: string;
  notes: string | null;
  attachmentTarget: "COMPANY" | "PROJECT";
  projectName: string | null;
  createdAt: string;
  createdBy: string;
};

const categoryLabels: Record<string, string> = {
  w9: "W-9",
  license: "License",
  insurance: "Insurance",
  workers_comp: "Workers comp",
  safety_cert: "Safety cert",
  trade_cert: "Trade cert",
  agreement: "Agreement",
  other: "Other",
};

async function parseResponseError(response: Response) {
  const payload = await response.json();

  if (response.ok) {
    return null;
  }

  return payload.error?.message ?? "Unable to save compliance record.";
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function renderDocumentCards(items: ComplianceDocumentRecord[]) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-sm text-muted-foreground">
        No compliance records in this group yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((document) => (
        <div
          key={document.id}
          className="rounded-xl border-2 border-border bg-background px-4 py-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{document.fileName}</p>
                <Badge>{categoryLabels[document.category] ?? document.category}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>Issued {formatDate(document.issueDate)}</span>
                <span>Expires {formatDate(document.expirationDate)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Logged by {document.createdBy} on{" "}
                {new Date(document.createdAt).toLocaleDateString()}
              </div>
              {document.notes ? <p className="text-sm">{document.notes}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComplianceDocumentManager({
  orgSlug,
  items,
  projects,
}: {
  orgSlug: string;
  items: ComplianceDocumentRecord[];
  projects: Array<{ id: string; name: string; status: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const companyItems = items.filter((item) => item.attachmentTarget === "COMPANY");
  const projectItems = items.filter((item) => item.attachmentTarget === "PROJECT");

  async function submitCreate(formState: ComplianceDocumentFormValue) {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${orgSlug}/compliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: formState.fileName,
          category: formState.category,
          issueDate: formState.issueDate,
          expirationDate: formState.expirationDate,
          attachmentTarget: formState.attachmentTarget,
          projectId: formState.projectId || undefined,
          notes: formState.notes,
        }),
      });
      const responseError = await parseResponseError(response);

      if (responseError) {
        setError(responseError);
        return responseError;
      }

      setMessage("Compliance record added.");
      router.refresh();
      return null;
    } catch {
      const requestError = "Unable to save compliance record.";
      setError(requestError);
      return requestError;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Add compliance record</CardTitle>
          <CardDescription>
            This first slice captures metadata-only document records on top of the
            frozen file primitives. Binary upload and sharing can layer on later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ComplianceDocumentForm projects={projects} onSubmit={submitCreate} />
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-4 border-border">
          <CardHeader>
            <CardTitle>Company-level records</CardTitle>
            <CardDescription>
              Insurance, licenses, W-9s, and other docs that apply across the
              company.
            </CardDescription>
          </CardHeader>
          <CardContent>{renderDocumentCards(companyItems)}</CardContent>
        </Card>

        <Card className="border-4 border-border">
          <CardHeader>
            <CardTitle>Project-level records</CardTitle>
            <CardDescription>
              Project-bound compliance records that hang off a specific active job.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectItems.length === 0 ? (
              renderDocumentCards(projectItems)
            ) : (
              <div className="grid gap-3">
                {projectItems.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-xl border-2 border-border bg-background px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{document.fileName}</p>
                      <Badge>{categoryLabels[document.category] ?? document.category}</Badge>
                      {document.projectName ? (
                        <Badge variant="outline">{document.projectName}</Badge>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Issued {formatDate(document.issueDate)}</span>
                      <span>Expires {formatDate(document.expirationDate)}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Logged by {document.createdBy} on{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </div>
                    {document.notes ? <p className="mt-2 text-sm">{document.notes}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
