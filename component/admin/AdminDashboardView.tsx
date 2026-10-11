// File: component/admin/AdminDashboardView.tsx
"use client";

import { useMemo, useState } from "react";
import {
  INITIAL_ADMIN_ARTICLES,
  INITIAL_ADMIN_USERS,
  INITIAL_ARTICLE_REPORTS,
  calculateRevenueSummary,
  type AdminArticle,
  type AdminUser,
  type ArticleReport,
} from "@/lib/admin-data";
import { AdminHeader } from "./AdminHeader";
import { AdminStatsOverview } from "./AdminStatsOverview";
import { AdminArticleUpload } from "./AdminArticleUpload";
import { AdminArticlesList } from "./AdminArticlesList";
import { AdminUserModeration } from "./AdminUserModeration";
import { AdminReportsFeed } from "./AdminReportsFeed";
import "./admin.scss";

type AdminTab = "overview" | "upload" | "articles" | "moderation" | "reports";

export function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [articles, setArticles] = useState<AdminArticle[]>(INITIAL_ADMIN_ARTICLES);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [reports, setReports] = useState<ArticleReport[]>(INITIAL_ARTICLE_REPORTS);

  const summary = useMemo(() => {
    return calculateRevenueSummary(articles);
  }, [articles]);

  const blockedUsersCount = useMemo(() => {
    return users.filter((u) => u.status === "blocked").length;
  }, [users]);

  const pendingReportsCount = useMemo(() => {
    return reports.filter((r) => r.status === "pending").length;
  }, [reports]);

  // Handlers
  const handleArticleCreated = (newArticle: AdminArticle) => {
    setArticles((prev) => [newArticle, ...prev]);
    setActiveTab("articles");
  };

  const handlePriceUpdate = (articleId: string, newPriceFormatted: string) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          const numeric = parseInt(newPriceFormatted.replace(/[^0-9]/g, ""), 10) || 3500;
          return {
            ...art,
            price: newPriceFormatted,
            revenueGenerated: art.soldCopies * numeric,
          };
        }
        return art;
      })
    );
  };

  const handleStatusToggle = (articleId: string) => {
    setArticles((prev) =>
      prev.map((art) => {
        if (art.id === articleId) {
          return {
            ...art,
            status: art.status === "published" ? "archived" : "published",
          };
        }
        return art;
      })
    );
  };

  const handleBlockUser = (userId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: "blocked",
            violationReason: reason,
            blockedAt: new Date().toISOString().split("T")[0],
          };
        }
        return u;
      })
    );
  };

  const handleUnblockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            status: "active",
            violationReason: undefined,
            blockedAt: undefined,
          };
        }
        return u;
      })
    );
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r))
    );
  };

  const handleDismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "dismissed" } : r))
    );
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <AdminHeader onPublishClick={() => setActiveTab("upload")} />

      {/* KPI Overview Metrics */}
      <AdminStatsOverview
        summary={summary}
        totalArticles={articles.length}
        blockedUsersCount={blockedUsersCount}
        pendingReportsCount={pendingReportsCount}
      />

      {/* Navigation Tabs */}
      <nav className="admin-nav" aria-label="Admin Navigation Tabs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`admin-nav__tab${activeTab === "overview" ? " admin-nav__tab--active" : ""}`}
        >
          <span>Revenue & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`admin-nav__tab${activeTab === "upload" ? " admin-nav__tab--active" : ""}`}
        >
          <span>Publish Article</span>
          <span className="admin-nav__pill">+ New</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`admin-nav__tab${activeTab === "articles" ? " admin-nav__tab--active" : ""}`}
        >
          <span>Articles & Pricing</span>
          <span className="admin-nav__pill">{articles.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("moderation")}
          className={`admin-nav__tab${activeTab === "moderation" ? " admin-nav__tab--active" : ""}`}
        >
          <span>User Moderation</span>
          {blockedUsersCount > 0 && (
            <span className="admin-nav__pill" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {blockedUsersCount} blocked
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`admin-nav__tab${activeTab === "reports" ? " admin-nav__tab--active" : ""}`}
        >
          <span>Incident Reports</span>
          {pendingReportsCount > 0 && (
            <span className="admin-nav__pill" style={{ background: "#FEF3C7", color: "#92400E" }}>
              {pendingReportsCount} pending
            </span>
          )}
        </button>
      </nav>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Articles & Pricing section */}
          <AdminArticlesList
            articles={articles}
            onPriceUpdate={handlePriceUpdate}
            onStatusToggle={handleStatusToggle}
          />

          {/* User Moderation section */}
          <AdminUserModeration
            users={users}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
          />

          {/* Incident Reports section */}
          <AdminReportsFeed
            reports={reports}
            onResolveReport={handleResolveReport}
            onDismissReport={handleDismissReport}
          />
        </div>
      )}

      {activeTab === "upload" && (
        <AdminArticleUpload
          onArticleCreated={handleArticleCreated}
          onCancel={() => setActiveTab("overview")}
        />
      )}

      {activeTab === "articles" && (
        <AdminArticlesList
          articles={articles}
          onPriceUpdate={handlePriceUpdate}
          onStatusToggle={handleStatusToggle}
        />
      )}

      {activeTab === "moderation" && (
        <AdminUserModeration
          users={users}
          onBlockUser={handleBlockUser}
          onUnblockUser={handleUnblockUser}
        />
      )}

      {activeTab === "reports" && (
        <AdminReportsFeed
          reports={reports}
          onResolveReport={handleResolveReport}
          onDismissReport={handleDismissReport}
        />
      )}
    </div>
  );
}

export default AdminDashboardView;
