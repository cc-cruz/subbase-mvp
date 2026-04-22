"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ProjectContactForm, type EditableProjectContact, type ProjectContactFormValue } from "@/components/projects/project-contact-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectContact = EditableProjectContact;

function buildContactPayload(formState: ProjectContactFormValue) {
  return {
    name: formState.name,
    companyName: formState.companyName,
    email: formState.email,
    phone: formState.phone,
    role: formState.role,
    isGcContact: formState.isGcContact,
  };
}

async function parseResponseError(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (response.ok) {
    return null;
  }

  return payload.error?.message ?? "Unable to save project contact.";
}

export function ProjectContactManager({
  orgSlug,
  project,
}: {
  orgSlug: string;
  project: {
    id: string;
    gcCompany?: { name: string } | null;
    contacts: ProjectContact[];
  };
}) {
  const router = useRouter();
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const gcContacts = project.contacts.filter((contact) => contact.isGcContact);
  const otherContacts = project.contacts.filter((contact) => !contact.isGcContact);

  async function submitCreate(formState: ProjectContactFormValue) {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${orgSlug}/projects/${project.id}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildContactPayload(formState)),
      });
      const responseError = await parseResponseError(response);

      if (responseError) {
        setError(responseError);
        return responseError;
      }

      setMessage("Project contact added.");
      router.refresh();
      return null;
    } catch {
      const requestError = "Unable to save project contact.";
      setError(requestError);
      return requestError;
    }
  }

  async function submitUpdate(contactId: string, formState: ProjectContactFormValue) {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/orgs/${orgSlug}/projects/${project.id}/contacts/${contactId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildContactPayload(formState)),
      });
      const responseError = await parseResponseError(response);

      if (responseError) {
        setError(responseError);
        return responseError;
      }

      setEditingContactId(null);
      setMessage("Project contact updated.");
      router.refresh();
      return null;
    } catch {
      const requestError = "Unable to update project contact.";
      setError(requestError);
      return requestError;
    }
  }

  function deleteContact(contactId: string, contactName: string) {
    if (!window.confirm(`Delete ${contactName} from this project?`)) {
      return;
    }

    setMessage(null);
    setError(null);

    startDeleteTransition(async () => {
      try {
        const response = await fetch(`/api/orgs/${orgSlug}/projects/${project.id}/contacts/${contactId}`, {
          method: "DELETE",
        });
        const responseError = await parseResponseError(response);

        if (responseError) {
          setError(responseError);
          return;
        }

        setEditingContactId(null);
        setMessage("Project contact removed.");
        router.refresh();
      } catch {
        setError("Unable to remove project contact.");
      }
    });
  }

  function renderContacts(title: string, description: string, contacts: ProjectContact[]) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {contacts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-sm text-muted-foreground">
            No contacts in this group yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border-2 border-border bg-background px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{contact.name}</p>
                      {contact.isGcContact ? <Badge>GC Contact</Badge> : null}
                      {contact.role ? <Badge variant="outline">{contact.role}</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.companyName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{contact.email || "No email yet"}</span>
                      <span>{contact.phone || "No phone yet"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditingContactId((current) => (current === contact.id ? null : contact.id))
                      }
                    >
                      {editingContactId === contact.id ? "Close" : "Edit"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => deleteContact(contact.id, contact.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {editingContactId === contact.id ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <ProjectContactForm
                      contact={contact}
                      gcCompanyName={project.gcCompany?.name}
                      submitLabel="Save contact"
                      onCancel={() => setEditingContactId(null)}
                      onSubmit={(formState) => submitUpdate(contact.id, formState)}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-4 border-border">
      <CardHeader>
        <CardTitle>Project Contacts</CardTitle>
        <CardDescription>
          Keep the people on the job current. This is the handoff point into later
          crew, compliance, and invoice follow-up work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-4">
          <p className="text-sm font-semibold">Add project contact</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track project stakeholders and explicitly tag the GC-side contact when the
            project already has a linked GC company.
          </p>
          <div className="mt-4">
            <ProjectContactForm
              gcCompanyName={project.gcCompany?.name}
              submitLabel="Add contact"
              onSubmit={submitCreate}
            />
          </div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {renderContacts(
          "GC contacts",
          project.gcCompany?.name
            ? `These contacts are linked directly to ${project.gcCompany.name}.`
            : "Link a GC company on the project to start tagging GC contacts.",
          gcContacts,
        )}

        {renderContacts(
          "Project-side contacts",
          "Internal PMs, supers, foremen, vendors, or any other project stakeholders.",
          otherContacts,
        )}
      </CardContent>
    </Card>
  );
}
