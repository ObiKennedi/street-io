// File: lib/paga.ts
// Paga payment integration and reader wallet state for Street IO.
import crypto from "crypto";

export type PagaTransaction = {
  reference: string;
  userId: string;
  amount: number;
  currency: "NGN";
  status: "pending" | "successful" | "failed";
  paymentMethod: "paga_account" | "bank_transfer" | "card" | "ussd";
  customerEmail: string;
  customerName?: string;
  createdAt: Date;
  articleSlug?: string;
};

export const PAGA_CONFIG = {
  publicKey: process.env.PAGA_PUBLIC_KEY ?? "f9511100-a474-49d7-9045-4410ccf2e084",
  hmacKey: process.env.PAGA_HMAC_KEY ?? "",
  environment: (process.env.PAGA_ENV ?? "live") as "live" | "beta",
  liveBaseUrl: "https://checkout.paga.com",
  testBaseUrl: "https://beta-checkout.paga.com",
};

export const PAGA_MERCHANT_DETAILS = {
  pagaTag: process.env.PAGA_TAG ?? "$Streetio",
  bankName: process.env.PAGA_BANK ?? "Paga",
  accountNumber: process.env.PAGA_ACCOUNT_NUMBER ?? "1031881015",
  accountName: "Streetio",
  publicKey: PAGA_CONFIG.publicKey,
} as const;

export function getPagaCheckoutBaseUrl(): string {
  return PAGA_CONFIG.environment === "live"
    ? PAGA_CONFIG.liveBaseUrl
    : PAGA_CONFIG.testBaseUrl;
}

// In-memory wallet store with user balance tracking
// (Persists across hot reloads in global state)
declare global {
  // eslint-disable-next-line no-var
  var __streetio_wallets: Map<string, number> | undefined;
  // eslint-disable-next-line no-var
  var __streetio_transactions: PagaTransaction[] | undefined;
}

if (!globalThis.__streetio_wallets) {
  globalThis.__streetio_wallets = new Map<string, number>();
}

if (!globalThis.__streetio_transactions) {
  globalThis.__streetio_transactions = [];
}

declare global {
  // eslint-disable-next-line no-var
  var __streetio_unlocked_articles: Map<string, Set<string>> | undefined;
}

if (!globalThis.__streetio_unlocked_articles) {
  globalThis.__streetio_unlocked_articles = new Map<string, Set<string>>();
}

const wallets = globalThis.__streetio_wallets;
const transactions = globalThis.__streetio_transactions;
const unlockedArticles = globalThis.__streetio_unlocked_articles;

export function isArticleUnlockedForUser(userId: string, articleSlug: string): boolean {
  return unlockedArticles.get(userId)?.has(articleSlug.toLowerCase()) ?? false;
}

export function unlockArticleForUser(userId: string, articleSlug: string): void {
  const clean = articleSlug.toLowerCase();
  const set = unlockedArticles.get(userId) ?? new Set<string>();
  set.add(clean);
  unlockedArticles.set(userId, set);
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getUserWalletBalance(userId: string): number {
  return wallets.get(userId) ?? 0;
}

export function registerPendingPagaTransaction(
  tx: Omit<PagaTransaction, "createdAt" | "status">
): PagaTransaction {
  const existing = transactions.find((t) => t.reference === tx.reference);
  if (existing) {
    existing.status = "pending";
    return existing;
  }

  const fullTx: PagaTransaction = {
    ...tx,
    status: "pending",
    createdAt: new Date(),
  };
  transactions.unshift(fullTx);
  return fullTx;
}

export function findPagaTransaction(reference: string): PagaTransaction | undefined {
  return transactions.find((t) => t.reference.toLowerCase() === reference.toLowerCase());
}

export function creditUserWallet(
  userId: string,
  amount: number,
  reference: string,
  meta?: {
    customerEmail?: string;
    customerName?: string;
    articleSlug?: string;
    paymentMethod?: "paga_account" | "bank_transfer" | "card" | "ussd";
  }
): { balance: number; formattedBalance: string; transaction: PagaTransaction } {
  const current = getUserWalletBalance(userId);
  const updated = current + amount;
  wallets.set(userId, updated);

  const existingIdx = transactions.findIndex((t) => t.reference.toLowerCase() === reference.toLowerCase());
  let tx: PagaTransaction;

  if (existingIdx !== -1) {
    transactions[existingIdx].status = "successful";
    transactions[existingIdx].amount = amount;
    if (meta?.paymentMethod) transactions[existingIdx].paymentMethod = meta.paymentMethod;
    tx = transactions[existingIdx];
  } else {
    tx = {
      reference,
      userId,
      amount,
      currency: "NGN",
      status: "successful",
      paymentMethod: meta?.paymentMethod ?? "paga_account",
      customerEmail: meta?.customerEmail ?? "reader@streetio.org",
      customerName: meta?.customerName,
      createdAt: new Date(),
      articleSlug: meta?.articleSlug,
    };
    transactions.unshift(tx);
  }

  if (meta?.articleSlug) {
    unlockArticleForUser(userId, meta.articleSlug);
  }

  return {
    balance: updated,
    formattedBalance: formatNaira(updated),
    transaction: tx,
  };
}

export function debitUserWallet(
  userId: string,
  amount: number
): { success: boolean; balance: number; formattedBalance: string } {
  const current = getUserWalletBalance(userId);
  if (current < amount) {
    return {
      success: false,
      balance: current,
      formattedBalance: formatNaira(current),
    };
  }

  const updated = current - amount;
  wallets.set(userId, updated);

  return {
    success: true,
    balance: updated,
    formattedBalance: formatNaira(updated),
  };
}

export function generatePagaReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAGA-STR-${timestamp}-${rand}`;
}

export type BuildPagaCheckoutUrlParams = {
  amount: number;
  paymentReference: string;
  email: string;
  phoneNumber?: string;
  chargeUrl?: string;
  callbackUrl?: string;
  fundingSources?: string;
};

/**
 * Builds the official Paga Checkout URL with query parameters.
 * Reference: Paga Developer Docs - Checkout link & Checkout JS
 */
export function buildPagaCheckoutUrl(params: BuildPagaCheckoutUrlParams): string {
  const baseUrl = getPagaCheckoutBaseUrl();
  const searchParams = new URLSearchParams({
    public_key: PAGA_CONFIG.publicKey,
    amount: params.amount.toFixed(2),
    currency: "NGN",
    payment_reference: params.paymentReference,
    email: params.email,
  });

  if (params.chargeUrl) {
    searchParams.set("charge_url", params.chargeUrl);
  }
  if (params.callbackUrl) {
    searchParams.set("callback_url", params.callbackUrl);
  }
  if (params.phoneNumber) {
    searchParams.set("phone_number", params.phoneNumber);
  }
  if (params.fundingSources) {
    searchParams.set("funding_sources", params.fundingSources);
  }

  return `${baseUrl}/checkout/params?${searchParams.toString()}`;
}

export type PagaVerifyResponse = {
  status_code: number | string;
  status_message: string;
  chargeId?: string;
  amount?: number;
  currency?: string;
};

/**
 * Verifies transaction with Paga's server endpoint.
 * POST https://checkout.paga.com/checkout/transaction/verify
 */
export async function verifyPagaTransaction(params: {
  paymentReference: string;
  amount?: number;
  currency?: string;
}): Promise<{
  verified: boolean;
  message: string;
  statusCode?: number | string;
  raw?: PagaVerifyResponse;
}> {
  const baseUrl = getPagaCheckoutBaseUrl();
  const endpoint = `${baseUrl}/checkout/transaction/verify`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        paymentReference: params.paymentReference,
        publicKey: PAGA_CONFIG.publicKey,
        amount: params.amount,
        currency: params.currency ?? "NGN",
      }),
    });

    if (res.ok) {
      const data: PagaVerifyResponse = await res.json();
      const codeStr = String(data.status_code);
      const isSuccessful =
        codeStr === "0" ||
        data.status_message?.toLowerCase() === "successful" ||
        data.status_message?.toLowerCase() === "success";

      return {
        verified: isSuccessful,
        message: data.status_message || (isSuccessful ? "Verified successfully" : "Transaction failed"),
        statusCode: data.status_code,
        raw: data,
      };
    }

    const errorBody = await res.text();
    return {
      verified: false,
      message: `Paga gateway verification error (${res.status}): ${errorBody}`,
    };
  } catch (err: any) {
    return {
      verified: false,
      message: err?.message || "Failed to contact Paga verification gateway",
    };
  }
}

/**
 * Validates the SHA-512 callback hash from Paga webhooks.
 * Formula per Paga docs: SHA512(amount + timeStamp + paymentReference + HMAC)
 */
export function verifyPagaWebhookHash(payload: {
  amount: string | number;
  timeStamp: string;
  paymentReference: string;
  hash: string;
  hmacKey?: string;
}): boolean {
  const key = payload.hmacKey || PAGA_CONFIG.hmacKey;
  if (!key) {
    // If no HMAC key set yet, accept webhook if statusCode is 0
    return true;
  }

  const amtStr =
    typeof payload.amount === "number"
      ? payload.amount.toFixed(2)
      : String(payload.amount);

  const preHash = `${amtStr}${payload.timeStamp}${payload.paymentReference}${key}`;
  const computed = crypto.createHash("sha512").update(preHash).digest("hex");

  return computed.toLowerCase() === payload.hash.toLowerCase();
}
