// File: lib/manual-payments.ts
// Manual Bank Transfer payment slips management and persistence for Street IO

import fs from "fs/promises";
import path from "path";
import { creditUserWallet, unlockArticleForUser, formatNaira } from "./paga";
import { ARTICLES_DATABASE } from "./articles";
import { sendTelegramNotification } from "./telegram";

export const MANUAL_PAYMENT_CONFIG = {
  bankName: process.env.MANUAL_PAYMENT_BANK || "Moniepoint",
  accountNumber: process.env.MANUAL_PAYMENT_ACCOUNT_NUMBER || "7067997301",
  accountName: process.env.MANUAL_PAYMENT_ACCOUNT_NAME || "Sopulu omah",
} as const;

export type ManualPaymentSlip = {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  receiptUrl: string;
  receiptPublicId?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  senderName?: string;
  purpose: "wallet_funding" | "article_purchase";
  articleSlug?: string;
  articleTitle?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string; // ISO
  reviewedAt?: string;
  reviewedBy?: string;
};

// Global in-memory cache to stay fast and survive hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __streetio_manual_payments: ManualPaymentSlip[] | undefined;
  // eslint-disable-next-line no-var
  var __streetio_wallet_debits: WalletDebit[] | undefined;
}

if (!globalThis.__streetio_manual_payments) {
  globalThis.__streetio_manual_payments = [];
}

export type WalletDebit = {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number;
  articleSlug?: string;
  description?: string;
  createdAt: string;
};

if (!globalThis.__streetio_wallet_debits) {
  globalThis.__streetio_wallet_debits = [];
}

function getDebitStorageCandidates(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "scratch", "wallet-debits.json"),
    path.join(cwd, "street-io", "scratch", "wallet-debits.json"),
    path.join(path.dirname(cwd), "scratch", "wallet-debits.json"),
    path.join(path.dirname(cwd), "street-io", "scratch", "wallet-debits.json"),
  ];
}

function getPrimaryDebitStoragePath(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("street-io")) {
    return path.join(cwd, "scratch", "wallet-debits.json");
  }
  return path.join(cwd, "street-io", "scratch", "wallet-debits.json");
}

export async function loadStoredDebits(): Promise<WalletDebit[]> {
  for (const candidate of getDebitStorageCandidates()) {
    try {
      const raw = await fs.readFile(candidate, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__streetio_wallet_debits = parsed;
        return parsed;
      }
    } catch {}
  }
  return globalThis.__streetio_wallet_debits || [];
}

export async function recordWalletDebit(
  userId: string,
  amount: number,
  userEmail?: string,
  articleSlug?: string,
  description?: string
): Promise<WalletDebit> {
  const debits = await loadStoredDebits();
  const newDebit: WalletDebit = {
    id: `debit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userEmail,
    amount,
    articleSlug,
    description: description || "Article purchase via reader wallet",
    createdAt: new Date().toISOString(),
  };

  debits.unshift(newDebit);
  globalThis.__streetio_wallet_debits = debits;

  const primary = getPrimaryDebitStoragePath();
  try {
    await fs.mkdir(path.dirname(primary), { recursive: true });
    await fs.writeFile(primary, JSON.stringify(debits, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write wallet-debits.json:", err);
  }

  try {
    const secondary = path.join(process.cwd(), "scratch", "wallet-debits.json");
    if (secondary !== primary) {
      await fs.mkdir(path.dirname(secondary), { recursive: true });
      await fs.writeFile(secondary, JSON.stringify(debits, null, 2), "utf-8");
    }
  } catch {}

  return newDebit;
}

function getStorageCandidates(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "scratch", "manual-payments.json"),
    path.join(cwd, "street-io", "scratch", "manual-payments.json"),
    path.join(path.dirname(cwd), "scratch", "manual-payments.json"),
    path.join(path.dirname(cwd), "street-io", "scratch", "manual-payments.json"),
  ];
}

function getPrimaryStoragePath(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("street-io")) {
    return path.join(cwd, "scratch", "manual-payments.json");
  }
  return path.join(cwd, "street-io", "scratch", "manual-payments.json");
}

// Helper to load persisted records from disk
async function loadStoredPayments(): Promise<ManualPaymentSlip[]> {
  for (const candidate of getStorageCandidates()) {
    try {
      const raw = await fs.readFile(candidate, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__streetio_manual_payments = parsed;
        return parsed;
      }
    } catch {
      // try next candidate
    }
  }
  return globalThis.__streetio_manual_payments || [];
}

// Helper to save records to disk
async function persistPayments(payments: ManualPaymentSlip[]): Promise<void> {
  globalThis.__streetio_manual_payments = payments;
  const primary = getPrimaryStoragePath();
  try {
    const dir = path.dirname(primary);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(primary, JSON.stringify(payments, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write primary manual-payments.json:", err);
  }

  // Also write to secondary cwd path if distinct so both stay perfectly synchronized
  try {
    const secondary = path.join(process.cwd(), "scratch", "manual-payments.json");
    if (secondary !== primary) {
      await fs.mkdir(path.dirname(secondary), { recursive: true });
      await fs.writeFile(secondary, JSON.stringify(payments, null, 2), "utf-8");
    }
  } catch {
    // ignore
  }
}

export type UserWalletSummary = {
  balance: number;
  currency: string;
  formattedBalance: string;
  pendingAmount: number;
  formattedPendingAmount: string;
  hasPending: boolean;
  unlockedSlugs: string[];
  approvedCount: number;
  pendingCount: number;
};

/**
 * Resolve a user's wallet state accurately from:
 * 1. Approved & Pending manual payment slips (persisted to disk)
 * 2. Recorded wallet debits (persisted to disk)
 * 3. Neon PostgreSQL Database via Prisma (when available)
 * 4. In-memory hot state
 */
export async function resolveUserWalletState(
  userId: string,
  userEmail?: string
): Promise<UserWalletSummary> {
  const payments = await loadStoredPayments();
  const debits = await loadStoredDebits();

  // Find all slips for this user (matching by userId or userEmail)
  const userSlips = payments.filter((slip) => {
    if (slip.userId && slip.userId === userId) return true;
    if (
      userEmail &&
      slip.userEmail &&
      slip.userEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  // Find all debits for this user
  const userDebits = debits.filter((d) => {
    if (d.userId && d.userId === userId) return true;
    if (
      userEmail &&
      d.userEmail &&
      d.userEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  });

  const totalDebits = userDebits.reduce((sum, d) => sum + d.amount, 0);

  let approvedFunding = 0;
  let pendingAmount = 0;
  let approvedCount = 0;
  let pendingCount = 0;
  const unlockedSlugs: string[] = [];

  for (const slip of userSlips) {
    if (slip.status === "approved") {
      approvedCount += 1;
      if (slip.purpose === "wallet_funding") {
        approvedFunding += slip.amount;
      } else if (slip.purpose === "article_purchase" && slip.articleSlug) {
        unlockedSlugs.push(slip.articleSlug.toLowerCase());
        unlockArticleForUser(userId, slip.articleSlug);
      }
    } else if (slip.status === "pending") {
      pendingCount += 1;
      pendingAmount += slip.amount;
    }
  }

  // Also include articles unlocked via wallet debits
  for (const d of userDebits) {
    if (d.articleSlug) {
      unlockedSlugs.push(d.articleSlug.toLowerCase());
      unlockArticleForUser(userId, d.articleSlug);
    }
  }

  const netApprovedFunding = Math.max(0, approvedFunding - totalDebits);

  // Also query PostgreSQL database if reachable
  let dbBalance: number | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (user && typeof user.walletBalance === "number") {
      dbBalance = user.walletBalance;
    }
  } catch {
    // If DB is offline or getaddrinfo fails, dbBalance stays null
  }

  const { getUserWalletBalance } = await import("./paga");
  const memoryBalance = getUserWalletBalance(userId);

  // Balance priority: if DB has a non-negative balance, reconcile with netApprovedFunding
  const finalBalance =
    dbBalance !== null
      ? Math.max(dbBalance, netApprovedFunding)
      : Math.max(netApprovedFunding, memoryBalance);

  // Sync in-memory map so synchronous calls remain consistent
  creditUserWallet(userId, 0, "SYNC", { balanceOverride: finalBalance });

  return {
    balance: finalBalance,
    currency: "₦",
    formattedBalance: formatNaira(finalBalance),
    pendingAmount,
    formattedPendingAmount: formatNaira(pendingAmount),
    hasPending: pendingAmount > 0,
    unlockedSlugs: Array.from(new Set(unlockedSlugs)),
    approvedCount,
    pendingCount,
  };
}

/**
 * Debit a user's wallet when they purchase an article with their balance.
 * Reconciles across DB, disk debits, and in-memory caches.
 */
export async function debitUserWalletState(
  userId: string,
  amount: number,
  userEmail?: string,
  articleSlug?: string,
  description?: string
): Promise<{ success: boolean; balance: number; formattedBalance: string; error?: string }> {
  const walletState = await resolveUserWalletState(userId, userEmail);

  if (walletState.balance < amount) {
    return {
      success: false,
      balance: walletState.balance,
      formattedBalance: walletState.formattedBalance,
      error: `Insufficient reader wallet balance. You have ${walletState.formattedBalance}, but this guide requires ${formatNaira(amount)}.`,
    };
  }

  const newBalance = Math.max(0, walletState.balance - amount);

  // 1. Sync in-memory map
  creditUserWallet(userId, 0, "SYNC", { balanceOverride: newBalance });

  // 2. Persist debit record to disk
  await recordWalletDebit(userId, amount, userEmail, articleSlug, description);

  // 3. Unlock article in runtime
  if (articleSlug) {
    unlockArticleForUser(userId, articleSlug);
  }

  // 4. Update Neon PostgreSQL DB via Prisma if reachable
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: amount },
      },
    });

    await prisma.walletTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: "debit",
        description: description || "Article purchase via reader wallet",
      },
    });

    if (articleSlug) {
      const dbArticle = await prisma.article.findUnique({
        where: { slug: articleSlug },
      });
      if (dbArticle) {
        await prisma.purchase.create({
          data: {
            userId,
            articleId: dbArticle.id,
            amount,
          },
        });
        await prisma.article.update({
          where: { id: dbArticle.id },
          data: {
            soldCopies: { increment: 1 },
            revenueGenerated: { increment: Math.round(amount) },
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Wallet Debit] Prisma DB sync skipped or failed:", err);
  }

  return {
    success: true,
    balance: newBalance,
    formattedBalance: formatNaira(newBalance),
  };
}

export type AdminPlatformStats = {
  totalRevenueNaira: number;
  totalArticleSales: number;
  averageOrderValue: number;
  settledViaPaga: number;
  pendingEscrow: number;
  dailyRevenueDelta: string;
  totalSlipsCount: number;
  pendingSlipsCount: number;
  approvedSlipsCount: number;
  rejectedSlipsCount: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "moderator";
    status: "active" | "blocked" | "under_review";
    joinedDate: string;
    totalPurchases: number;
    totalSpent: number;
    walletBalance: number;
  }>;
};

/**
 * Calculates complete platform metrics for the Admin Dashboard.
 * Reconciles across all persisted manual payments, debits, and PostgreSQL records.
 * Never resets to zero on page reload.
 */
export async function getAdminPlatformStats(): Promise<AdminPlatformStats> {
  const slips = await loadStoredPayments();
  const debits = await loadStoredDebits();

  const approvedSlips = slips.filter((s) => s.status === "approved");
  const pendingSlips = slips.filter((s) => s.status === "pending");
  const rejectedSlips = slips.filter((s) => s.status === "rejected");

  const approvedSlipsVolume = approvedSlips.reduce((sum, s) => sum + s.amount, 0);
  const pendingSlipsVolume = pendingSlips.reduce((sum, s) => sum + s.amount, 0);

  // Article sales count: direct purchase slips + wallet debits for articles
  const directArticleSlips = approvedSlips.filter((s) => s.purpose === "article_purchase");
  const articleDebits = debits.filter((d) => Boolean(d.articleSlug));
  const totalArticleSales = directArticleSlips.length + articleDebits.length;

  // Total revenue is all money verified in system (approved slips volume)
  const totalRevenueNaira = approvedSlipsVolume;
  const aov = totalArticleSales > 0 ? Math.round(totalRevenueNaira / totalArticleSales) : 0;
  const settledViaBank = approvedSlipsVolume;
  const pendingEscrow = pendingSlipsVolume;

  // Aggregate user records
  const userMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "moderator";
    status: "active" | "blocked" | "under_review";
    joinedDate: string;
    totalPurchases: number;
    totalSpent: number;
    walletBalance: number;
  }>();

  // Populate from slips
  for (const s of slips) {
    const key = (s.userEmail || s.userId).toLowerCase();
    const existing = userMap.get(key) || {
      id: s.userId,
      name: s.userName || "Reader",
      email: s.userEmail || "reader@streetio.org",
      role: "user",
      status: "active",
      joinedDate: s.createdAt ? s.createdAt.split("T")[0] : "2026-11-01",
      totalPurchases: 0,
      totalSpent: 0,
      walletBalance: 0,
    };

    if (s.status === "approved") {
      existing.totalSpent += s.amount;
      if (s.purpose === "article_purchase") {
        existing.totalPurchases += 1;
      }
    }
    userMap.set(key, existing);
  }

  // Populate from debits
  for (const d of debits) {
    const key = (d.userEmail || d.userId).toLowerCase();
    const existing = userMap.get(key);
    if (existing) {
      if (d.articleSlug) {
        existing.totalPurchases += 1;
      }
    }
  }

  // Also query PostgreSQL DB if reachable
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbUsers = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    for (const u of dbUsers) {
      const key = u.email.toLowerCase();
      const existing = userMap.get(key) || {
        id: u.id,
        name: u.name,
        email: u.email,
        role: (u.role as any) || "user",
        status: "active",
        joinedDate: u.createdAt ? u.createdAt.toISOString().split("T")[0] : "2026-11-01",
        totalPurchases: 0,
        totalSpent: 0,
        walletBalance: u.walletBalance || 0,
      };

      existing.walletBalance = Math.max(existing.walletBalance, u.walletBalance || 0);
      existing.role = (u.role as any) || existing.role;
      userMap.set(key, existing);
    }
  } catch {
    // If DB offline, continue with userMap from slips
  }

  const users = Array.from(userMap.values());

  return {
    totalRevenueNaira,
    totalArticleSales,
    averageOrderValue: aov,
    settledViaPaga: settledViaBank,
    pendingEscrow,
    dailyRevenueDelta: totalRevenueNaira > 0 ? "+100%" : "0%",
    totalSlipsCount: slips.length,
    pendingSlipsCount: pendingSlips.length,
    approvedSlipsCount: approvedSlips.length,
    rejectedSlipsCount: rejectedSlips.length,
    users,
  };
}

/**
 * Get all manual payment slips (sorted newest first)
 */
export async function getAllManualPayments(): Promise<ManualPaymentSlip[]> {
  const list = await loadStoredPayments();
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Submit a new manual payment slip
 */
export async function submitManualPayment(params: {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  receiptUrl: string;
  receiptPublicId?: string;
  senderName?: string;
  purpose: "wallet_funding" | "article_purchase";
  articleSlug?: string;
}): Promise<ManualPaymentSlip> {
  const payments = await loadStoredPayments();

  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const reference = `MANUAL-STR-${timestamp}-${rand}`;
  const id = `slip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let articleTitle: string | undefined;
  if (params.articleSlug) {
    const found = ARTICLES_DATABASE.find((a) => a.slug === params.articleSlug);
    articleTitle = found ? found.title : params.articleSlug;
  }

  const newSlip: ManualPaymentSlip = {
    id,
    reference,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    amount: params.amount,
    receiptUrl: params.receiptUrl,
    receiptPublicId: params.receiptPublicId,
    bankName: MANUAL_PAYMENT_CONFIG.bankName,
    accountNumber: MANUAL_PAYMENT_CONFIG.accountNumber,
    accountName: MANUAL_PAYMENT_CONFIG.accountName,
    senderName: params.senderName?.trim() || params.userName,
    purpose: params.purpose,
    articleSlug: params.articleSlug,
    articleTitle,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  payments.unshift(newSlip);
  await persistPayments(payments);

  // Send real-time Telegram notification to Admin
  const purposeLabel =
    newSlip.purpose === "article_purchase" && newSlip.articleTitle
      ? `Article: "${newSlip.articleTitle}"`
      : "Reader Wallet Top-up";

  const telegramMsg =
    `🔔 <b>New Manual Payment Slip Uploaded!</b>\n\n` +
    `👤 <b>Reader:</b> ${newSlip.userName} (${newSlip.userEmail})\n` +
    `💰 <b>Amount:</b> ${formatNaira(newSlip.amount)}\n` +
    `📌 <b>Purpose:</b> ${purposeLabel}\n` +
    `🏦 <b>Target Bank:</b> ${newSlip.bankName} (${newSlip.accountNumber} - ${newSlip.accountName})\n` +
    `👤 <b>Sender Name:</b> ${newSlip.senderName || "Not provided"}\n` +
    `🆔 <b>Reference:</b> <code>${newSlip.reference}</code>\n\n` +
    `👉 <i>Log in to the Admin Dashboard to review and verify this receipt.</i>`;

  // Send real-time Telegram notification to Admin (await to ensure delivery in serverless/Next.js)
  try {
    await sendTelegramNotification({
      text: telegramMsg,
      photoUrl: newSlip.receiptUrl,
    });
  } catch (err) {
    console.error("[Manual Payments] Telegram alert error:", err);
  }

  return newSlip;
}

/**
 * Approve a manual payment slip
 */
export async function approveManualPayment(
  slipId: string,
  adminIdentifier = "Admin"
): Promise<{ success: boolean; slip?: ManualPaymentSlip; error?: string }> {
  const payments = await loadStoredPayments();
  const slip = payments.find((p) => p.id === slipId);

  if (!slip) {
    return { success: false, error: "Payment slip not found." };
  }

  if (slip.status === "approved") {
    return { success: true, slip };
  }

  slip.status = "approved";
  slip.reviewedAt = new Date().toISOString();
  slip.reviewedBy = adminIdentifier;

  // Credit user wallet and unlock article if applicable
  if (slip.purpose === "wallet_funding") {
    creditUserWallet(slip.userId, slip.amount, slip.reference, {
      customerEmail: slip.userEmail,
      customerName: slip.userName,
      paymentMethod: "bank_transfer",
    });
  } else if (slip.purpose === "article_purchase" && slip.articleSlug) {
    unlockArticleForUser(slip.userId, slip.articleSlug);
    // Credit wallet with reference so transaction history is recorded
    creditUserWallet(slip.userId, slip.amount, slip.reference, {
      customerEmail: slip.userEmail,
      customerName: slip.userName,
      articleSlug: slip.articleSlug,
      paymentMethod: "bank_transfer",
    });
  }

  // Update Neon PostgreSQL DB via Prisma if reachable
  try {
    const { prisma } = await import("@/lib/prisma");
    if (slip.purpose === "wallet_funding") {
      await prisma.user.update({
        where: { id: slip.userId },
        data: {
          walletBalance: { increment: slip.amount },
        },
      });
      await prisma.walletTransaction.create({
        data: {
          userId: slip.userId,
          amount: slip.amount,
          type: "credit",
          description: `Manual transfer (${slip.bankName}) - Ref: ${slip.reference}`,
        },
      });
    } else if (slip.purpose === "article_purchase" && slip.articleSlug) {
      const dbArticle = await prisma.article.findUnique({
        where: { slug: slip.articleSlug },
      });
      if (dbArticle) {
        await prisma.purchase.create({
          data: {
            userId: slip.userId,
            articleId: dbArticle.id,
            amount: slip.amount,
          },
        });
        await prisma.article.update({
          where: { id: dbArticle.id },
          data: {
            soldCopies: { increment: 1 },
            revenueGenerated: { increment: Math.round(slip.amount) },
          },
        });
      }
    }
  } catch (dbErr) {
    console.warn("[Manual Payments] Prisma DB sync skipped or failed:", dbErr);
  }

  await persistPayments(payments);

  // Send Telegram approval confirmation
  const telegramMsg =
    `✅ <b>Payment Slip Approved!</b>\n\n` +
    `👤 <b>Reader:</b> ${slip.userName} (${slip.userEmail})\n` +
    `💰 <b>Amount:</b> ${formatNaira(slip.amount)}\n` +
    `📌 <b>Purpose:</b> ${slip.articleTitle || "Wallet Top-up"}\n` +
    `🆔 <b>Reference:</b> <code>${slip.reference}</code>\n` +
    `🛡️ <b>Approved By:</b> ${adminIdentifier}`;

  try {
    await sendTelegramNotification({ text: telegramMsg });
  } catch (err) {
    console.error("[Manual Payments] Telegram approval alert error:", err);
  }

  return { success: true, slip };
}

/**
 * Reject a manual payment slip
 */
export async function rejectManualPayment(
  slipId: string,
  reason: string,
  adminIdentifier = "Admin"
): Promise<{ success: boolean; slip?: ManualPaymentSlip; error?: string }> {
  const payments = await loadStoredPayments();
  const slip = payments.find((p) => p.id === slipId);

  if (!slip) {
    return { success: false, error: "Payment slip not found." };
  }

  slip.status = "rejected";
  slip.rejectionReason = reason || "Payment could not be verified on bank records.";
  slip.reviewedAt = new Date().toISOString();
  slip.reviewedBy = adminIdentifier;

  await persistPayments(payments);

  // Send Telegram rejection update
  const telegramMsg =
    `❌ <b>Payment Slip Rejected</b>\n\n` +
    `👤 <b>Reader:</b> ${slip.userName} (${slip.userEmail})\n` +
    `💰 <b>Amount:</b> ${formatNaira(slip.amount)}\n` +
    `⚠️ <b>Reason:</b> ${slip.rejectionReason}\n` +
    `🆔 <b>Reference:</b> <code>${slip.reference}</code>\n` +
    `🛡️ <b>Rejected By:</b> ${adminIdentifier}`;

  try {
    await sendTelegramNotification({ text: telegramMsg });
  } catch (err) {
    console.error("[Manual Payments] Telegram rejection alert error:", err);
  }

  return { success: true, slip };
}

