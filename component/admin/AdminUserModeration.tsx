// File: component/admin/AdminUserModeration.tsx
"use client";

import { useState } from "react";
import type { AdminUser } from "@/lib/admin-data";
import { formatAdminNaira } from "@/lib/admin-data";

type AdminUserModerationProps = {
  users: AdminUser[];
  onBlockUser: (userId: string, reason: string) => void;
  onUnblockUser: (userId: string) => void;
};

const COMMON_VIOLATIONS = [
  "Automated scraper / crawler bot attempting bulk extraction",
  "Unauthorized leak / redistribution of proprietary guide on Telegram/forums",
  "Payment abuse: Multiple disputed chargebacks on Paga gateway",
  "Harassment / breach of Street IO code of conduct",
];

export function AdminUserModeration({
  users,
  onBlockUser,
  onUnblockUser,
}: AdminUserModerationProps) {
  const [filter, setFilter] = useState<"all" | "active" | "blocked">("all");
  const [search, setSearch] = useState("");
  const [blockingUser, setBlockingUser] = useState<AdminUser | null>(null);
  const [violationReason, setViolationReason] = useState(COMMON_VIOLATIONS[0]);
  const [customReason, setCustomReason] = useState("");

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === "all" || u.status === filter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConfirmBlock = () => {
    if (!blockingUser) return;
    const reasonToUse = customReason.trim() ? customReason.trim() : violationReason;
    onBlockUser(blockingUser.id, reasonToUse);
    setBlockingUser(null);
    setCustomReason("");
  };

  return (
    <section className="admin-box" aria-labelledby="user-moderation-title">
      <div className="admin-box__head">
        <div>
          <h2 id="user-moderation-title" className="admin-box__title">
            User Moderation & Policy Enforcement
          </h2>
          <p className="admin-box__desc">
            Identify policy violators, investigate scraping bots or piracy distribution, and enforce immediate account blocks.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{
            display: "inline-flex",
            padding: "3px",
            border: "1px solid var(--dash-border)",
            borderRadius: "var(--radius-full)",
            background: "var(--dash-card)",
          }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: filter === "all" ? "var(--brand-charcoal)" : "transparent",
                color: filter === "all" ? "#FFFFFF" : "var(--color-steel-700)",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: filter === "active" ? "var(--brand-charcoal)" : "transparent",
                color: filter === "active" ? "#FFFFFF" : "var(--color-steel-700)",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Active ({users.filter((u) => u.status === "active").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("blocked")}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: filter === "blocked" ? "#DC2626" : "transparent",
                color: filter === "blocked" ? "#FFFFFF" : "var(--color-steel-700)",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Blocked ({users.filter((u) => u.status === "blocked").length})
            </button>
          </div>

          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: "36px",
              padding: "0 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--dash-border)",
              fontSize: "12px",
              background: "var(--color-neutral-0)",
              color: "var(--dash-text)",
            }}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="admin-users-grid">
        {filteredUsers.map((user) => {
          const isBlocked = user.status === "blocked";

          return (
            <div
              key={user.id}
              className={`admin-users-grid__card${isBlocked ? " admin-users-grid__card--blocked" : ""}`}
            >
              <div className="admin-users-grid__top">
                <div>
                  <h3 className="admin-users-grid__user-name">{user.name}</h3>
                  <p className="admin-users-grid__user-email">{user.email}</p>
                </div>

                <span
                  className={`admin-users-grid__status-pill ${
                    isBlocked
                      ? "admin-users-grid__status-pill--blocked"
                      : "admin-users-grid__status-pill--active"
                  }`}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: isBlocked ? "#DC2626" : "#10B981",
                    }}
                  />
                  {user.status.toUpperCase()}
                </span>
              </div>

              {/* Policy Violation Box if Blocked */}
              {isBlocked && user.violationReason && (
                <div className="admin-users-grid__violation-box">
                  <strong>Policy Violation:</strong> {user.violationReason}
                  {user.blockedAt && (
                    <div style={{ marginTop: "4px", opacity: 0.85 }}>
                      Blocked on {user.blockedAt}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Row */}
              <div className="admin-users-grid__stats-row">
                <span>
                  Unlocks: <strong>{user.totalPurchases}</strong>
                </span>
                <span>
                  Total Spend: <strong>{formatAdminNaira(user.totalSpent)}</strong>
                </span>
                <span>
                  Joined: {user.joinedDate}
                </span>
              </div>

              {/* Actions */}
              <div className="admin-users-grid__actions">
                {isBlocked ? (
                  <button
                    type="button"
                    onClick={() => onUnblockUser(user.id)}
                    className="admin-users-grid__unblock-btn"
                  >
                    Unblock Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setBlockingUser(user);
                      setViolationReason(COMMON_VIOLATIONS[0]);
                    }}
                    className="admin-users-grid__block-btn"
                  >
                    Block User (Policy Violation)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Block User Modal */}
      {blockingUser && (
        <div className="admin-modal-backdrop" onClick={() => setBlockingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal__title">
              Block User: {blockingUser.name}
            </h3>
            <p className="admin-modal__desc">
              Blocking will immediately revoke {blockingUser.email}&apos;s access to paywalled guides and freeze wallet operations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-steel-700)" }}>
                Policy Violation Reason *
              </label>
              <select
                value={violationReason}
                onChange={(e) => setViolationReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--dash-border)",
                  fontSize: "13px",
                  background: "var(--color-neutral-0)",
                  color: "var(--dash-text)",
                }}
              >
                {COMMON_VIOLATIONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <label style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--color-steel-700)" }}>
                Or Custom Enforcement Note
              </label>
              <textarea
                rows={2}
                placeholder="Specific incident details, IP trace, or external leak link..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--dash-border)",
                  fontSize: "13px",
                  background: "var(--color-neutral-0)",
                  color: "var(--dash-text)",
                }}
              />
            </div>

            <div className="admin-modal__actions">
              <button
                type="button"
                onClick={() => setBlockingUser(null)}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "var(--radius-md)",
                  background: "transparent",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                style={{
                  height: "36px",
                  padding: "0 16px",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  background: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
