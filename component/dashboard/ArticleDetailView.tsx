// File: component/dashboard/ArticleDetailView.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type Article } from "@/lib/articles";
import { type ArticleTool } from "@/lib/article-tools";
import { formatNaira } from "@/lib/paga";
import { CategoryIcon } from "./CategoryIcon";
import "./article-page.scss";
import "./paga-checkout.scss";

type ArticleDetailViewProps = {
  article: Article;
  tools: ArticleTool[];
  initialIsUnlocked?: boolean;
  userWalletBalance?: number;
};

export function ArticleDetailView({
  article,
  tools,
  initialIsUnlocked = false,
  userWalletBalance = 0,
}: ArticleDetailViewProps) {
  const searchParams = useSearchParams();
  const [isUnlocked, setIsUnlocked] = useState(
    initialIsUnlocked || searchParams.get("unlocked") === "true"
  );
  const [walletBalance, setWalletBalance] = useState(userWalletBalance);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Paga inline checkout modal states
  const [inlineSession, setInlineSession] = useState<{
    reference: string;
    checkoutUrl: string;
  } | null>(null);
  const [isInlineModalOpen, setIsInlineModalOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const numericPrice = parseInt(article.price.replace(/[^0-9]/g, ""), 10) || 3500;
  const [payAmountInput, setPayAmountInput] = useState<string>(String(numericPrice));
  const enteredAmount = parseInt(payAmountInput.replace(/[^0-9]/g, ""), 10) || 0;
  const isAmountValid = enteredAmount >= numericPrice;
  const effectivePayAmount = isAmountValid ? enteredAmount : numericPrice;

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
            amount: effectivePayAmount,
            articleSlug: article.slug,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setIsInlineModalOpen(false);
          setIsUnlocked(true);
          try {
            localStorage.setItem(`unlocked_${article.slug}`, "true");
          } catch {}
          if (typeof data.balance === "number") {
            setWalletBalance(data.balance);
          }
          setInlineSession(null);
        }
      } catch {
        // silent polling retry
      }
    }, 3500);

    return () => clearInterval(intervalId);
  }, [isInlineModalOpen, inlineSession, effectivePayAmount, article.slug]);

  // Check client-side storage / query params
  useEffect(() => {
    if (searchParams.get("unlocked") === "true") {
      setIsUnlocked(true);
      try {
        localStorage.setItem(`unlocked_${article.slug}`, "true");
      } catch {}
    } else {
      try {
        const stored = localStorage.getItem(`unlocked_${article.slug}`);
        if (stored === "true") {
          setIsUnlocked(true);
        }
      } catch {}
    }
  }, [searchParams, article.slug]);

  const handleWalletUnlock = async () => {
    setErrorMsg(null);
    setIsUnlocking(true);

    try {
      const res = await fetch("/api/article/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleSlug: article.slug }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsUnlocked(true);
        if (typeof data.balance === "number") {
          setWalletBalance(data.balance);
        }
        try {
          localStorage.setItem(`unlocked_${article.slug}`, "true");
        } catch {}
      } else if (res.status === 402) {
        setErrorMsg("Insufficient wallet balance. Please fund your wallet via Paga.");
      } else {
        setErrorMsg(data.error || "Failed to unlock article.");
      }
    } catch (err) {
      console.error("Unlock error:", err);
      setErrorMsg("Network error trying to unlock article.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLaunchPagaOnArticle = async () => {
    setErrorMsg(null);
    setIsUnlocking(true);

    try {
      const res = await fetch("/api/paga/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectivePayAmount,
          articleSlug: article.slug,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize Paga checkout");
      }

      setInlineSession({
        reference: data.reference,
        checkoutUrl: data.checkoutUrl,
      });
      setIsIframeLoading(true);
      setIsInlineModalOpen(true);
    } catch (err: any) {
      console.error("Paga launch error:", err);
      setErrorMsg(err?.message || "Could not connect to Paga Gateway.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleVerifyArticlePayment = async (ref: string, allowSimulation = false) => {
    setIsUnlocking(true);
    try {
      const res = await fetch("/api/paga/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: ref,
          amount: effectivePayAmount,
          articleSlug: article.slug,
          allowSandboxSimulation: allowSimulation,
          isTestMode: allowSimulation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsInlineModalOpen(false);
        setIsUnlocked(true);
        try {
          localStorage.setItem(`unlocked_${article.slug}`, "true");
        } catch {}
        if (typeof data.balance === "number") {
          setWalletBalance(data.balance);
        }
        setInlineSession(null);
      } else {
        alert(data.error || "Payment verification failed or still pending on Paga.");
      }
    } catch {
      alert("Network error verifying payment.");
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <article className="article-page" aria-labelledby="article-heading">
      {/* Back to category navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          href={`/category/${article.categorySlug}`}
          className="article-page__back"
        >
          <span>←</span>
          <span>Back to {article.category} Hub</span>
        </Link>
      </nav>

      {/* Header section */}
      <header className="article-page__hero">
        {article.thumbnailUrl && (
          <div className="article-page__cover-wrap">
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="article-page__cover-image"
            />
          </div>
        )}

        <div className="article-page__meta-strip">

          <Link
            href={`/category/${article.categorySlug}`}
            className="article-page__category-badge"
          >
            {article.category}
          </Link>
          <span className="article-page__stat-chip">• {article.readTime}</span>
          {article.totalReads && (
            <span className="article-page__stat-chip">
              • {article.totalReads.toLocaleString()} reads
            </span>
          )}
          <span className="article-page__price-chip">{article.price}</span>
        </div>

        <h1 id="article-heading" className="article-page__title">
          {article.title}
        </h1>

        <p className="article-page__desc">{article.description}</p>

        {/* Teaser snippet box */}
        <div className="article-page__teaser">
          &ldquo;{article.contentSnippet}&rdquo;
        </div>
      </header>

      {/* ACCESS CONTROL: Paid vs Unpaid */}
      {!isUnlocked ? (
        /* ================= LOCKED STATE: GIANT PADLOCK PAYWALL ================= */
        <section
          className="article-paywall"
          aria-label="Paywall restricted article"
        >
          {/* Giant Padlock Crest */}
          <div className="article-paywall__lock-crest" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2.5" ry="2.5" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1.3" fill="currentColor" />
              <line x1="12" y1="17.3" x2="12" y2="19.2" stroke="currentColor" strokeWidth="2.2" />
            </svg>
          </div>

          <span className="article-paywall__badge">
            RESTRICTED CLASSIFIED TRADECRAFT
          </span>

          <h2 className="article-paywall__title">
            Complete Field Guide Locked
          </h2>

          <p className="article-paywall__desc">
            This actionable tactical playbook contains unlisted, practical tradecraft protocols. Unlock full access with a one-time micro-payment.
          </p>

          {/* What's Inside Checklist */}
          <div className="article-paywall__checklist">
            <h4>What You Get With This Guide:</h4>
            <ul>
              <li>
                <span>✓</span>
                <span>
                  <strong>Full Tactical Modus Operandi Breakdown:</strong> Exact scripts and mechanisms used by adversaries.
                </span>
              </li>
              <li>
                <span>✓</span>
                <span>
                  <strong>Step-by-Step Countermeasure Protocols:</strong> Actionable steps to prevent compromise and reverse financial exposure.
                </span>
              </li>
              <li>
                <span>✓</span>
                <span>
                  <strong>Emergency Incident Matrix:</strong> Immediate phone scripts, bank callback sheets, and regulatory escalations.
                </span>
              </li>
              <li>
                <span>✓</span>
                <span>
                  <strong>Curated Operational Tools:</strong> Direct access to field verification utilities listed below.
                </span>
              </li>
            </ul>
          </div>

          {errorMsg && (
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Buy & Unlock Actions */}
          {(() => {
            const numericPrice = parseInt(article.price.replace(/[^0-9]/g, ""), 10) || 3500;
            const hasSufficientBalance = walletBalance >= numericPrice;

            return (
              <div className="article-paywall__actions">
                {hasSufficientBalance ? (
                  /* User has sufficient reader wallet balance -> Buy directly from wallet */
                  <>
                    <button
                      type="button"
                      onClick={handleWalletUnlock}
                      disabled={isUnlocking}
                      className="article-paywall__buy-btn"
                      style={{ background: "#10B981" }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                      <span>
                        {isUnlocking
                          ? "Unlocking Playbook..."
                          : `Unlock Full Guide with Wallet (${article.price})`}
                      </span>
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: "var(--color-steel-800)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span>Wallet Balance: <strong>{formatNaira(walletBalance)}</strong></span>
                      <span>•</span>
                      <span>Remaining: <strong>{formatNaira(walletBalance - numericPrice)}</strong></span>
                    </div>

                    <span className="article-paywall__security-note">
                      Paid directly from your Reader Wallet • Instant access granted
                    </span>
                  </>
                ) : (
                  /* User wallet is empty or insufficient -> Choose amount & Fund via Paga */
                  <>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "420px",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "var(--color-steel-100)",
                        border: "1px solid var(--color-steel-300)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "var(--color-charcoal-800)",
                        marginBottom: "4px",
                      }}
                    >
                      <span>Reader Wallet Balance:</span>
                      <strong
                        style={{
                          color: walletBalance <= 0 ? "#DC2626" : "#D97706",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {formatNaira(walletBalance)} {walletBalance <= 0 ? "(Empty)" : "(Insufficient)"}
                      </strong>
                    </div>

                    {/* How much do you want to pay? */}
                    <div className="article-paywall__amount-card">
                      <div className="article-paywall__amount-head">
                        <label htmlFor="article-pay-amount-input" className="article-paywall__amount-label">
                          Enter How Much You Want to Pay (₦)
                        </label>
                        <span className="article-paywall__min-tag">
                          Min: {article.price}
                        </span>
                      </div>

                      <div className="article-paywall__input-wrap">
                        <span className="article-paywall__currency-prefix" aria-hidden="true">
                          ₦
                        </span>
                        <input
                          id="article-pay-amount-input"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={payAmountInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setPayAmountInput(val);
                          }}
                          placeholder={String(numericPrice)}
                          className="article-paywall__amount-input"
                          aria-label="Payment amount in Naira"
                        />
                        {payAmountInput && (
                          <button
                            type="button"
                            onClick={() => setPayAmountInput(String(numericPrice))}
                            className="article-paywall__reset-btn"
                            title="Reset to exact article price"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Quick Presets */}
                      <div className="article-paywall__presets">
                        {[
                          numericPrice,
                          ...(numericPrice < 5000 ? [5000] : []),
                          ...(numericPrice < 10000 ? [10000] : []),
                          ...(numericPrice < 20000 ? [20000] : []),
                        ].map((amt) => {
                          const isSelected = effectivePayAmount === amt;
                          return (
                            <button
                              key={amt}
                              type="button"
                              className={`article-paywall__preset-btn${
                                isSelected ? " article-paywall__preset-btn--active" : ""
                              }`}
                              onClick={() => setPayAmountInput(String(amt))}
                            >
                              {amt === numericPrice
                                ? `Exact: ₦${amt.toLocaleString()}`
                                : `₦${amt.toLocaleString()}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Feedback Note */}
                      {enteredAmount > 0 && enteredAmount < numericPrice ? (
                        <div className="article-paywall__feedback article-paywall__feedback--warning">
                          ⚠️ Minimum payment to unlock this guide is {article.price}.
                        </div>
                      ) : enteredAmount > numericPrice ? (
                        <div className="article-paywall__feedback article-paywall__feedback--info">
                          ✓ {article.price} unlocks this guide · {formatNaira(enteredAmount - numericPrice)} added to your Reader Wallet.
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={handleLaunchPagaOnArticle}
                      disabled={!isAmountValid || isUnlocking}
                      className="article-paywall__buy-btn"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </svg>
                      <span>
                        {isUnlocking
                          ? "Connecting to Paga..."
                          : !isAmountValid
                          ? `Enter at least ${article.price} to Pay`
                          : `Pay ${formatNaira(effectivePayAmount)} via Paga & Unlock`}
                      </span>
                    </button>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", marginTop: "4px" }}>
                      <span className="article-paywall__security-note" style={{ margin: 0 }}>
                        Funds reader wallet &amp; unlocks guide via live Paga
                      </span>
                      <span>·</span>
                      <Link
                        href={`/checkout/paga?article=${encodeURIComponent(article.slug)}&amount=${effectivePayAmount}`}
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--brand-charcoal)",
                          textDecoration: "underline",
                        }}
                      >
                        Full Checkout Page →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Blurred background preview */}
          <div className="article-blurred-preview" aria-hidden="true">
            <p>
              Adversary deployment patterns initiate with high-velocity psychological grooming protocols designed to circumvent rational verification procedures. When confronting unauthorized requests, immediate containment requires...
            </p>
            <p>
              Step 1: Execute immediate out-of-band callback using pre-established telecommunications records. Never utilize numbers embedded inside suspect invoices or digital contracts...
            </p>
            <p>
              Step 2: Cross-reference metadata using ExifTool extraction matrices and coordinate mapping to identify jurisdictional divergence between claims and physical infrastructure...
            </p>
          </div>
        </section>
      ) : (
        /* ================= UNLOCKED STATE: FULL OPERATIONAL PLAYBOOK ================= */
        <section
          className="article-unlocked-body"
          aria-label="Full operational playbook content"
        >
          <div className="article-unlocked-body__clearance-strip">
            <span>✓ OPERATIONAL CLEARANCE GRANTED · PLAYBOOK UNLOCKED</span>
            <span>VERIFIED ACCESS</span>
          </div>

          <div className="article-unlocked-body__content">
            <h2>1. Adversary Mechanics & Situational Modus Operandi</h2>
            <p>
              In high-stakes environments, adversaries rely on urgency, authority emulation, and targeted isolation to bypass conventional defenses. By creating synthetic crises (medical emergencies, customs holds, audit freezes, or regulatory compliance deadlines), perpetrators induce cognitive panic that sidelines standard verification.
            </p>
            <p>
              Key telemetry reveals that 84% of financial diversions occur within 48 hours of initial credential priming. Recognizing these early signals before capital movement is the single most critical intervention point.
            </p>

            <h2>2. Step-by-Step Countermeasures & Tradecraft Protocols</h2>
            <p>
              Execute the following operational sequence immediately upon detecting suspicious indicators:
            </p>
            <ol>
              <li>
                <strong>Out-of-Band Physical Verification:</strong> Never rely on contact details, telephone numbers, or email threads provided within the suspicious correspondence. Always initiate a separate call via previously documented internal directories.
              </li>
              <li>
                <strong>Dynamic Visual / Biometric Challenge:</strong> If interacting with an unverified individual claiming identity, require a real-time dynamic gesture (e.g. holding up three fingers beside the right ear on live video). Pre-recorded video loops and mid-tier deepfakes fail this test instantaneously.
              </li>
              <li>
                <strong>Carrier & Domain Telemetry Audit:</strong> Validate whether phone numbers are routed through disposable VoIP trunks (Google Voice, TextNow) or registered domestic telecom SIM cards using the verification tools listed in the footer below.
              </li>
              <li>
                <strong>Mandatory Dual-Signatory Escrow:</strong> For all capital transfers exceeding routine operational thresholds, mandate dual executive sign-off and routing value-dating verification with your designated financial institution.
              </li>
            </ol>

            <div className="article-unlocked-body__callout">
              <strong>FIELD RULE OF ENGAGEMENT:</strong> If an online acquaintance or vendor changes payment destination details or demands urgent wire transfers citing deployment, customs, or audit emergencies, immediately freeze all outgoing communication until independent voice verification has concluded.
            </div>

            <h2>3. Emergency Incident Containment Matrix</h2>
            <p>
              If an unauthorized wire or sensitive document transfer has already occurred, execute this containment checklist within the golden 2-hour window:
            </p>
            <ul>
              <li>
                <strong>Call Bank Fraud Desk Directly:</strong> Request an immediate SWIFT / NIBSS recall and ask for the transaction to be placed in administrative suspense.
              </li>
              <li>
                <strong>Preserve Complete Digital Forensics:</strong> Export raw RFC 822 email headers, complete chat archives, and transaction references before accounts can be deleted by adversaries.
              </li>
              <li>
                <strong>File Official Incident Reports:</strong> Log reference numbers with domestic cybersecurity authorities and report suspicious bank account numbers to the financial crimes registry.
              </li>
            </ul>

            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <>
                <h2>4. Summary Defense Checklist</h2>
                <ul>
                  {article.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>
                      <strong>✓ {takeaway}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {/* ================= LINKS TO TOOLS AT THE FOOTER ================= */}
      {tools && tools.length > 0 && (
        <footer className="article-tools" aria-labelledby="footer-tools-heading">
          <div className="article-tools__head">
            <h2 id="footer-tools-heading" className="article-tools__title">
              Operational Field Tools &amp; Verification Resources
            </h2>
            <p className="article-tools__desc">
              Essential verification utilities, telemetry lookup portals, and forensic registries curated specifically for this playbook.
            </p>
          </div>

          <ul className="article-tools__grid">
            {tools.map((tool) => (
              <li key={tool.id} className="article-tools__card">
                <div className="article-tools__card-top">
                  <h3 className="article-tools__tool-name">{tool.name}</h3>
                  <span className="article-tools__type-pill">{tool.type}</span>
                </div>

                <p className="article-tools__tool-desc">{tool.description}</p>

                <div className="article-tools__card-footer">
                  <span className="article-tools__tool-category">
                    {tool.category}
                  </span>

                  {tool.isExternal ? (
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-tools__tool-btn"
                    >
                      <span>Launch Tool</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link href={tool.url} className="article-tools__tool-btn">
                      <span>Open Resource</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </footer>
      )}

      {/* Official Paga Checkout Inline Modal */}
      {isInlineModalOpen && inlineSession && (
        <div
          className="paga-inline-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paga-article-modal-title"
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
                  <h3 id="paga-article-modal-title" className="paga-inline-modal__title">
                    Unlock Guide via Paga
                  </h3>
                  <span className="paga-inline-modal__subtitle">
                    {article.title.slice(0, 32)}... · Ref: {inlineSession.reference}
                  </span>
                </div>
              </div>
              <div className="paga-inline-modal__header-right">
                <span className="paga-inline-modal__amount">
                  {formatNaira(effectivePayAmount)}
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
                <span>Auto-unlocking once payment is received...</span>
              </div>
              <button
                type="button"
                onClick={() => handleVerifyArticlePayment(inlineSession.reference)}
                disabled={isUnlocking}
                className="paga-inline-modal__verify-btn"
              >
                {isUnlocking ? "Verifying..." : "I've Completed Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default ArticleDetailView;
