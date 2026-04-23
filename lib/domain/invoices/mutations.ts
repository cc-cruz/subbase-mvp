import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { notFound } from "@/lib/api/errors";
import {
  asNumber,
  deriveQuickBooksInvoiceStatusLabel,
  fetchQuickBooksInvoices,
  invoicePreviewLimit,
  listPersistedInvoices,
  type QuickBooksInvoicePayload,
} from "@/lib/domain/invoices/queries";
import type { UpdateInvoiceFollowUpInput } from "@/lib/domain/invoices/schemas";
import { QUICKBOOKS_PROVIDER } from "@/lib/integrations/quickbooks/constants";

function parseQuickBooksDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseQuickBooksTimestamp(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildInvoiceUpsertData({
  invoice,
  organizationId,
  syncedAt,
}: {
  invoice: QuickBooksInvoicePayload;
  organizationId: string;
  syncedAt: Date;
}) {
  const externalInvoiceId = invoice.Id?.trim();

  if (!externalInvoiceId) {
    return null;
  }

  const accountingStatus = deriveQuickBooksInvoiceStatusLabel(invoice);

  return {
    accountingStatus,
    balanceAmount: asNumber(invoice.Balance),
    currency: invoice.CurrencyRef?.name?.trim() || "USD",
    customerExternalId: invoice.CustomerRef?.value?.trim() || null,
    customerName: invoice.CustomerRef?.name?.trim() || "Unknown customer",
    dueDate: parseQuickBooksDate(invoice.DueDate),
    externalInvoiceId,
    externalProvider: QUICKBOOKS_PROVIDER,
    invoiceNumber: invoice.DocNumber?.trim() || externalInvoiceId,
    lastSyncedAt: syncedAt,
    organizationId,
    privateNote: invoice.PrivateNote?.trim() || null,
    quickBooksUpdatedAt: parseQuickBooksTimestamp(
      invoice.MetaData?.LastUpdatedTime ?? invoice.MetaData?.CreateTime,
    ),
    rawJson: invoice as Prisma.InputJsonValue,
    totalAmount: asNumber(invoice.TotalAmt),
    txnDate: parseQuickBooksDate(invoice.TxnDate),
  };
}

export async function syncQuickBooksInvoices({
  organizationId,
  limit = invoicePreviewLimit,
}: {
  organizationId: string;
  limit?: number;
}) {
  const syncedAt = new Date();
  const quickBooks = await fetchQuickBooksInvoices({ organizationId, limit });
  let syncedCount = 0;
  let skippedCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const invoice of quickBooks.invoices) {
      const data = buildInvoiceUpsertData({ invoice, organizationId, syncedAt });

      if (!data) {
        skippedCount += 1;
        continue;
      }

      await tx.invoice.upsert({
        where: {
          organizationId_externalProvider_externalInvoiceId: {
            externalInvoiceId: data.externalInvoiceId,
            externalProvider: data.externalProvider,
            organizationId,
          },
        },
        update: {
          accountingStatus: data.accountingStatus,
          balanceAmount: data.balanceAmount,
          currency: data.currency,
          customerExternalId: data.customerExternalId,
          customerName: data.customerName,
          dueDate: data.dueDate,
          invoiceNumber: data.invoiceNumber,
          lastSyncedAt: syncedAt,
          privateNote: data.privateNote,
          quickBooksUpdatedAt: data.quickBooksUpdatedAt,
          rawJson: data.rawJson,
          totalAmount: data.totalAmount,
          txnDate: data.txnDate,
        },
        create: data,
      });

      syncedCount += 1;
    }

    await tx.organizationIntegration.updateMany({
      where: {
        organizationId,
        provider: QUICKBOOKS_PROVIDER,
      },
      data: {
        lastSyncedAt: syncedAt,
        status: "active",
      },
    });
  });

  return {
    items: await listPersistedInvoices(organizationId),
    skippedCount,
    syncedAt: syncedAt.toISOString(),
    syncedCount,
    totalCount: quickBooks.totalCount,
  };
}

export async function updateInvoiceFollowUp({
  organizationId,
  invoiceId,
  authorUserId,
  input,
}: {
  organizationId: string;
  invoiceId: string;
  authorUserId: string;
  input: UpdateInvoiceFollowUpInput;
}) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!invoice) {
    throw notFound("Invoice not found.");
  }

  await prisma.$transaction(async (tx) => {
    if (input.followUpStatus !== undefined) {
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          followUpStatus: input.followUpStatus,
        },
      });
    }

    if (input.note) {
      await tx.invoiceFollowUpNote.create({
        data: {
          authorUserId,
          followUpStatus: input.followUpStatus,
          invoiceId: invoice.id,
          note: input.note,
          organizationId,
        },
      });
    }
  });

  const updatedInvoices = await listPersistedInvoices(organizationId);
  const updatedInvoice = updatedInvoices.find((item) => item.id === invoice.id);

  if (!updatedInvoice) {
    throw notFound("Invoice not found after update.");
  }

  return updatedInvoice;
}
