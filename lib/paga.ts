// File: lib/paga.ts
// Paga payment integration and reader wallet state for Street IO.

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

export const PAGA_MERCHANT_DETAILS = {
  pagaTag: process.env.PAGA_TAG ?? "$Streetio",
  bankName: process.env.PAGA_BANK ?? "Paga",
  accountNumber: process.env.PAGA_ACCOUNT_NUMBER ?? "1031881015",
  accountName: "Streetio",
} as const;

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

export function creditUserWallet(
  userId: string,
  amount: number,
  reference: string,
  meta?: { customerEmail: string; customerName?: string; articleSlug?: string }
): { balance: number; formattedBalance: string; transaction: PagaTransaction } {
  const current = getUserWalletBalance(userId);
  const updated = current + amount;
  wallets.set(userId, updated);

  const tx: PagaTransaction = {
    reference,
    userId,
    amount,
    currency: "NGN",
    status: "successful",
    paymentMethod: "paga_account",
    customerEmail: meta?.customerEmail ?? "reader@streetio.org",
    customerName: meta?.customerName,
    createdAt: new Date(),
    articleSlug: meta?.articleSlug,
  };

  transactions.unshift(tx);

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
