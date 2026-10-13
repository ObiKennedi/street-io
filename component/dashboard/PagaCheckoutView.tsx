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
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

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

  // Auto-verify if returning from Paga redirect (charge_url callback)
  useEffect(() => {
    if (returnReference && !successReceipt) {
      handleVerifyReference(returnReference);
    }
  }, [returnReference, returnStatusCode]);

  // Listen for Paga close-iframe postMessage
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data === "close-iframe") {
        setIsInlineModalOpen(false);
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, []);

  // Auto-poll verification while inline modal is active
  useEffect(() => {
    if (!isInlineModalOpen || !activeSession?.reference) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/paga/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: activeSession.reference,
            amount,
            articleSlug: targetArticle?.slug,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setIsInlineModalOpen(false);
          setSuccessReceipt({
            reference: data.reference,
            amount: data.amount,
            newBalance: data.balance,
          });
          setActiveSession(null);
          router.refresh();
        }
      } catch {
        // silent polling retry
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isInlineModalOpen, activeSession, amount, targetArticle, router]);

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

      // Launch official Paga Checkout Inline Modal
      setIsIframeLoading(true);
      setIsInlineModalOpen(true);
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

            {hasSufficientWalletBalance ? (
              /* User has enough reader wallet balance -> Unlock directly with wallet */
              <div className="paga-checkout__body">
                <div style={{
                  padding: "var(--space-4)",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "bold", color: "#065F46" }}>
                    ✓ Sufficient Wallet Balance Available
                  </span>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "#047857" }}>
                    You have <strong>{formatNaira(walletBalance)}</strong> in your reader wallet. Unlock this guide instantly without making a new payment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDirectWalletUnlock}
                  disabled={isProcessing}
                  className="paga-checkout__pay-btn"
                  style={{ background: "#10B981" }}
                >
                  <span>
                    {isProcessing ? "Unlocking Guide..." : `Unlock with Wallet (${formatNaira(amount)})`}
                  </span>
                  <span aria-hidden="true">✓</span>
                </button>
              </div>
            ) : (
              /* User needs to fund/pay via official Paga Gateway */
              <div className="paga-checkout__body">
                {/* Order Summary Box */}
                <div className="paga-checkout__order-card">
                  <div className="paga-checkout__order-row">
                    <span className="paga-checkout__order-label">Item</span>
                    <strong className="paga-checkout__order-value">
                      {targetArticle ? targetArticle.title : "Street IO Reader Wallet Funding"}
                    </strong>
                  </div>
                  <div className="paga-checkout__order-row">
                    <span className="paga-checkout__order-label">Reader Account</span>
                    <span className="paga-checkout__order-value">
                      {customerName} ({customerEmail})
                    </span>
                  </div>
                  <div className="paga-checkout__order-row">
                    <span className="paga-checkout__order-label">Current Balance</span>
                    <span className="paga-checkout__order-value" style={{ fontFamily: "var(--font-mono)" }}>
                      {formatNaira(walletBalance)}
                    </span>
                  </div>
                </div>

                {/* Supported payment channels in Paga */}
                <div className="paga-checkout__supported-channels">
                  <span className="paga-checkout__channels-title">
                    Instant payment options available in Paga checkout:
                  </span>
                  <div className="paga-checkout__channel-chips">
                    <span className="paga-checkout__channel-chip">💳 Card (Mastercard, Visa, Verve)</span>
                    <span className="paga-checkout__channel-chip">🏦 Bank Transfer</span>
                    <span className="paga-checkout__channel-chip">📱 USSD (*242#)</span>
                    <span className="paga-checkout__channel-chip">🟠 Paga Wallet</span>
                  </div>
                </div>

                {/* Primary Launch Action */}
                <button
                  type="button"
                  onClick={handleLaunchPagaCheckout}
                  disabled={isProcessing}
                  className="paga-checkout__pay-btn"
                >
                  <span>
                    {isProcessing
                      ? "Opening Paga Checkout..."
                      : `Pay ${formatNaira(amount)} with Paga`}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}

            {/* Paga Trust Footer */}
            <div className="paga-checkout__footer">
              <span>Customer: {customerName} ({customerEmail})</span>
              <span>·</span>
              <span>Paga Group Secured</span>
            </div>
          </>
        )}
      </div>

      {/* Official Paga Checkout Inline Modal */}
      {isInlineModalOpen && activeSession && (
        <div
          className="paga-inline-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paga-modal-title"
        >
          <div
            className="paga-inline-modal__backdrop"
            onClick={() => setIsInlineModalOpen(false)}
          />
          <div className="paga-inline-modal__dialog">
            {/* Modal Header */}
            <div className="paga-inline-modal__header">
              <div className="paga-inline-modal__header-left">
                <span className="paga-inline-modal__badge">paga</span>
                <div>
                  <h3 id="paga-modal-title" className="paga-inline-modal__title">
                    Paga Secure Checkout
                  </h3>
                  <span className="paga-inline-modal__subtitle">
                    Street IO · Ref: {activeSession.reference}
                  </span>
                </div>
              </div>
              <div className="paga-inline-modal__header-right">
                <span className="paga-inline-modal__amount">
                  {formatNaira(amount)}
                </span>
                <a
                  href={activeSession.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paga-inline-modal__external-link"
                  title="Open checkout in new window if preferred"
                >
                  ↗ New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setIsInlineModalOpen(false)}
                  className="paga-inline-modal__close-btn"
                  aria-label="Close payment modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe */}
            <div className="paga-inline-modal__body">
              {isIframeLoading && (
                <div className="paga-inline-modal__loader">
                  <div className="paga-inline-modal__spinner" />
                  <p>Connecting securely to Paga Gateway...</p>
                  <span>Cards, Bank Transfers, USSD, and Wallets accepted</span>
                </div>
              )}
              <iframe
                src={activeSession.checkoutUrl}
                title="Paga Payment Checkout"
                className="paga-inline-modal__iframe"
                allow="payment"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>

            {/* Modal Footer */}
            <div className="paga-inline-modal__footer">
              <div className="paga-inline-modal__status-info">
                <span className="paga-inline-modal__pulse" />
                <span>Auto-confirming once payment is received...</span>
              </div>
              <button
                type="button"
                onClick={() => handleVerifyReference(activeSession.reference)}
                disabled={isProcessing}
                className="paga-inline-modal__verify-btn"
              >
                {isProcessing ? "Verifying..." : "I've Completed Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PagaCheckoutView;
