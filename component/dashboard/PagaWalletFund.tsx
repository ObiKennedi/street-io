// File: component/dashboard/PagaWalletFund.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Wallet } from "@/lib/dashboard";
import { type Article } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import { formatNaira, PAGA_MERCHANT_DETAILS } from "@/lib/paga";
import "./wallet-fund.scss";
import "./paga-checkout.scss";

type PagaWalletFundProps = {
  wallet: Wallet;
  targetArticle?: Article | null;
};

const PRESET_AMOUNTS = [
  { amount: 2000, tag: "Starter" },
  { amount: 5000, tag: "Popular" },
  { amount: 10000, tag: "Power" },
  { amount: 20000, tag: "Master" },
];

export function PagaWalletFund({ wallet, targetArticle }: PagaWalletFundProps) {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;
  const [currentBalance, setCurrentBalance] = useState<number>(wallet.balance);
  const [formattedBalance, setFormattedBalance] = useState<string>(wallet.formattedBalance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
  } | null>(null);
  const [inlineSession, setInlineSession] = useState<{
    reference: string;
    checkoutUrl: string;
  } | null>(null);
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

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
    if (!isInlineModalOpen || !inlineSession?.reference) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/paga/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: inlineSession.reference,
            amount: effectiveAmount,
            articleSlug: targetArticle?.slug,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setIsInlineModalOpen(false);
          setCurrentBalance(data.balance);
          setFormattedBalance(data.formattedBalance);
          setSuccessReceipt({
            reference: data.reference,
            amount: data.amount,
            newBalance: data.balance,
          });
          setIsModalOpen(true);
          setInlineSession(null);
          router.refresh();
        }
      } catch {
        // silent polling retry
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isInlineModalOpen, inlineSession, effectiveAmount, targetArticle, router]);

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
  };

  const handleVerifyReference = async (refToVerify: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/paga/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: refToVerify,
          amount: effectiveAmount,
          articleSlug: targetArticle?.slug,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsInlineModalOpen(false);
        setCurrentBalance(data.balance);
        setFormattedBalance(data.formattedBalance);
        setSuccessReceipt({
          reference: data.reference,
          amount: data.amount,
          newBalance: data.balance,
        });
        setIsModalOpen(true);
        setInlineSession(null);
        router.refresh();
      } else {
        alert(data.error || "Payment verification failed or still pending on Paga.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      alert("Network error verifying payment. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount,
          articleSlug: targetArticle?.slug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process Paga transaction");
      }

      if (data.checkoutUrl) {
        setInlineSession({
          reference: data.reference,
          checkoutUrl: data.checkoutUrl,
        });
        setIsModalOpen(false);
        setIsIframeLoading(true);
        setIsInlineModalOpen(true);
      } else {
        router.push(`/checkout/paga?amount=${effectiveAmount}`);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err?.message || "Network error processing payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="wallet-fund">
      {/* Back Link */}
      <nav aria-label="Breadcrumb">
        <Link href="/dashboard" className="wallet-fund__back">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </nav>

      {/* Header */}
      <header className="wallet-fund__head">
        <div className="wallet-fund__badge">
          <span className="wallet-fund__dot" aria-hidden="true" />
          <span>SECURE PAGA GATEWAY · NGN WALLET</span>
        </div>
        <h1 className="wallet-fund__title">Fund Reader Wallet</h1>
        <p className="wallet-fund__subtitle">
          Deposit Naira (₦) using Paga to unlock operational guides, intelligence dossiers, and playbooks.
        </p>
      </header>

      {/* Target Article Prompt if applicable */}
      {targetArticle && (
        <div className="wallet-fund__article-callout" role="alert">
          <CategoryIcon name="sparkles" size={18} />
          <div>
            <strong>Funding for Article:</strong> {targetArticle.title} ({targetArticle.price})
          </div>
        </div>
      )}

      {/* Current Wallet Balance Card */}
      <section className="wallet-fund__current-card" aria-label="Current reader balance">
        <div>
          <div className="wallet-fund__balance-label">
            <CategoryIcon name="wallet" size={13} />
            <span>Current Available Balance</span>
          </div>
          <p className="wallet-fund__balance-amount">{formattedBalance}</p>
        </div>
        <span className="wallet-fund__currency-pill">Nigerian Naira (NGN)</span>
      </section>

      {/* Main Funding Form */}
      <section className="wallet-fund__form">
        <div>
          <h2 className="wallet-fund__section-title">Select Deposit Amount (₦)</h2>
          <div className="wallet-fund__presets" role="radiogroup" aria-label="Preset funding amounts">
            {PRESET_AMOUNTS.map((preset) => {
              const active = !customAmount && selectedAmount === preset.amount;
              return (
                <button
                  key={preset.amount}
                  type="button"
                  className={`wallet-fund__preset-btn${
                    active ? " wallet-fund__preset-btn--active" : ""
                  }`}
                  onClick={() => handleSelectPreset(preset.amount)}
                >
                  <span className="wallet-fund__preset-amount">
                    ₦{preset.amount.toLocaleString()}
                  </span>
                  <span className="wallet-fund__preset-tag">{preset.tag}</span>
                </button>
              );
            })}
          </div>

          <div className="wallet-fund__input-wrapper">
            <span className="wallet-fund__currency-prefix">₦</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Or enter custom amount (min ₦100)"
              value={customAmount}
              onChange={handleCustomChange}
              className="wallet-fund__input"
              aria-label="Custom deposit amount in Naira"
            />
          </div>
        </div>

        {/* Paga Gateway Card */}
        <div className="wallet-fund__gateway-box">
          <div className="wallet-fund__gateway-header">
            <div className="wallet-fund__paga-brand">
              <span className="wallet-fund__paga-badge">Paga</span>
              <span>Official Payment Partner</span>
            </div>
            <span style={{ fontSize: "11px", color: "#923B00", fontWeight: "bold" }}>
              🔒 Instant Credit
            </span>
          </div>
          <div className="wallet-fund__gateway-channels">
            <span>• Paga Wallet</span>
            <span>• Instant Bank Transfer</span>
            <span>• Debit Card (Verve/Mastercard/Visa)</span>
            <span>• USSD (*242#)</span>
          </div>
        </div>

        {/* Fee & Credit Breakdown */}
        <div className="wallet-fund__breakdown">
          <div className="wallet-fund__breakdown-row">
            <span>Deposit Amount:</span>
            <span>{formatNaira(effectiveAmount || 0)}</span>
          </div>
          <div className="wallet-fund__breakdown-row">
            <span>Paga Gateway Processing Fee:</span>
            <span style={{ color: "var(--color-success)", fontWeight: "bold" }}>
              ₦0.00 (Waived)
            </span>
          </div>
          <div className="wallet-fund__breakdown-row wallet-fund__breakdown-row--total">
            <span>Credited to Wallet:</span>
            <span>{formatNaira(effectiveAmount || 0)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleExecutePayment}
          disabled={!effectiveAmount || effectiveAmount < 100 || isProcessing}
          className="wallet-fund__submit-btn"
        >
          <span>
            {isProcessing
              ? "Connecting to Paga..."
              : `Pay ${formatNaira(effectiveAmount || 0)} with Paga`}
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </section>

      {/* Success Receipt Modal */}
      {isModalOpen && successReceipt && (
        <div className="wallet-fund__modal-backdrop" role="dialog" aria-modal="true">
          <div className="wallet-fund__modal">
            <div className="wallet-fund__modal-header">
              <div className="wallet-fund__modal-title">
                <span className="wallet-fund__paga-badge" style={{ background: "#fff", color: "#EC6608" }}>
                  Paga
                </span>
                <span>Payment Confirmed</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="wallet-fund__modal-close"
                aria-label="Close receipt"
              >
                ✕
              </button>
            </div>

            <div className="wallet-fund__modal-body">
              <div className="wallet-fund__success-box">
                <div className="wallet-fund__success-icon">✓</div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-charcoal-900)" }}>
                  Wallet Funded Successfully!
                </h3>
                <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
                  Credited <strong>{formatNaira(successReceipt.amount)}</strong> to your reader wallet via Paga.
                </p>
                <div
                  style={{
                    padding: "var(--space-3)",
                    background: "var(--color-steel-100)",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <div><strong>Reference:</strong> {successReceipt.reference}</div>
                  <div><strong>New Balance:</strong> {formatNaira(successReceipt.newBalance)}</div>
                  <div><strong>Gateway:</strong> Paga Live (NGN)</div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)", width: "100%", marginTop: "var(--space-2)" }}>
                  {targetArticle ? (
                    <Link
                      href={`/article/${targetArticle.slug}?unlocked=true`}
                      className="wallet-fund__modal-action-btn"
                      style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
                    >
                      Read &ldquo;{targetArticle.title.slice(0, 20)}...&rdquo; →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        router.push("/dashboard");
                      }}
                      className="wallet-fund__modal-action-btn"
                    >
                      Return to Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Paga Checkout Inline Modal */}
      {isInlineModalOpen && inlineSession && (
        <div
          className="paga-inline-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paga-wallet-fund-title"
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
                  <h3 id="paga-wallet-fund-title" className="paga-inline-modal__title">
                    Fund Wallet via Paga
                  </h3>
                  <span className="paga-inline-modal__subtitle">
                    Street IO · Ref: {inlineSession.reference}
                  </span>
                </div>
              </div>
              <div className="paga-inline-modal__header-right">
                <span className="paga-inline-modal__amount">
                  {formatNaira(effectiveAmount)}
                </span>
                <a
                  href={inlineSession.checkoutUrl}
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
                src={inlineSession.checkoutUrl}
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
                <span>Auto-crediting once payment is received...</span>
              </div>
              <button
                type="button"
                onClick={() => handleVerifyReference(inlineSession.reference)}
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

export default PagaWalletFund;
