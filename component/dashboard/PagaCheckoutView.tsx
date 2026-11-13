// File: component/dashboard/PagaCheckoutView.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Article } from "@/lib/articles";
import { formatNaira } from "@/lib/paga";
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

export function PagaCheckoutView({
  initialAmount = 5000,
  targetArticle,
  customerName = "Reader",
  customerEmail = "reader@streetio.org",
  userWalletBalance = 0,
}: PagaCheckoutViewProps) {
  const router = useRouter();

  const articlePrice = targetArticle
    ? parseInt(targetArticle.price.replace(/[^0-9]/g, ""), 10) || 3500
    : 0;
  // Minimum deposit is strictly ₦5,000 as configured for reader wallet top-ups
  const minDeposit = 5000;
  const minAmount = targetArticle ? Math.max(minDeposit, articlePrice) : minDeposit;

  const [amountInput, setAmountInput] = useState<string>(
    initialAmount ? String(Math.max(minAmount, initialAmount)) : String(minAmount)
  );

  const numericAmount = parseInt(amountInput.replace(/[^0-9]/g, ""), 10) || 0;
  const amount = numericAmount;
  const isAmountValid = amount >= minAmount;

  const presetAmounts = targetArticle
    ? Array.from(
        new Set([
          Math.max(minDeposit, articlePrice),
          10000,
          20000,
          50000,
          100000,
        ])
      )
    : [5000, 10000, 20000, 50000, 100000];

  const [walletBalance, setWalletBalance] = useState<number>(userWalletBalance);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch live wallet balance from server on mount
  useEffect(() => {
    fetch("/api/wallet/balance")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.wallet && typeof data.wallet.balance === "number") {
          setWalletBalance(data.wallet.balance);
        }
      })
      .catch(() => {});
  }, []);

  // Manual payment state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [senderNameInput, setSenderNameInput] = useState<string>(customerName);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
  const [manualSuccessSlip, setManualSuccessSlip] = useState<{
    reference: string;
    amount: number;
    receiptUrl: string;
    status: string;
  } | null>(null);

  const [walletSuccessReceipt, setWalletSuccessReceipt] = useState<{
    reference: string;
    amount: number;
    newBalance: number;
  } | null>(null);

  /**
   * Unlock target article directly using the reader's wallet balance
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
        setWalletSuccessReceipt({
          reference: "WALLET-DEBIT-" + Date.now().toString(36).toUpperCase(),
          amount: articlePrice || amount,
          newBalance: data.balance,
        });
        setWalletBalance(data.balance);
        router.refresh();
      } else {
        setErrorMessage(data.error || "Failed to unlock article with wallet balance.");
      }
    } catch (err: unknown) {
      console.error("Wallet unlock error:", err);
      setErrorMessage("Network error trying to unlock with wallet.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAccount = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("7067997301");
      setHasCopiedAccount(true);
      setTimeout(() => setHasCopiedAccount(false), 2500);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, WebP).");
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
      setReceiptPreview(null);
    }
  };

  const handleSubmitManualReceipt = async () => {
    if (!receiptFile) {
      setErrorMessage("Please select and upload your payment slip receipt before submitting.");
      return;
    }

    if (!isAmountValid) {
      setErrorMessage(`Minimum payment amount is ${formatNaira(minAmount)}.`);
      return;
    }

    setIsSubmittingReceipt(true);
    setErrorMessage(null);

    try {
      // 1. Upload receipt to Cloudinary
      const formData = new FormData();
      formData.append("file", receiptFile);
      formData.append("folder", "streetio_receipts");

      const uploadRes = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload payment slip image.");
      }

      // 2. Register manual payment and alert admin on Telegram
      const submitRes = await fetch("/api/manual-payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          receiptUrl: uploadData.url,
          receiptPublicId: uploadData.publicId,
          senderName: senderNameInput,
          purpose: targetArticle ? "article_purchase" : "wallet_funding",
          articleSlug: targetArticle?.slug,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.success) {
        throw new Error(submitData.error || "Failed to submit manual payment slip.");
      }

      setManualSuccessSlip(submitData.slip);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting payment slip. Please retry.";
      console.error("Manual submit error:", err);
      setErrorMessage(msg);
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const hasSufficientWalletBalance = targetArticle && walletBalance >= articlePrice;

  return (
    <div className="paga-checkout">
      {/* Cancel and return link */}
      <Link href="/dashboard" className="paga-checkout__cancel">
        <span>←</span>
        <span>Cancel &amp; Return to Dashboard</span>
      </Link>

      <div className="paga-checkout__card">
        {/* Brand Top Bar */}
        <div className="paga-checkout__topbar" style={{ background: "var(--brand-charcoal, #111827)" }}>
          <div className="paga-checkout__brand">
            <span className="paga-checkout__logo" style={{ color: "var(--brand-charcoal, #111827)" }}>
              streetio
            </span>
            <div className="paga-checkout__brand-text">
              <span>Direct Bank Payment</span>
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

        {/* SUFFICIENT WALLET BALANCE CALLOUT */}
        {hasSufficientWalletBalance && !manualSuccessSlip && !walletSuccessReceipt && (
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
                You have sufficient funds in your reader wallet to unlock this guide directly.
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
                  : `Unlock Now with Reader Wallet (${formatNaira(articlePrice || amount)})`}
              </button>
            </div>
          </div>
        )}

        {manualSuccessSlip ? (
          /* Manual Bank Transfer Submitted Confirmation */
          <div className="paga-checkout__success">
            <div className="paga-checkout__success-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
              ✓
            </div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-charcoal-900)" }}>
              Payment Receipt Uploaded!
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
              Your transfer receipt for <strong>{formatNaira(manualSuccessSlip.amount)}</strong> to Moniepoint has been received. Our admin has been alerted via Telegram and will verify your payment shortly.
            </p>

            <div className="paga-checkout__receipt">
              <div className="paga-checkout__receipt-row">
                <span>Reader Account:</span>
                <strong>{customerName} ({customerEmail})</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Reference:</span>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{manualSuccessSlip.reference}</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Destination Bank:</span>
                <span>Moniepoint (7067997301 - Sopulu omah)</span>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Verification Status:</span>
                <span style={{ color: "#D97706", fontWeight: "bold" }}>
                  ⏳ Pending Admin Verification
                </span>
              </div>
              {manualSuccessSlip.receiptUrl && (
                <div style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-steel-700)", display: "block", marginBottom: "4px" }}>
                    Uploaded Payment Slip:
                  </span>
                  <a href={manualSuccessSlip.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={manualSuccessSlip.receiptUrl}
                      alt="Uploaded Payment Slip Preview"
                      style={{
                        maxHeight: "160px",
                        maxWidth: "100%",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-steel-300)",
                        objectFit: "contain",
                      }}
                    />
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", width: "100%", marginTop: "var(--space-2)" }}>
              {targetArticle ? (
                <Link
                  href={`/article/${targetArticle.slug}`}
                  className="paga-checkout__pay-btn"
                  style={{ textDecoration: "none" }}
                >
                  Return to Guide →
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
        ) : walletSuccessReceipt ? (
          /* Wallet Debit Success */
          <div className="paga-checkout__success">
            <div className="paga-checkout__success-icon">✓</div>
            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--color-charcoal-900)" }}>
              Article Unlocked from Wallet!
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
              Debited {formatNaira(walletSuccessReceipt.amount)} from your reader wallet. Access granted.
            </p>

            <div className="paga-checkout__receipt">
              <div className="paga-checkout__receipt-row">
                <span>Account:</span>
                <strong>{customerName} ({customerEmail})</strong>
              </div>
              <div className="paga-checkout__receipt-row">
                <span>Transaction Ref:</span>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{walletSuccessReceipt.reference}</strong>
              </div>
              <div className="paga-checkout__receipt-row paga-checkout__receipt-row--bold">
                <span>Updated Reader Wallet:</span>
                <span>{formatNaira(walletSuccessReceipt.newBalance)}</span>
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
          /* Direct Transfer Payment View */
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

            {/* Dedicated Custom Amount Input & Presets */}
            <div className="paga-checkout__amount-section">
              <div className="paga-checkout__amount-header">
                <label
                  htmlFor="paga-amount-input"
                  className="paga-checkout__amount-title"
                >
                  {targetArticle
                    ? "Enter Payment / Top-Up Amount (₦)"
                    : "Enter How Much You Want to Pay (₦)"}
                </label>
                <span className="paga-checkout__amount-badge">
                  Min: {formatNaira(minAmount)}
                </span>
              </div>

              {/* Input field with currency prefix and clear button */}
              <div className="paga-checkout__amount-input-box">
                <span className="paga-checkout__amount-currency" aria-hidden="true">
                  ₦
                </span>
                <input
                  id="paga-amount-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amountInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setAmountInput(cleaned);
                  }}
                  placeholder={`e.g. ${minAmount.toLocaleString()}`}
                  className="paga-checkout__amount-input"
                  aria-label="Enter payment amount in Naira"
                />
                {amountInput && (
                  <button
                    type="button"
                    onClick={() => setAmountInput("")}
                    className="paga-checkout__amount-clear"
                    title="Clear amount"
                    aria-label="Clear amount"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Select Presets */}
              <div className="paga-checkout__presets-row">
                <span className="paga-checkout__presets-label">Quick select:</span>
                <div
                  className="paga-checkout__preset-list"
                  role="toolbar"
                  aria-label="Quick preset payment amounts"
                >
                  {presetAmounts.map((amt) => {
                    const isSelected = amount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        className={`paga-checkout__preset-btn${
                          isSelected ? " paga-checkout__preset-btn--active" : ""
                        }`}
                        onClick={() => setAmountInput(String(amt))}
                      >
                        {targetArticle && amt === articlePrice
                          ? `Exact: ₦${amt.toLocaleString()}`
                          : `₦${amt.toLocaleString()}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time feedback / surplus notes */}
              {amount > 0 && amount < minAmount && (
                <div className="paga-checkout__amount-feedback paga-checkout__amount-feedback--warning">
                  ⚠️ Minimum required amount is {formatNaira(minAmount)}.
                </div>
              )}

              {targetArticle && amount > articlePrice && (
                <div className="paga-checkout__amount-feedback paga-checkout__amount-feedback--info">
                  ✓ <strong>{formatNaira(articlePrice)}</strong> unlocks this guide · <strong>{formatNaira(amount - articlePrice)}</strong> surplus will be added to your Reader Wallet.
                </div>
              )}

              {!targetArticle && amount >= minAmount && (
                <div className="paga-checkout__amount-feedback paga-checkout__amount-feedback--info">
                  ✓ <strong>{formatNaira(amount)}</strong> will be credited directly to your Reader Wallet.
                </div>
              )}
            </div>

            {/* DIRECT BANK TRANSFER VIA MONIEPOINT WITH RECEIPT UPLOAD */}
            <div className="paga-manual">
              {/* Moniepoint Account Details Card */}
              <div className="paga-manual__bank-card">
                <div className="paga-manual__bank-header">
                  <span className="paga-manual__bank-name">Moniepoint</span>
                  <span className="paga-manual__bank-badge">Official Manual Account</span>
                </div>

                <div className="paga-manual__account-row">
                  <div>
                    <span style={{ fontSize: "11px", color: "#94A3B8", display: "block", letterSpacing: "0.05em" }}>
                      ACCOUNT NUMBER
                    </span>
                    <span className="paga-manual__account-num">7067997301</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className={`paga-manual__copy-btn${hasCopiedAccount ? " paga-manual__copy-btn--copied" : ""}`}
                    aria-label="Copy Moniepoint Account Number"
                  >
                    {hasCopiedAccount ? "✓ Copied" : "Copy Number"}
                  </button>
                </div>

                <div className="paga-manual__account-name-row">
                  <span>ACCOUNT NAME:</span>
                  <strong>Sopulu omah</strong>
                </div>
              </div>

              {/* Steps instructions */}
              <div className="paga-manual__steps">
                <div className="paga-manual__step">
                  <span className="paga-manual__step-num">1</span>
                  <span>
                    Transfer <strong>{formatNaira(amount)}</strong> to <strong>Moniepoint (7067997301 - Sopulu omah)</strong> using your banking app.
                  </span>
                </div>
                <div className="paga-manual__step">
                  <span className="paga-manual__step-num">2</span>
                  <span>
                    Take a screenshot or save the transaction slip receipt from your banking app.
                  </span>
                </div>
                <div className="paga-manual__step">
                  <span className="paga-manual__step-num">3</span>
                  <span>
                    Upload your payment slip below and submit. Our admin will be alerted immediately via Telegram to confirm.
                  </span>
                </div>
              </div>

              {/* Sender Account Name */}
              <div className="paga-manual__sender-field">
                <label htmlFor="manual-sender-name">
                  Sender Account Name (as shown on your bank receipt):
                </label>
                <input
                  id="manual-sender-name"
                  type="text"
                  value={senderNameInput}
                  onChange={(e) => setSenderNameInput(e.target.value)}
                  placeholder="e.g. Sopulu Omah"
                />
              </div>

              {/* Upload Receipt Slip */}
              <div>
                <label
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "bold",
                    color: "var(--color-charcoal-800)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Upload Payment Slip / Transfer Receipt:
                </label>

                {receiptPreview ? (
                  <div className="paga-manual__preview-card">
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="paga-manual__preview-remove"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                    <img
                      src={receiptPreview}
                      alt="Selected receipt preview"
                      className="paga-manual__preview-image"
                    />
                    <span
                      style={{
                        fontSize: "11.5px",
                        color: "var(--color-steel-800)",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      {receiptFile?.name} ({(receiptFile ? receiptFile.size / 1024 : 0).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <label className="paga-manual__dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptFileChange}
                    />
                    <span className="paga-manual__dropzone-icon" aria-hidden="true">
                      📸
                    </span>
                    <span className="paga-manual__dropzone-text">
                      Tap or click to select receipt screenshot
                    </span>
                    <span className="paga-manual__dropzone-hint">
                      JPEG, PNG, WebP supported (Max 10MB)
                    </span>
                  </label>
                )}
              </div>

              {/* Submit Receipt Action */}
              <button
                type="button"
                onClick={handleSubmitManualReceipt}
                disabled={!receiptFile || isSubmittingReceipt || !isAmountValid}
                className="paga-manual__submit-btn"
              >
                {isSubmittingReceipt ? (
                  <span>Uploading Slip &amp; Alerting Admin...</span>
                ) : (
                  <>
                    <span>Submit Payment Slip ({formatNaira(amount)})</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Footer */}
            <div className="paga-checkout__footer">
              <span>Customer: {customerName} ({customerEmail})</span>
              <span>·</span>
              <span>Street IO Secured Transfer</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PagaCheckoutView;
