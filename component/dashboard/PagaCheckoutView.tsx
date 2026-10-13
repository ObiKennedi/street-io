// File: component/dashboard/PagaCheckoutView.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Article } from "@/lib/articles";
import { formatNaira, PAGA_MERCHANT_DETAILS } from "@/lib/paga";
import "./paga-checkout.scss";

type PagaCheckoutViewProps = {
  initialAmount?: number;
  targetArticle?: Article | null;
  customerName?: string;
  customerEmail?: string;
  userWalletBalance?: number;
  returnReference?: string | null;
  returnStatusCode?: string;
  returnStatusMessage?: string;
};

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000];

export function PagaCheckoutView({
  initialAmount = 5000,
  targetArticle,
  customerName = "Reader",
  customerEmail = "reader@streetio.org",
  userWalletBalance = 0,
  returnReference,
  returnStatusCode,
  returnStatusMessage,
}: PagaCheckoutViewProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [walletBalance, setWalletBalance] = useState<number>(userWalletBalance);
  const [activeChannel, setActiveChannel] = useState<"paga" | "transfer" | "card" | "ussd">("paga");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Paga checkout session initialized with official API
  const [activeSession, setActiveSession] = useState<{
    reference: string;
    checkoutUrl: string;
  } | null>(null);

  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
    isWalletDebit?: boolean;
  } | null>(null);

  // Form states
  const [pagaPhone, setPagaPhone] = useState("08034567890");
  const [pagaPin, setPagaPin] = useState("••••");

  // Auto-verify if returning from Paga redirect (charge_url callback)
  useEffect(() => {
    if (returnReference && !successReceipt) {
      handleVerifyReference(returnReference);
    }
  }, [returnReference, returnStatusCode]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(PAGA_MERCHANT_DETAILS.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  /**
   * Unlock target article directly using the reader's wallet balance
   * (Used whenever wallet balance is sufficient)
   */
  const handleDirectWalletUnlock = async () => {
    if (!targetArticle) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/article/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug: targetArticle.slug }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessReceipt({
          reference: "WALLET-DEBIT-" + Date.now().toString(36).toUpperCase(),
          amount,
          newBalance: data.balance,
          isWalletDebit: true,
        });
        setWalletBalance(data.balance);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Failed to unlock article with wallet balance.");
      }
    } catch (err: any) {
      console.error("Wallet unlock error:", err);
      setErrorMessage("Network error trying to unlock with wallet.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Initializes real live Paga Checkout session via official API.
   * Leverages Paga Public Key f9511100-a474-49d7-9045-4410ccf2e084
   */
  const handleLaunchPagaCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/paga/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          articleSlug: targetArticle?.slug,
          phoneNumber: pagaPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize Paga checkout");
      }

      setActiveSession({
        reference: data.reference,
        checkoutUrl: data.checkoutUrl,
      });

      // Redirect directly to official live Paga Checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error("Paga launch error:", err);
      setErrorMessage(err?.message || "Could not connect to Paga Gateway. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Verifies payment reference directly against Paga verification endpoint
   */
  const handleVerifyReference = async (refToVerify: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/paga/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: refToVerify,
          amount,
          articleSlug: targetArticle?.slug,
          statusCode: returnStatusCode,
          statusMessage: returnStatusMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessReceipt({
          reference: data.reference,
          amount: data.amount,
          newBalance: data.balance,
        });
        setActiveSession(null);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Payment verification failed or still pending on Paga.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage("Network error during verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const hasSufficientWalletBalance = targetArticle && walletBalance >= amount;

  return (
    <div className="paga-checkout">
      {/* Cancel and return link */}
      <Link href="/dashboard" className="paga-checkout__cancel">
        <span>←</span>
        <span>Cancel & Return to Dashboard</span>
      </Link>

      <div className="paga-checkout__card">
        {/* Paga Official Brand Top Bar */}
        <div className="paga-checkout__topbar">
          <div className="paga-checkout__brand">
            <span className="paga-checkout__logo">paga</span>
            <div className="paga-checkout__brand-text">
              <span>Secure Payment Gateway</span>
              <span>Merchant: Street IO</span>
            </div>
          </div>
          <span className="paga-checkout__secure-badge">
            🔒 256-Bit SSL
          </span>
        </div>

        {errorMessage && (
          <div style={{ margin: "var(--space-4) var(--space-6) 0" }}>
            <div className="paga-checkout__status-banner paga-checkout__status-banner--error">
              {errorMessage}
            </div>
          </div>
        )}

        {/* SUFFICIENT WALLET BALANCE CALLOUT (Primary: Buy from wallet!) */}
        {hasSufficientWalletBalance && !successReceipt && (
          <div style={{ margin: "var(--space-4) var(--space-6) 0" }}>
            <div
              style={{
                padding: "var(--space-4)",
                background: "#ECFDF5",
                border: "1.5px solid #10B981",
                borderRadius: "var(--radius-xl)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ color: "#065F46", fontSize: "13px" }}>
                  ✓ Reader Wallet Balance Available
                </strong>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#047857",
                    fontWeight: "bold",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Balance: {formatNaira(walletBalance)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#065F46" }}>
                You have sufficient funds in your reader wallet to unlock this guide directly without external Paga payment.
              </p>
              <button
                type="button"
                onClick={handleDirectWalletUnlock}
                disabled={isProcessing}
                className="paga-checkout__pay-btn"
                style={{
                  background: "#10B981",
                  height: "46px",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {isProcessing
                  ? "Unlocking with Wallet..."
                  : `Unlock Now with Reader Wallet (${formatNaira(amount)})`}
              </button>
            </div>
          </div>
        )}

        {successReceipt ? (
          /* Payment Success Confirmation */
          <div className="paga-checkout__success">
            <div className="paga-checkout__success-icon">✓</div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-charcoal-900)" }}>
              {successReceipt.isWalletDebit ? "Article Unlocked from Wallet!" : "Payment Verified via Paga!"}
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
              {successReceipt.isWalletDebit
                ? `Debited ${formatNaira(successReceipt.amount)} from your reader wallet. Access granted.`
                : `Your transaction of ${formatNaira(successReceipt.amount)} was confirmed on Paga and credited.`}
            </p>

            <div className="paga-checkout__receipt">
              <div className="paga-checkout__receipt-row">
                <span>Account:</span>
                <strong>{customerName} ({customerEmail})</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Transaction Ref:</span>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{successReceipt.reference}</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Settlement Method:</span>
                <span style={{ color: "var(--color-success)", fontWeight: "bold" }}>
                  {successReceipt.isWalletDebit ? "Reader Wallet Balance" : "Paga Live Gateway"}
                </span>
              </div>
              <div className="paga-checkout__receipt-row paga-checkout__receipt-row--bold">
                <span>Updated Reader Wallet:</span>
                <span>{formatNaira(successReceipt.newBalance)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", width: "100%", marginTop: "var(--space-2)" }}>
              {targetArticle ? (
                <Link
                  href={`/article/${targetArticle.slug}?unlocked=true`}
                  className="paga-checkout__pay-btn"
                  style={{ textDecoration: "none" }}
                >
                  Read &ldquo;{targetArticle.title.slice(0, 22)}...&rdquo; →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="paga-checkout__pay-btn"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Paga Checkout Gateway */
          <>
            {/* Merchant and Amount Summary */}
            <div className="paga-checkout__summary">
              <div className="paga-checkout__merchant-info">
                <span className="paga-checkout__merchant-label">Merchant</span>
                <span className="paga-checkout__merchant-name">Street IO</span>
                <span className="paga-checkout__item-desc">
                  {targetArticle ? `Guide: ${targetArticle.title}` : "Reader Wallet Deposit"}
                </span>
              </div>

              <div className="paga-checkout__amount-box">
                <span className="paga-checkout__amount-label">Total Due</span>
                <span className="paga-checkout__amount-val">{formatNaira(amount)}</span>
              </div>
            </div>

            {/* Quick Amount Selector (only if funding wallet directly) */}
            {!targetArticle && (
              <div className="paga-checkout__amount-changer" role="toolbar" aria-label="Quick deposit amounts">
                <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--color-steel-700)" }}>
                  Amount:
                </span>
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`paga-checkout__amount-pill${
                      amount === amt ? " paga-checkout__amount-pill--active" : ""
                    }`}
                    onClick={() => setAmount(amt)}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            )}

            {/* If target article and wallet is empty/insufficient, show callout */}
            {targetArticle && !hasSufficientWalletBalance && (
              <div style={{ margin: "var(--space-4) var(--space-6) 0" }}>
                <div
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    background: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12px",
                    color: "#92400E",
                  }}
                >
                  <span>
                    Wallet Balance: <strong>{formatNaira(walletBalance)}</strong> {walletBalance <= 0 ? "(Empty)" : "(Insufficient)"}
                  </span>
                  <span>Fund &amp; unlock via Paga</span>
                </div>
              </div>
            )}

            {/* Active Paga Session in progress notification */}
            {activeSession && (
              <div style={{ margin: "var(--space-4) var(--space-6) 0" }}>
                <div className="paga-checkout__active-session">
                  <div className="paga-checkout__active-session-title">
                    <span>⚡ Paga Gateway Session Active</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                      {activeSession.reference}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "11.5px", color: "var(--color-steel-800)" }}>
                    You are being redirected to Paga. If your payment completed, click verify below to finalize:
                  </p>
                  <div className="paga-checkout__active-session-actions">
                    <button
                      type="button"
                      onClick={() => handleVerifyReference(activeSession.reference)}
                      disabled={isProcessing}
                      className="paga-checkout__pay-btn"
                      style={{ height: "40px", fontSize: "13px" }}
                    >
                      {isProcessing ? "Verifying with Paga..." : "I Completed Payment · Verify Now"}
                    </button>
                    <a
                      href={activeSession.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paga-checkout__secondary-btn"
                    >
                      Re-open Paga ↗
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Paga Payment Channels Navigation */}
            <div className="paga-checkout__channels" role="tablist">
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "paga" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("paga")}
              >
                <span>🟠 Paga Live Checkout</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "transfer" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("transfer")}
              >
                <span>🏦 Bank Transfer</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "card" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("card")}
              >
                <span>💳 Card Gateway</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "ussd" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("ussd")}
              >
                <span>📱 USSD (*242#)</span>
              </button>
            </div>

            {/* Active Channel Details */}
            <div className="paga-checkout__body">
              {activeChannel === "paga" && (
                <>
                  <div className="paga-checkout__field-group">
                    <label className="paga-checkout__field-label">
                      Paga Phone Number or Account ID
                    </label>
                    <input
                      type="text"
                      value={pagaPhone}
                      onChange={(e) => setPagaPhone(e.target.value)}
                      placeholder="080XXXXXXXX or username"
                      className="paga-checkout__field-input"
                    />
                  </div>

                  <div className="paga-checkout__field-group">
                    <label className="paga-checkout__field-label">
                      Paga Account PIN
                    </label>
                    <input
                      type="password"
                      value={pagaPin}
                      onChange={(e) => setPagaPin(e.target.value)}
                      maxLength={4}
                      className="paga-checkout__field-input"
                    />
                  </div>

                  <div style={{
                    padding: "8px 12px",
                    background: "var(--color-steel-50)",
                    border: "1px solid var(--color-steel-300)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--color-charcoal-800)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span>Recipient $paga Tag:</span>
                    <strong style={{ fontFamily: "var(--font-mono)", color: "#EC6608" }}>{PAGA_MERCHANT_DETAILS.pagaTag}</strong>
                  </div>

                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-steel-700)" }}>
                    You will be seamlessly connected to Paga&apos;s live gateway to authorize debit from your wallet.
                  </p>
                </>
              )}

              {activeChannel === "transfer" && (
                <div className="paga-checkout__transfer-box">
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: "bold" }}>
                    Transfer to Dedicated Paga Account:
                  </p>

                  <div className="paga-checkout__account-row">
                    <div>
                      <div style={{ fontSize: "10.5px", color: "var(--color-steel-700)" }}>
                        Bank: <strong>{PAGA_MERCHANT_DETAILS.bankName}</strong> · Tag: <strong>{PAGA_MERCHANT_DETAILS.pagaTag}</strong>
                      </div>
                      <strong style={{ fontSize: "1.1rem", letterSpacing: "0.03em" }}>{PAGA_MERCHANT_DETAILS.accountNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="paga-checkout__copy-btn"
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="paga-checkout__timer-row">
                    <span>Account Name: <strong>{PAGA_MERCHANT_DETAILS.accountName}</strong></span>
                    <span>Amount: <strong>{formatNaira(amount)}</strong></span>
                  </div>
                </div>
              )}

              {activeChannel === "card" && (
                <>
                  <div style={{
                    padding: "12px",
                    background: "var(--color-steel-100)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--color-steel-900)",
                    lineHeight: 1.5,
                  }}>
                    💳 <strong>Paga Hosted Card Gateway:</strong> Clicking below launches Paga&apos;s PCI-DSS Level 1 compliant card checkout window supporting Mastercard, Visa, and Verve cards.
                  </div>
                </>
              )}

              {activeChannel === "ussd" && (
                <div className="paga-checkout__ussd-box">
                  <p style={{ margin: 0, fontSize: "var(--text-xs)" }}>
                    Dial this code from your registered phone:
                  </p>
                  <div className="paga-checkout__ussd-code">
                    *242*{amount}#
                  </div>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--color-steel-800)" }}>
                    Works across MTN, Airtel, Glo, and 9mobile. Enter PIN when prompted.
                  </p>
                </div>
              )}

              {/* Authorize & Pay Action Button */}
              <button
                type="button"
                onClick={handleLaunchPagaCheckout}
                disabled={isProcessing}
                className="paga-checkout__pay-btn"
              >
                <span>
                  {isProcessing
                    ? "Redirecting to Paga..."
                    : `Pay ${formatNaira(amount)} via Live Paga Gateway`}
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Paga Trust Footer */}
            <div className="paga-checkout__footer">
              <span>Customer: {customerName} ({customerEmail})</span>
              <span>·</span>
              <span>Paga Group Secured</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PagaCheckoutView;
