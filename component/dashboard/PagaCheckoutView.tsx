// File: component/dashboard/PagaCheckoutView.tsx
"use client";

import { useState } from "react";
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
};

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000];

export function PagaCheckoutView({
  initialAmount = 5000,
  targetArticle,
  customerName = "Reader",
  customerEmail = "reader@streetio.org",
}: PagaCheckoutViewProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [activeChannel, setActiveChannel] = useState<"paga" | "transfer" | "card" | "ussd">("paga");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  // Form states
  const [pagaPhone, setPagaPhone] = useState("08034567890");
  const [pagaPin, setPagaPin] = useState("••••");

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(PAGA_MERCHANT_DETAILS.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAuthorizePayment = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          articleSlug: targetArticle?.slug,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessReceipt({
          reference: data.reference,
          amount: data.amount,
          newBalance: data.balance,
        });
        router.refresh();
      } else {
        alert(data.error || "Payment could not be completed via Paga.");
      }
    } catch (err) {
      console.error("Paga checkout error:", err);
      alert("Network error processing Paga checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

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
              <span>Secure Checkout</span>
              <span>Merchant Collection</span>
            </div>
          </div>
          <span className="paga-checkout__secure-badge">
            🔒 256-Bit SSL
          </span>
        </div>

        {successReceipt ? (
          /* Payment Success Confirmation */
          <div className="paga-checkout__success">
            <div className="paga-checkout__success-icon">✓</div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-charcoal-900)" }}>
              Payment Successful!
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
              Your payment of <strong>{formatNaira(successReceipt.amount)}</strong> was processed successfully by Paga.
            </p>

            <div className="paga-checkout__receipt">
              <div className="paga-checkout__receipt-row">
                <span>Merchant:</span>
                <strong>Street IO Operations</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Transaction Ref:</span>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{successReceipt.reference}</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Paga Channel:</span>
                <span>Instant Settlement (NGN)</span>
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

            {/* Paga Payment Channels Navigation */}
            <div className="paga-checkout__channels" role="tablist">
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "paga" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("paga")}
              >
                <span>🟠 Paga</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "transfer" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("transfer")}
              >
                <span>🏦 Transfer</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "card" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("card")}
              >
                <span>💳 Card</span>
              </button>
              <button
                type="button"
                className={`paga-checkout__channel-tab${
                  activeChannel === "ussd" ? " paga-checkout__channel-tab--active" : ""
                }`}
                onClick={() => setActiveChannel("ussd")}
              >
                <span>📱 USSD</span>
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
                    You will be prompted to authorize debit from your Paga wallet balance.
                  </p>
                </>
              )}

              {activeChannel === "transfer" && (
                <div className="paga-checkout__transfer-box">
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: "bold" }}>
                    Transfer to Paga Dedicated Account:
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
                  <div className="paga-checkout__field-group">
                    <label className="paga-checkout__field-label">Card Number</label>
                    <input
                      type="text"
                      placeholder="5399 •••• •••• ••••"
                      defaultValue="5399 2400 1289 4501"
                      className="paga-checkout__field-input"
                    />
                  </div>

                  <div className="paga-checkout__card-row">
                    <div className="paga-checkout__field-group">
                      <label className="paga-checkout__field-label">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/28"
                        className="paga-checkout__field-input"
                      />
                    </div>
                    <div className="paga-checkout__field-group">
                      <label className="paga-checkout__field-label">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="821"
                        maxLength={4}
                        className="paga-checkout__field-input"
                      />
                    </div>
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
                onClick={handleAuthorizePayment}
                disabled={isProcessing}
                className="paga-checkout__pay-btn"
              >
                <span>{isProcessing ? "Processing with Paga..." : `Pay ${formatNaira(amount)} with Paga`}</span>
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
