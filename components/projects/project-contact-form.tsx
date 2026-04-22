"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ProjectContactFormValue = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  role: string;
  isGcContact: boolean;
};

export type EditableProjectContact = {
  id: string;
  name: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  isGcContact: boolean;
};

function getInitialValue(contact?: EditableProjectContact): ProjectContactFormValue {
  return {
    name: contact?.name ?? "",
    companyName: contact?.companyName ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    role: contact?.role ?? "",
    isGcContact: contact?.isGcContact ?? false,
  };
}

export function ProjectContactForm({
  contact,
  gcCompanyName,
  submitLabel,
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
}: {
  contact?: EditableProjectContact;
  gcCompanyName?: string | null;
  submitLabel: string;
  cancelLabel?: string;
  onSubmit: (value: ProjectContactFormValue) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [formState, setFormState] = useState<ProjectContactFormValue>(getInitialValue(contact));
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function updateField<Key extends keyof ProjectContactFormValue>(
    field: Key,
    value: ProjectContactFormValue[Key],
  ) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function resetAfterCreate() {
    if (!contact) {
      setFormState(getInitialValue(undefined));
    }
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

        resetAfterCreate();

        if (contact && onCancel) {
          onCancel();
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={contact ? `contact-name-${contact.id}` : "new-contact-name"}>Contact name</Label>
          <Input
            id={contact ? `contact-name-${contact.id}` : "new-contact-name"}
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={contact ? `contact-role-${contact.id}` : "new-contact-role"}>Role</Label>
          <Input
            id={contact ? `contact-role-${contact.id}` : "new-contact-role"}
            value={formState.role}
            onChange={(event) => updateField("role", event.target.value)}
            placeholder="Project engineer"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={contact ? `contact-company-${contact.id}` : "new-contact-company"}>
            Company
          </Label>
          <Input
            id={contact ? `contact-company-${contact.id}` : "new-contact-company"}
            value={formState.isGcContact ? gcCompanyName ?? "" : formState.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            placeholder={gcCompanyName ? "Linked to project GC" : "Northline Concrete"}
            disabled={formState.isGcContact}
            required={!formState.isGcContact}
          />
          {formState.isGcContact ? (
            <p className="text-xs text-muted-foreground">
              {gcCompanyName
                ? `This contact stays linked to ${gcCompanyName}.`
                : "Add a GC company to the project before marking a GC contact."}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id={contact ? `contact-gc-${contact.id}` : "new-contact-gc"}
              checked={formState.isGcContact}
              disabled={!gcCompanyName}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;
                updateField("isGcContact", isChecked);
                if (isChecked && gcCompanyName) {
                  updateField("companyName", gcCompanyName);
                }
              }}
            />
            <div className="space-y-1">
              <Label htmlFor={contact ? `contact-gc-${contact.id}` : "new-contact-gc"}>
                Mark as GC contact
              </Label>
              <p className="text-xs text-muted-foreground">
                {gcCompanyName
                  ? "Use this when the contact represents the linked GC company on the job."
                  : "This unlocks after the project has a linked GC company."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={contact ? `contact-email-${contact.id}` : "new-contact-email"}>Email</Label>
          <Input
            id={contact ? `contact-email-${contact.id}` : "new-contact-email"}
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={contact ? `contact-phone-${contact.id}` : "new-contact-phone"}>Phone</Label>
          <Input
            id={contact ? `contact-phone-${contact.id}` : "new-contact-phone"}
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(555) 555-5555"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending || formState.name.trim().length < 2}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
