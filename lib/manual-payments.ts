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
}

if (!globalThis.__streetio_manual_payments) {
  globalThis.__streetio_manual_payments = [];
}

const STORAGE_FILE = path.join(process.cwd(), "scratch", "manual-payments.json");

// Helper to load persisted records from disk
async function loadStoredPayments(): Promise<ManualPaymentSlip[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      globalThis.__streetio_manual_payments = parsed;
      return parsed;
    }
  } catch {
    // File doesn't exist yet or invalid JSON
  }
  return globalThis.__streetio_manual_payments || [];
}

// Helper to save records to disk
async function persistPayments(payments: ManualPaymentSlip[]): Promise<void> {
  globalThis.__streetio_manual_payments = payments;
  try {
    const dir = path.dirname(STORAGE_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(STORAGE_FILE, JSON.stringify(payments, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write manual-payments.json:", err);
  }
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

