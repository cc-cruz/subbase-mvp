import "server-only";

export const QUICKBOOKS_PROVIDER = "quickbooks_online";
export const QUICKBOOKS_SCOPE = "com.intuit.quickbooks.accounting";
export const QUICKBOOKS_AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";
export const QUICKBOOKS_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
export const QUICKBOOKS_OAUTH_STATE_COOKIE = "subbase_qbo_state";
export const QUICKBOOKS_ACCESS_TOKEN_BUFFER_MS = 5 * 60 * 1000;

export function getQuickBooksApiBaseUrl(environment: "sandbox" | "production") {
  return environment === "production"
    ? "https://quickbooks.api.intuit.com/v3"
    : "https://sandbox-quickbooks.api.intuit.com/v3";
}
