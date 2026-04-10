import "server-only";

import type { Prisma } from "@prisma/client";

import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/db/client";
import {
  QUICKBOOKS_ACCESS_TOKEN_BUFFER_MS,
  QUICKBOOKS_PROVIDER,
} from "@/lib/integrations/quickbooks/constants";
import {
  type QuickBooksTokenResponse,
  refreshQuickBooksAccessToken,
} from "@/lib/integrations/quickbooks/oauth";
import { decryptSecret, encryptSecret } from "@/lib/security/crypto";

const quickBooksIntegrationSelect = {
  id: true,
  lastSyncedAt: true,
  provider: true,
  realmId: true,
  status: true,
  tokenExpiresAt: true,
  updatedAt: true,
} satisfies Prisma.OrganizationIntegrationSelect;

const quickBooksIntegrationSecretSelect = {
  accessTokenEncrypted: true,
  id: true,
  organizationId: true,
  provider: true,
  realmId: true,
  refreshTokenEncrypted: true,
  status: true,
  tokenExpiresAt: true,
} satisfies Prisma.OrganizationIntegrationSelect;

type QuickBooksIntegrationSecretRecord = Prisma.OrganizationIntegrationGetPayload<{
  select: typeof quickBooksIntegrationSecretSelect;
}>;

function applyQuickBooksTokenUpdate(tokenResponse: QuickBooksTokenResponse) {
  return {
    accessTokenEncrypted: encryptSecret(tokenResponse.accessToken),
    refreshTokenEncrypted: encryptSecret(tokenResponse.refreshToken),
    tokenExpiresAt: tokenResponse.expiresAt,
  };
}

export async function getQuickBooksIntegration(organizationId: string) {
  return prisma.organizationIntegration.findUnique({
    where: {
      organizationId_provider: {
        organizationId,
        provider: QUICKBOOKS_PROVIDER,
      },
    },
    select: quickBooksIntegrationSelect,
  });
}

async function getQuickBooksIntegrationWithSecrets(organizationId: string) {
  return prisma.organizationIntegration.findUnique({
    where: {
      organizationId_provider: {
        organizationId,
        provider: QUICKBOOKS_PROVIDER,
      },
    },
    select: quickBooksIntegrationSecretSelect,
  });
}

export async function upsertQuickBooksIntegration({
  organizationId,
  realmId,
  tokenResponse,
}: {
  organizationId: string;
  realmId: string;
  tokenResponse: QuickBooksTokenResponse;
}) {
  return prisma.organizationIntegration.upsert({
    where: {
      organizationId_provider: {
        organizationId,
        provider: QUICKBOOKS_PROVIDER,
      },
    },
    update: {
      ...applyQuickBooksTokenUpdate(tokenResponse),
      keyVersion: 1,
      realmId,
      status: "active",
    },
    create: {
      ...applyQuickBooksTokenUpdate(tokenResponse),
      keyVersion: 1,
      organizationId,
      provider: QUICKBOOKS_PROVIDER,
      realmId,
      status: "active",
    },
  });
}

export async function disconnectQuickBooksIntegration(organizationId: string) {
  return prisma.organizationIntegration.updateMany({
    where: {
      organizationId,
      provider: QUICKBOOKS_PROVIDER,
    },
    data: {
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      realmId: null,
      status: "disconnected",
      tokenExpiresAt: null,
    },
  });
}

export async function markQuickBooksIntegrationNeedsReauth(organizationId: string) {
  return prisma.organizationIntegration.updateMany({
    where: {
      organizationId,
      provider: QUICKBOOKS_PROVIDER,
    },
    data: {
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      status: "needs_reauth",
      tokenExpiresAt: null,
    },
  });
}

async function refreshQuickBooksIntegrationTokens(
  integration: QuickBooksIntegrationSecretRecord,
) {
  if (!integration.refreshTokenEncrypted || !integration.realmId) {
    throw notFound("QuickBooks refresh token is missing.");
  }

  const refreshToken = decryptSecret(integration.refreshTokenEncrypted);
  const tokenResponse = await refreshQuickBooksAccessToken(refreshToken);

  await prisma.organizationIntegration.update({
    where: { id: integration.id },
    data: {
      ...applyQuickBooksTokenUpdate(tokenResponse),
      status: "active",
    },
  });

  return {
    accessToken: tokenResponse.accessToken,
    realmId: integration.realmId,
  };
}

export async function getQuickBooksAccessToken(organizationId: string) {
  const integration = await getQuickBooksIntegrationWithSecrets(organizationId);

  if (
    !integration ||
    !integration.realmId ||
    integration.status !== "active" ||
    !integration.accessTokenEncrypted
  ) {
    throw notFound("QuickBooks is not connected for this workspace.");
  }

  if (
    integration.tokenExpiresAt &&
    integration.tokenExpiresAt.getTime() - Date.now() > QUICKBOOKS_ACCESS_TOKEN_BUFFER_MS
  ) {
    return {
      accessToken: decryptSecret(integration.accessTokenEncrypted),
      realmId: integration.realmId,
    };
  }

  try {
    return await refreshQuickBooksIntegrationTokens(integration);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    if (message.includes("invalid_grant")) {
      await markQuickBooksIntegrationNeedsReauth(organizationId);
    }

    throw error;
  }
}
