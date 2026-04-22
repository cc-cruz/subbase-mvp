import "server-only";

import { getQuickBooksAccessToken, getQuickBooksIntegration } from "@/lib/domain/integrations/quickbooks";
import { getEnv } from "@/lib/env";
import { getQuickBooksApiBaseUrl } from "@/lib/integrations/quickbooks/constants";

export const invoicePreviewLimit = 25;

export const realInvoiceSyncDependency =
  "Reserve a canonical invoice record contract: a shared invoice table keyed by organization plus external invoice id, sync cursor/job ownership, and canonical fields for customer, amount, balance, due date, accounting status, follow-up state, share state, and GC acknowledgement state.";

type QuickBooksInvoicePayload = {
  Id?: string;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  TotalAmt?: number | string;
  Balance?: number | string;
  CurrencyRef?: {
    name?: string;
    value?: string;
  };
  CustomerRef?: {
    name?: string;
    value?: string;
  };
  PrivateNote?: string;
  MetaData?: {
    LastUpdatedTime?: string;
    CreateTime?: string;
  };
};

type QuickBooksInvoiceQueryResponse = {
  QueryResponse?: {
    Invoice?: QuickBooksInvoicePayload[];
    startPosition?: number;
    maxResults?: number;
    totalCount?: number;
  };
  Fault?: {
    Error?: Array<{
      Message?: string;
      Detail?: string;
    }>;
  };
};

export type ReadOnlyInvoicePreviewItem = {
  externalId: string;
  invoiceNumber: string;
  customerName: string;
  txnDate: string | null;
  dueDate: string | null;
  totalAmount: number;
  balance: number;
  currency: string;
  statusLabel: "paid" | "partially_paid" | "open";
  quickBooksUpdatedAt: string | null;
  note: string | null;
};

export type InvoiceModuleReadiness = {
  quickBooks: {
    connected: boolean;
    status: string | null;
    realmId: string | null;
    tokenExpiresAt: string | null;
    lastSyncedAt: string | null;
    updatedAt: string | null;
  };
  previewState:
    | "not_connected"
    | "needs_reauth"
    | "connection_ready"
    | "read_only_preview"
    | "preview_error";
  previewMessage: string;
  previewError: string | null;
  items: ReadOnlyInvoicePreviewItem[];
  totalCount: number | null;
  dependencyForRealSync: string;
};

function asNumber(value: number | string | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function deriveStatusLabel(invoice: QuickBooksInvoicePayload): ReadOnlyInvoicePreviewItem["statusLabel"] {
  const totalAmount = asNumber(invoice.TotalAmt);
  const balance = asNumber(invoice.Balance);

  if (balance <= 0) {
    return "paid";
  }

  if (totalAmount > 0 && balance < totalAmount) {
    return "partially_paid";
  }

  return "open";
}

function buildQuickBooksInvoicePreviewItem(
  invoice: QuickBooksInvoicePayload,
): ReadOnlyInvoicePreviewItem | null {
  const externalId = invoice.Id?.trim();

  if (!externalId) {
    return null;
  }

  return {
    externalId,
    invoiceNumber: invoice.DocNumber?.trim() || externalId,
    customerName: invoice.CustomerRef?.name?.trim() || "Unknown customer",
    txnDate: invoice.TxnDate ?? null,
    dueDate: invoice.DueDate ?? null,
    totalAmount: asNumber(invoice.TotalAmt),
    balance: asNumber(invoice.Balance),
    currency: invoice.CurrencyRef?.name?.trim() || "USD",
    statusLabel: deriveStatusLabel(invoice),
    quickBooksUpdatedAt:
      invoice.MetaData?.LastUpdatedTime ?? invoice.MetaData?.CreateTime ?? null,
    note: invoice.PrivateNote?.trim() || null,
  };
}

async function fetchQuickBooksInvoicePreview(organizationId: string) {
  const { accessToken, realmId } = await getQuickBooksAccessToken(organizationId);
  const query = `SELECT * FROM Invoice STARTPOSITION 1 MAXRESULTS ${invoicePreviewLimit}`;
  const requestUrl = new URL(
    `${getQuickBooksApiBaseUrl(getEnv().INTUIT_ENVIRONMENT)}/company/${realmId}/query`,
  );
  requestUrl.searchParams.set("query", query);

  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as QuickBooksInvoiceQueryResponse;

  if (!response.ok || payload.Fault?.Error?.length) {
    const quickBooksError =
      payload.Fault?.Error?.[0]?.Detail ||
      payload.Fault?.Error?.[0]?.Message ||
      `QuickBooks returned ${response.status}.`;

    throw new Error(quickBooksError);
  }

  const items = (payload.QueryResponse?.Invoice ?? [])
    .map(buildQuickBooksInvoicePreviewItem)
    .filter((item): item is ReadOnlyInvoicePreviewItem => item !== null)
    .sort((left, right) => {
      const leftDate = left.dueDate ?? left.txnDate ?? "";
      const rightDate = right.dueDate ?? right.txnDate ?? "";

      return leftDate.localeCompare(rightDate);
    });

  return {
    items,
    totalCount: payload.QueryResponse?.totalCount ?? items.length,
  };
}

export async function getInvoiceModuleReadiness(
  organizationId: string,
): Promise<InvoiceModuleReadiness> {
  const integration = await getQuickBooksIntegration(organizationId);

  if (!integration) {
    return {
      quickBooks: {
        connected: false,
        status: null,
        realmId: null,
        tokenExpiresAt: null,
        lastSyncedAt: null,
        updatedAt: null,
      },
      previewState: "not_connected",
      previewMessage:
        "QuickBooks is not connected yet. Connect the integration first to unlock read-only invoice visibility.",
      previewError: null,
      items: [],
      totalCount: null,
      dependencyForRealSync: realInvoiceSyncDependency,
    };
  }

  const quickBooks = {
    connected: Boolean(integration.realmId) && integration.status === "active",
    status: integration.status,
    realmId: integration.realmId,
    tokenExpiresAt: integration.tokenExpiresAt?.toISOString() ?? null,
    lastSyncedAt: integration.lastSyncedAt?.toISOString() ?? null,
    updatedAt: integration.updatedAt.toISOString(),
  };

  if (integration.status === "needs_reauth") {
    return {
      quickBooks,
      previewState: "needs_reauth",
      previewMessage:
        "QuickBooks needs reauthorization before SubBase can preview invoices again.",
      previewError: null,
      items: [],
      totalCount: null,
      dependencyForRealSync: realInvoiceSyncDependency,
    };
  }

  if (integration.status !== "active" || !integration.realmId) {
    return {
      quickBooks,
      previewState: "connection_ready",
      previewMessage:
        "QuickBooks is configured, but the integration is not yet in an active state for invoice preview.",
      previewError: null,
      items: [],
      totalCount: null,
      dependencyForRealSync: realInvoiceSyncDependency,
    };
  }

  try {
    const preview = await fetchQuickBooksInvoicePreview(organizationId);

    return {
      quickBooks,
      previewState: "read_only_preview",
      previewMessage:
        preview.items.length > 0
          ? "Showing a read-only live preview from QuickBooks. Follow-up state is intentionally not persisted in this slice."
          : "QuickBooks is connected, but the first preview page returned no invoices.",
      previewError: null,
      items: preview.items,
      totalCount: preview.totalCount,
      dependencyForRealSync: realInvoiceSyncDependency,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to preview invoices.";

    return {
      quickBooks,
      previewState: "preview_error",
      previewMessage:
        "QuickBooks is connected, but this slice could not safely hydrate a live read-only invoice preview.",
      previewError: message,
      items: [],
      totalCount: null,
      dependencyForRealSync: realInvoiceSyncDependency,
    };
  }
}
