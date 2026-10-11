// File: component/admin/AdminStatsOverview.tsx
"use client";

import { type RevenueSummary, formatAdminNaira } from "@/lib/admin-data";

type AdminStatsOverviewProps = {
  summary: RevenueSummary;
  totalArticles: number;
  blockedUsersCount: number;
  pendingReportsCount: number;
};

export function AdminStatsOverview({
  summary,
  totalArticles,
  blockedUsersCount,
  pendingReportsCount,
}: AdminStatsOverviewProps) {
  return (
    <section className="admin-kpis" aria-label="Executive Performance Metrics">
      {/* 1. Total Sold Revenue */}
      <div className="admin-kpis__card admin-kpis__card--highlight">
        <span className="admin-kpis__label">Total Sold Revenue</span>
        <span className="admin-kpis__value">
          {formatAdminNaira(summary.totalRevenueNaira)}
        </span>
        <span className="admin-kpis__meta">
          {summary.dailyRevenueDelta} growth vs last week
        </span>
      </div>

      {/* 2. Total Articles Sold */}
      <div className="admin-kpis__card">
        <span className="admin-kpis__label">Articles Sold / Unlocks</span>
        <span className="admin-kpis__value">
          {summary.totalArticleSales.toLocaleString()}
        </span>
        <span className="admin-kpis__meta">
          From {totalArticles} published playbooks
        </span>
      </div>

      {/* 3. Paga Gateway Settlements */}
      <div className="admin-kpis__card">
        <span className="admin-kpis__label">Paga Settled Payouts</span>
        <span className="admin-kpis__value" style={{ color: "#059669" }}>
          {formatAdminNaira(summary.settledViaPaga)}
        </span>
        <span className="admin-kpis__meta">
          Escrow Pending: {formatAdminNaira(summary.pendingEscrow)}
        </span>
      </div>

      {/* 4. Policy Moderation & Risk */}
      <div className="admin-kpis__card">
        <span className="admin-kpis__label">Policy Moderation</span>
        <span className="admin-kpis__value" style={{ color: blockedUsersCount > 0 ? "#DC2626" : "inherit" }}>
          {blockedUsersCount} Blocked
        </span>
        <span className="admin-kpis__meta">
          {pendingReportsCount} incident reports awaiting review
        </span>
      </div>
    </section>
  );
}
