// File: component/admin/AdminPaymentSlips.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ManualPaymentSlip } from "@/lib/manual-payments";
import { formatNaira } from "@/lib/paga";

type Props = {
  onStatusChange?: () => void;
};

export function AdminPaymentSlips({ onStatusChange }: Props) {
  const [slips, setSlips] = useState<ManualPaymentSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox Modal for Receipt Preview
  const [viewingSlip, setViewingSlip] = useState<ManualPaymentSlip | null>(null);

  // Reject modal state
  const [rejectingSlipId, setRejectingSlipId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Transfer not received in Moniepoint account.");

  // Action pending states
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  const loadSlips = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/manual-payment/list");
      const data = await res.json();
      if (res.ok && Array.isArray(data.slips)) {
        setSlips(data.slips);
      } else {
        setError(data.error || "Failed to load payment slips.");
      }
    } catch {
      setError("Network error fetching payment slips.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlips();
  }, []);

  // Filtered slips
  const filteredSlips = useMemo(() => {
    return slips.filter((slip) => {
      const matchesStatus =
        statusFilter === "all" ? true : slip.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        slip.userName.toLowerCase().includes(q) ||
        slip.userEmail.toLowerCase().includes(q) ||
        slip.reference.toLowerCase().includes(q) ||
        (slip.senderName && slip.senderName.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [slips, statusFilter, searchQuery]);

  // Statistics
  const pendingCount = slips.filter((s) => s.status === "pending").length;
  const approvedCount = slips.filter((s) => s.status === "approved").length;
  const totalVolume = slips
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + s.amount, 0);

  // Handler: Approve
  const handleApprove = async (slip: ManualPaymentSlip) => {
    setIsProcessingAction(slip.id);
    setActionNotice(null);

    try {
      const res = await fetch("/api/manual-payment/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipId: slip.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSlips((prev) =>
          prev.map((s) => (s.id === slip.id ? { ...s, status: "approved" } : s))
        );
        setActionNotice(`✓ Payment slip ${slip.reference} approved and access credited.`);
        onStatusChange?.();
      } else {
        alert(data.error || "Failed to approve payment slip.");
      }
    } catch {
      alert("Network error approving payment slip.");
    } finally {
      setIsProcessingAction(null);
    }
  };

  // Handler: Reject
  const handleConfirmReject = async () => {
    if (!rejectingSlipId) return;
    setIsProcessingAction(rejectingSlipId);
    setActionNotice(null);

    try {
      const res = await fetch("/api/manual-payment/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slipId: rejectingSlipId,
          reason: rejectReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSlips((prev) =>
          prev.map((s) =>
            s.id === rejectingSlipId
              ? { ...s, status: "rejected", rejectionReason: rejectReason }
              : s
          )
        );
        setActionNotice(`Payment slip was marked as rejected.`);
        setRejectingSlipId(null);
        onStatusChange?.();
      } else {
        alert(data.error || "Failed to reject payment slip.");
      }
    } catch {
      alert("Network error rejecting payment slip.");
    } finally {
      setIsProcessingAction(null);
    }
  };

  return (
    <div className="admin-slips-section">
      {/* Alert toast notice */}
      {actionNotice && (
        <div
          className="admin-alert-banner"
          style={{
            background: "#ECFDF5",
            color: "#065F46",
            border: "1px solid #A7F3D0",
            marginBottom: "var(--space-3)",
          }}
        >
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="admin-alert-banner__close"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Row for Manual Transfers */}
      <div className="admin-slips-stats">
        <div className="admin-slips-stat-card">
          <span className="admin-slips-stat-label">Pending Review</span>
          <span
            className="admin-slips-stat-val"
            style={{ color: pendingCount > 0 ? "#D97706" : "var(--color-charcoal-900)" }}
          >
            {pendingCount}
          </span>
          <span className="admin-slips-stat-sub">
            {pendingCount > 0 ? "Requires verification" : "All caught up"}
          </span>
        </div>

        <div className="admin-slips-stat-card">
          <span className="admin-slips-stat-label">Approved Slips</span>
          <span className="admin-slips-stat-val" style={{ color: "#059669" }}>
            {approvedCount}
          </span>
          <span className="admin-slips-stat-sub">Confirmed transfers</span>
        </div>

        <div className="admin-slips-stat-card">
          <span className="admin-slips-stat-label">Moniepoint Verified</span>
          <span className="admin-slips-stat-val" style={{ color: "var(--brand-charcoal)" }}>
            {formatNaira(totalVolume)}
          </span>
          <span className="admin-slips-stat-sub">Settled via 7067997301</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="admin-slips-controls">
        <div className="admin-slips-filter-tabs">
          <button
            type="button"
            className={`admin-slips-tab${statusFilter === "all" ? " admin-slips-tab--active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Slips ({slips.length})
          </button>
          <button
            type="button"
            className={`admin-slips-tab${statusFilter === "pending" ? " admin-slips-tab--active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`admin-slips-tab${statusFilter === "approved" ? " admin-slips-tab--active" : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            className={`admin-slips-tab${statusFilter === "rejected" ? " admin-slips-tab--active" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected ({slips.filter((s) => s.status === "rejected").length})
          </button>
        </div>

        <div className="admin-slips-search-box">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reader, email, or reference..."
            className="admin-slips-search-input"
          />
          <button
            type="button"
            onClick={loadSlips}
            className="admin-slips-refresh-btn"
            title="Refresh payment slips list"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* List / Cards */}
      {isLoading ? (
        <div className="admin-slips-empty">
          <span>Loading submitted payment slips...</span>
        </div>
      ) : error ? (
        <div className="admin-slips-empty" style={{ color: "#DC2626" }}>
          <span>{error}</span>
        </div>
      ) : filteredSlips.length === 0 ? (
        <div className="admin-slips-empty">
          <span style={{ fontSize: "2rem" }}>🧾</span>
          <strong>No payment slips found</strong>
          <span style={{ fontSize: "12px", color: "var(--color-steel-700)" }}>
            {statusFilter !== "all"
              ? `There are no ${statusFilter} payment slips.`
              : "When users pay via Moniepoint and upload their receipts, they appear here."}
          </span>
        </div>
      ) : (
        <div className="admin-slips-list">
          {filteredSlips.map((slip) => {
            const isProcessing = isProcessingAction === slip.id;

            return (
              <div
                key={slip.id}
                className={`admin-slip-card admin-slip-card--${slip.status}`}
              >
                {/* Receipt Image Thumbnail preview */}
                <div
                  className="admin-slip-card__receipt-preview"
                  onClick={() => setViewingSlip(slip)}
                  title="Click to view full receipt slip"
                >
                  <img
                    src={slip.receiptUrl}
                    alt={`Receipt proof for ${slip.reference}`}
                    className="admin-slip-card__thumbnail"
                  />
                  <span className="admin-slip-card__zoom-hint">🔍 View Full Slip</span>
                </div>

                {/* Slip Details Body */}
                <div className="admin-slip-card__details">
                  <div className="admin-slip-card__header-row">
                    <div>
                      <h4 className="admin-slip-card__reader-name">
                        {slip.userName}
                      </h4>
                      <span className="admin-slip-card__reader-email">
                        {slip.userEmail}
                      </span>
                    </div>

                    <span
                      className={`admin-slip-badge admin-slip-badge--${slip.status}`}
                    >
                      {slip.status === "pending" && "⏳ Pending Verification"}
                      {slip.status === "approved" && "✓ Verified & Approved"}
                      {slip.status === "rejected" && "✕ Rejected"}
                    </span>
                  </div>

                  <div className="admin-slip-card__meta-grid">
                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Transfer Amount</span>
                      <strong className="admin-slip-meta-amount">
                        {formatNaira(slip.amount)}
                      </strong>
                    </div>

                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Purpose</span>
                      <span className="admin-slip-meta-val">
                        {slip.purpose === "article_purchase" && slip.articleTitle
                          ? `Guide: ${slip.articleTitle}`
                          : "Reader Wallet Top-up"}
                      </span>
                    </div>

                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Sender Account Name</span>
                      <span className="admin-slip-meta-val">
                        {slip.senderName || slip.userName}
                      </span>
                    </div>

                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Reference</span>
                      <span className="admin-slip-meta-val" style={{ fontFamily: "var(--font-mono)" }}>
                        {slip.reference}
                      </span>
                    </div>

                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Destination Bank</span>
                      <span className="admin-slip-meta-val">
                        Moniepoint (7067997301 - Sopulu omah)
                      </span>
                    </div>

                    <div className="admin-slip-meta-item">
                      <span className="admin-slip-meta-label">Uploaded At</span>
                      <span className="admin-slip-meta-val">
                        {new Date(slip.createdAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {slip.rejectionReason && slip.status === "rejected" && (
                    <div className="admin-slip-rejection-note">
                      <strong>Decline Reason:</strong> {slip.rejectionReason}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="admin-slip-card__actions">
                    <button
                      type="button"
                      onClick={() => setViewingSlip(slip)}
                      className="admin-slip-btn admin-slip-btn--secondary"
                    >
                      Inspect Slip Receipt
                    </button>

                    {slip.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(slip)}
                          disabled={isProcessing}
                          className="admin-slip-btn admin-slip-btn--approve"
                        >
                          {isProcessing ? "Approving..." : "✓ Approve & Grant Access"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setRejectingSlipId(slip.id)}
                          disabled={isProcessing}
                          className="admin-slip-btn admin-slip-btn--reject"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {slip.status === "approved" && (
                      <span className="admin-slip-approved-text">
                        ✓ Approved by {slip.reviewedBy || "Admin"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal: High-Res Slip Viewer */}
      {viewingSlip && (
        <div
          className="receipt-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-slip-title"
        >
          <div
            className="receipt-lightbox__backdrop"
            onClick={() => setViewingSlip(null)}
          />
          <div className="receipt-lightbox__dialog">
            <div className="receipt-lightbox__header">
              <div>
                <h3 id="lightbox-slip-title" className="receipt-lightbox__title">
                  Receipt Proof · {viewingSlip.userName} ({formatNaira(viewingSlip.amount)})
                </h3>
                <span style={{ fontSize: "11px", color: "var(--color-steel-700)", fontFamily: "var(--font-mono)" }}>
                  Ref: {viewingSlip.reference}
                </span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <a
                  href={viewingSlip.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-slip-btn admin-slip-btn--secondary"
                  style={{ height: "30px", fontSize: "11.5px" }}
                >
                  Open in New Tab ↗
                </a>
                <button
                  type="button"
                  onClick={() => setViewingSlip(null)}
                  className="receipt-lightbox__close"
                  aria-label="Close lightbox"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="receipt-lightbox__content">
              <img
                src={viewingSlip.receiptUrl}
                alt="Payment Slip Full Size"
                className="receipt-lightbox__image"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingSlipId && (
        <div
          className="receipt-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-dialog-title"
        >
          <div
            className="receipt-lightbox__backdrop"
            onClick={() => setRejectingSlipId(null)}
          />
          <div
            className="receipt-lightbox__dialog"
            style={{ maxWidth: "460px", padding: "var(--space-5)" }}
          >
            <h3 id="reject-dialog-title" style={{ margin: 0, fontSize: "16px", color: "#DC2626" }}>
              Reject Payment Slip
            </h3>
            <p style={{ margin: "var(--space-2) 0", fontSize: "12.5px", color: "var(--color-steel-800)" }}>
              Please provide a reason for declining this manual payment proof.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: "13px",
                border: "1px solid var(--color-steel-300)",
                borderRadius: "var(--radius-md)",
                outline: "none",
                marginBottom: "var(--space-4)",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
              <button
                type="button"
                onClick={() => setRejectingSlipId(null)}
                className="admin-slip-btn admin-slip-btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="admin-slip-btn admin-slip-btn--reject"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPaymentSlips;

