// File: component/admin/AdminReportsFeed.tsx
"use client";

import { useState } from "react";
import type { ArticleReport } from "@/lib/admin-data";

type AdminReportsFeedProps = {
  reports: ArticleReport[];
  onResolveReport: (reportId: string) => void;
  onDismissReport: (reportId: string) => void;
};

export function AdminReportsFeed({
  reports,
  onResolveReport,
  onDismissReport,
}: AdminReportsFeedProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <section className="admin-box" aria-labelledby="reports-feed-title">
      <div className="admin-box__head">
        <div>
          <h2 id="reports-feed-title" className="admin-box__title">
            Article Reports & Policy Inquiries
          </h2>
          <p className="admin-box__desc">
            Direct reports submitted by readers, corporate compliance teams, or security auditors regarding published guides.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="admin-reports-pill-group">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`admin-reports-pill-btn${filter === "all" ? " admin-reports-pill-btn--all-active" : ""}`}
          >
            All Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`admin-reports-pill-btn${filter === "pending" ? " admin-reports-pill-btn--pending-active" : ""}`}
          >
            Pending ({reports.filter((r) => r.status === "pending").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={`admin-reports-pill-btn${filter === "resolved" ? " admin-reports-pill-btn--resolved-active" : ""}`}
          >
            Resolved ({reports.filter((r) => r.status === "resolved").length})
          </button>
        </div>
      </div>

      <ul className="admin-reports-list">
        {filteredReports.map((report) => (
          <li key={report.id} className="admin-report-card">
            <div className="admin-report-card__top">
              <div className="admin-report-card__badges">
                <span
                  className={`admin-report-card__severity-pill admin-report-card__severity-pill--${report.severity}`}
                >
                  {report.severity} Priority
                </span>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-steel-100)",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "var(--color-steel-700)",
                  textTransform: "uppercase",
                }}>
                  {report.reason.replace("_", " ")}
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: report.status === "resolved" ? "#10B981" : "#F59E0B",
                }}>
                  ● {report.status.toUpperCase()}
                </span>
              </div>
              <span className="admin-report-card__timestamp">
                {report.timestamp}
              </span>
            </div>

            <h3 className="admin-report-card__title">
              {report.articleTitle}
            </h3>

            <p className="admin-report-card__desc">
              {report.description}
            </p>

            <div className="admin-report-card__footer">
              <span className="admin-report-card__reporter">
                Reported by: {report.reporterEmail}
              </span>

              <div className="admin-report-card__actions">
                {report.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onResolveReport(report.id)}
                      className="admin-report-card__resolve-btn"
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismissReport(report.id)}
                      className="admin-report-card__dismiss-btn"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--color-steel-500)", fontStyle: "italic" }}>
                    Report action closed
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
