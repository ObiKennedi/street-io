"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestArticles, addArticle, type Article } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import "./new-articles.scss";

type NewArticlesFeedProps = {
  initialArticles?: Article[];
};

export function NewArticlesFeed({ initialArticles }: NewArticlesFeedProps) {
  const [articles, setArticles] = useState<Article[]>(() => {
    if (initialArticles && initialArticles.length > 0) return initialArticles;
    return getLatestArticles();
  });

  useEffect(() => {
    // 1. Check local session storage for instant preview
    try {
      const local = localStorage.getItem("streetio_custom_articles");
      if (local) {
        const parsed: Article[] = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles((prev) => {
            const combined = [...parsed, ...prev];
            const seen = new Set();
            return combined.filter((a) => {
              const key = a.slug || a.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }
      }
    } catch {}

    // 2. Fetch live articles from PostgreSQL via /api/article/list
    fetch("/api/article/list", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
          for (const a of data.articles) {
            addArticle(a);
          }
        }
      })
      .catch((err) => console.error("Error fetching articles for /new:", err));
  }, []);

  return (
    <div className="new-articles-container">
      {/* Hero Header */}
      <header className="new-head">
        <div className="new-head__tag">
          <span className="new-head__pulse-indicator" aria-hidden="true" />
          <span>LATEST ARTICLES · RECENTLY PUBLISHED</span>
        </div>
        <h1 className="new-head__title">Latest Articles</h1>
        <p className="new-head__subtitle">
          Real-world playbooks, practical skills, and actionable guides published for immediate reading.
        </p>
      </header>

      {/* Summary Metrics */}
      <section className="new-stats-group" aria-label="Upload summary metrics">
        <div className="new-stat-card">
          <div className="new-stat-card__top">
            <div className="new-stat-card__tag">
              <span className="new-stat-card__pulse" aria-hidden="true" />
              <span>LIVE SIGNAL</span>
            </div>
            <span className="new-stat-card__badge">Fresh Releases</span>
          </div>
          <div className="new-stat-card__content">
            <span className="new-stat-card__label">Recent Publication</span>
            <span className="new-stat-card__value">Updated continuously</span>
          </div>
          <p className="new-stat-card__note">
            Practical skills and actionable guides updated and added regularly.
          </p>
        </div>

        <div className="new-stat-card">
          <div className="new-stat-card__top">
            <div className="new-stat-card__tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>DIRECTORY</span>
            </div>
            <span className="new-stat-card__badge">Full Access</span>
          </div>
          <div className="new-stat-card__content">
            <span className="new-stat-card__label">Available Articles</span>
            <span className="new-stat-card__value">{articles.length} guides ready</span>
          </div>
          <p className="new-stat-card__note">
            Browse published articles with verified insights and step-by-step instructions.
          </p>
        </div>
      </section>

      {/* Articles Feed */}
      {articles.length === 0 ? (
        <div
          style={{
            padding: "54px 24px",
            textAlign: "center",
            background: "var(--color-neutral-0)",
            border: "1px dashed var(--color-steel-300)",
            borderRadius: "var(--radius-lg)",
            marginTop: "20px",
          }}
        >
          <div style={{ display: "inline-flex", padding: "12px", background: "var(--color-steel-100)", borderRadius: "var(--radius-full)", marginBottom: "12px", color: "var(--color-steel-600)" }}>
            <CategoryIcon name="file" size={32} />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "var(--color-steel-900)" }}>
            No Articles Published Yet
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--color-steel-600)", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
            Fresh educational articles and practical playbooks will appear here immediately once uploaded.
          </p>
        </div>
      ) : (
        <ul className="new-feed">
          {articles.map((article) => {
            const articleUrl = `/article/${encodeURIComponent(article.slug)}`;

            return (
              <li key={article.id} className="new-card">
                {article.thumbnailUrl && (
                  <div className="new-card__cover-wrap">
                    <Link
                      href={articleUrl}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="new-card__cover-link"
                    >
                      <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className="new-card__cover-img"
                      />
                    </Link>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", gap: "8px" }}>
                  {article.category && (
                    <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--brand-charcoal)", background: "var(--color-steel-100)", padding: "2px 8px", borderRadius: "9999px" }}>
                      {article.category}
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#065F46",
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      marginLeft: "auto",
                    }}
                  >
                    {article.price || "₦3,500"}
                  </span>
                </div>

                <h2 className="new-card__title">
                  <Link href={articleUrl}>
                    {article.title}
                  </Link>
                </h2>

                {article.description && (
                  <p className="new-card__description">
                    {article.description}
                  </p>
                )}

                <div className="new-card__footer">
                  <Link
                    href={articleUrl}
                    className="new-card__read-link"
                  >
                    <span>Read Article</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NewArticlesFeed;
