// File: component/dashboard/PagaWalletFund.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Wallet } from "@/lib/dashboard";
import { type Article } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import { formatNaira, PAGA_MERCHANT_DETAILS } from "@/lib/paga";
import "./wallet-fund.scss";

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
  const [currentBalance, setCurrentBalance] = useState<number>(wallet.balance);
  const [formattedBalance, setFormattedBalance] = useState<string>(wallet.formattedBalance);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutTab, setCheckoutTab] = useState<"paga_account" | "bank_transfer" | "ussd">("paga_account");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
  } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const effectiveAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
  };

  const handleOpenCheckout = () => {
    if (!effectiveAmount || effectiveAmount < 100) return;
    setIsModalOpen(true);
    setSuccessReceipt(null);
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

      if (data.success) {
        setCurrentBalance(data.balance);
        setFormattedBalance(data.formattedBalance);
        setSuccessReceipt({
          reference: data.reference,
          amount: data.amount,
          newBalance: data.balance,
        });
        router.refresh();
      } else {
        alert(data.error || "Failed to process Paga transaction");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Network error processing payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(PAGA_MERCHANT_DETAILS.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
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
          onClick={handleOpenCheckout}
          disabled={!effectiveAmount || effectiveAmount < 100}
          className="wallet-fund__submit-btn"
        >
          <span>Pay {formatNaira(effectiveAmount || 0)} with Paga</span>
          <span aria-hidden="true">→</span>
        </button>
      </section>

      {/* Paga Interactive Checkout Modal */}
      {isModalOpen && (
        <div className="wallet-fund__modal-backdrop" role="dialog" aria-modal="true">
          <div className="wallet-fund__modal">
            <div className="wallet-fund__modal-header">
              <div className="wallet-fund__modal-title">
                <span className="wallet-fund__paga-badge" style={{ background: "#fff", color: "#EC6608" }}>
                  Paga
                </span>
                <span>Paga Secure Checkout</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="wallet-fund__modal-close"
                aria-label="Close checkout"
              >
                ✕
              </button>
            </div>

            <div className="wallet-fund__modal-body">
              {successReceipt ? (
                /* Success View */
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
                    <div><strong>Channel:</strong> Paga Collect (NGN)</div>
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-2)", width: "100%", marginTop: "var(--space-2)" }}>
                    {targetArticle ? (
                      <Link
                        href={`/dashboard/wallet/fund?article=${targetArticle.slug}`}
                        className="wallet-fund__modal-action-btn"
                        style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
                      >
                        Unlock {targetArticle.title.slice(0, 20)}... →
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
              ) : (
                /* Payment Options View */
                <>
                  <div className="wallet-fund__modal-amount-box">
                    <span>Deposit Amount</span>
                    <strong>{formatNaira(effectiveAmount)}</strong>
                  </div>

                  {/* Channel Switcher */}
                  <div className="wallet-fund__tabs" role="tablist">
                    <button
                      type="button"
                      className={`wallet-fund__tab-btn${
                        checkoutTab === "paga_account" ? " wallet-fund__tab-btn--active" : ""
                      }`}
                      onClick={() => setCheckoutTab("paga_account")}
                    >
                      Paga Account
                    </button>
                    <button
                      type="button"
                      className={`wallet-fund__tab-btn${
                        checkoutTab === "bank_transfer" ? " wallet-fund__tab-btn--active" : ""
                      }`}
                      onClick={() => setCheckoutTab("bank_transfer")}
                    >
                      Bank Transfer
                    </button>
                    <button
                      type="button"
                      className={`wallet-fund__tab-btn${
                        checkoutTab === "ussd" ? " wallet-fund__tab-btn--active" : ""
                      }`}
                      onClick={() => setCheckoutTab("ussd")}
                    >
                      USSD (*242#)
                    </button>
                  </div>

                  {/* Content per channel */}
                  {checkoutTab === "paga_account" && (
                    <div className="wallet-fund__transfer-box">
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        Pay directly from your Paga Wallet
                      </p>
                      <p style={{ margin: 0, color: "var(--color-steel-800)" }}>
                        Enter your registered Paga phone number or email to authorize debit.
                      </p>
                      <div style={{
                        padding: "8px 12px",
                        background: "var(--color-steel-100)",
                        border: "1px solid var(--color-steel-300)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "var(--color-charcoal-800)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <span>Merchant $paga Tag:</span>
                        <strong style={{ fontFamily: "var(--font-mono)", color: "#EC6608" }}>{PAGA_MERCHANT_DETAILS.pagaTag}</strong>
                      </div>
                      <input
                        type="text"
                        placeholder="08012345678 or paga@email.com"
                        defaultValue="08023456789"
                        style={{
                          height: "40px",
                          padding: "0 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--color-steel-300)",
                          fontFamily: "var(--font-mono)",
                        }}
                      />
                    </div>
                  )}

                  {checkoutTab === "bank_transfer" && (
                    <div className="wallet-fund__transfer-box">
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        Pay to Dedicated Paga Account
                      </p>
                      <div className="wallet-fund__copy-row">
                        <div>
                          <div style={{ fontSize: "10.5px", color: "var(--color-steel-700)" }}>
                            Bank: <strong>{PAGA_MERCHANT_DETAILS.bankName}</strong> · Tag: <strong>{PAGA_MERCHANT_DETAILS.pagaTag}</strong>
                          </div>
                          <strong style={{ fontSize: "1.1rem", letterSpacing: "0.03em" }}>{PAGA_MERCHANT_DETAILS.accountNumber}</strong>
                        </div>
                        <button type="button" onClick={handleCopyAccount}>
                          {copiedAccount ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--color-steel-700)" }}>
                        Account Name: <strong>{PAGA_MERCHANT_DETAILS.accountName}</strong> · Transfer exact amount: {formatNaira(effectiveAmount)}.
                      </p>
                    </div>
                  )}

                  {checkoutTab === "ussd" && (
                    <div className="wallet-fund__transfer-box">
                      <p style={{ margin: 0, fontWeight: "bold" }}>
                        Paga USSD Quick Dial
                      </p>
                      <div className="wallet-fund__copy-row">
                        <strong>*242*{effectiveAmount}#</strong>
                        <span style={{ fontSize: "10px", color: "var(--color-steel-700)" }}>
                          All Networks
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--color-steel-700)" }}>
                        Dial on your registered SIM and enter your 4-digit Paga PIN.
                      </p>
                    </div>
                  )}

                  {/* Complete Payment Button */}
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isProcessing}
                    className="wallet-fund__modal-action-btn"
                  >
                    {isProcessing ? "Processing with Paga..." : `Authorize Payment of ${formatNaira(effectiveAmount)}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PagaWalletFund;
