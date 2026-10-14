// File: component/dashboard/NewArticlesFeed.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getLatestArticles } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import "./new-articles.scss";

export function NewArticlesFeed() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allLatestArticles = useMemo(() => {
    return getLatestArticles();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(allLatestArticles.map((a) => a.category));
    return ["all", ...Array.from(set)];
  }, [allLatestArticles]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return allLatestArticles;
    return allLatestArticles.filter((a) => a.category === selectedCategory);
  }, [allLatestArticles, selectedCategory]);

  return (
    <div className="new-articles-container">
      {/* Hero Header */}
      <header className="new-head">
        <div className="new-head__tag">
          <span className="new-head__pulse-indicator" aria-hidden="true" />
          <span>FRESH INTELLIGENCE · JUST RELEASED</span>
        </div>
        <h1 className="new-head__title">Latest Uploads</h1>
        <p className="new-head__subtitle">
          Real-world playbooks, situational security guides, and unlisted survival skills just uploaded by verified operatives and researchers.
        </p>
      </header>

      {/* Upload Stats: cut in two cards, stacked responsively on mobile */}
      <section className="new-stats-group" aria-label="Upload summary metrics">
        <div className="new-stat-card">
          <div className="new-stat-card__top">
            <div className="new-stat-card__tag">
              <span className="new-stat-card__pulse" aria-hidden="true" />
              <span>LIVE SIGNAL</span>
            </div>
            <span className="new-stat-card__badge">Fresh Release</span>
          </div>
          <div className="new-stat-card__content">
            <span className="new-stat-card__label">Most Recent Upload</span>
            <span className="new-stat-card__value">2 hours ago</span>
          </div>
          <p className="new-stat-card__note">
            Verified operative dispatches and defensive playbooks updated hourly.
          </p>
        </div>

        <div className="new-stat-card">
          <div className="new-stat-card__top">
            <div className="new-stat-card__tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>INTEL DIRECTORY</span>
            </div>
            <span className="new-stat-card__badge new-stat-card__badge--currency">₦ Naira (Paga)</span>
          </div>
          <div className="new-stat-card__content">
            <span className="new-stat-card__label">New In Field</span>
            <span className="new-stat-card__value">{allLatestArticles.length} guides ready</span>
          </div>
          <p className="new-stat-card__note">
            Instant unredacted unlock via Paga wallet and payment channels.
          </p>
        </div>
      </section>

      {/* Category Filter Chips */}
      <div className="new-filter-bar" role="tablist" aria-label="Filter by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`new-filter-bar__chip${selectedCategory === cat ? " new-filter-bar__chip--active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all" ? "All Latest" : cat}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      {filteredArticles.length === 0 ? (
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
          {filteredArticles.map((article) => (
            <li key={article.id} className="new-card">
              {article.thumbnailUrl && (
                <div className="new-card__cover-wrap">
                  <Link
                    href={`/article/${encodeURIComponent(article.slug)}`}
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

              <div className="new-card__top">
                <div className="new-card__tags">
                  <span className="new-card__recency-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{article.uploadTag}</span>
                  </span>
                  <Link
                    href={`/category/${article.categorySlug}`}
                    className="new-card__category-badge"
                  >
                    {article.category}
                  </Link>
                </div>
                <span className="new-card__read-time">{article.readTime}</span>
              </div>

              <h2 className="new-card__title">
                <Link href={`/article/${encodeURIComponent(article.slug)}`}>
                  {article.title}
                </Link>
              </h2>

              <p className="new-card__description">{article.description}</p>

              <div className="new-card__snippet-box">
                &ldquo;{article.contentSnippet}&rdquo;
              </div>

              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <ul className="new-card__takeaways" aria-label="Key operational takeaways">
                  {article.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>{takeaway}</li>
                  ))}
                </ul>
              )}

              <div className="new-card__footer">
                <div className="new-card__pricing">
                  <span className="new-card__price-label">Unlock Fee</span>
                  <span className="new-card__price-amount">{article.price}</span>
                </div>

                <div className="new-card__actions">
                  <Link
                    href={`/article/${encodeURIComponent(article.slug)}`}
                    className="new-card__preview-btn"
                  >
                    Read & Tools
                  </Link>
                  <Link
                    href={`/checkout/paga?article=${encodeURIComponent(article.slug)}&title=${encodeURIComponent(article.title)}&price=${encodeURIComponent(article.price)}`}
                    className="new-card__unlock-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Unlock via Paga</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NewArticlesFeed;
