// File: component/admin/AdminDashboardView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  INITIAL_ADMIN_ARTICLES,
  INITIAL_ADMIN_USERS,
  INITIAL_ARTICLE_REPORTS,
  calculateRevenueSummary,
  deleteAdminArticle,
  addAdminArticle,
  type AdminArticle,
  type AdminUser,
  type ArticleReport,
} from "@/lib/admin-data";
import { deleteArticle, addArticle } from "@/lib/articles";
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
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/article/list")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
        }
      })
      .catch((err) => console.error("Error loading articles:", err));
  }, []);

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
    addAdminArticle(newArticle);
    addArticle(newArticle);
    setActiveTab("articles");
  };

  const handleDeleteArticle = (articleId: string) => {
    const art = articles.find((a) => a.id === articleId);
    const title = art ? art.title : "Article";
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    deleteAdminArticle(articleId);
    deleteArticle(articleId);

    // Persist deletion to PostgreSQL via server route
    fetch("/api/article/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: articleId }),
    }).catch(() => {});

    setDeleteNotice(`"${title}" has been permanently deleted from inventory.`);
    setTimeout(() => {
      setDeleteNotice(null);
    }, 4500);
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

      {/* Delete Feedback Toast/Banner */}
      {deleteNotice && (
        <div className="admin-alert-banner admin-alert-banner--danger" role="status" aria-live="polite">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span style={{ flex: 1 }}>{deleteNotice}</span>
          <button
            type="button"
            onClick={() => setDeleteNotice(null)}
            className="admin-alert-banner__close"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

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
        <div className="admin-overview-stack">
          {/* Articles & Pricing section */}
          <AdminArticlesList
            articles={articles}
            onPriceUpdate={handlePriceUpdate}
            onStatusToggle={handleStatusToggle}
            onDeleteArticle={handleDeleteArticle}
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
          onDeleteArticle={handleDeleteArticle}
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
