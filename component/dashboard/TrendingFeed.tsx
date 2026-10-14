"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTrendingArticles, addArticle, type TrendingTimeframe, type Article } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import "./trending.scss";

export function TrendingFeed() {
  const [timeframe, setTimeframe] = useState<TrendingTimeframe>("weekly");
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    // 1. Check localStorage for instantly published articles
    try {
      const local = localStorage.getItem("streetio_custom_articles");
      if (local) {
        const parsed: Article[] = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const a of parsed) addArticle(a);
          setRefreshKey((k) => k + 1);
        }
      }
    } catch {}

    // 2. Fetch live articles from PostgreSQL via /api/article/list
    fetch("/api/article/list")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          for (const a of data.articles) {
            addArticle(a);
          }
          setRefreshKey((k) => k + 1);
        }
      })
      .catch(() => {});
  }, []);

  const articles = useMemo(() => {
    return getTrendingArticles(timeframe);
  }, [timeframe]);

  const totalVolume = useMemo(() => {
    return articles.reduce((acc, a) => acc + a.currentReads, 0);
  }, [articles]);

  return (
    <div className="trending-container">
      {/* Hero Header */}
      <header className="trending-head">
        <div className="trending-head__tag">
          <span className="trending-head__dot" aria-hidden="true" />
          <span>OPERATIONAL LEADERBOARD</span>
        </div>
        <h1 className="trending-head__title">Trending Intelligence</h1>
        <p className="trending-head__subtitle">
          The most read operational guides and practical playbooks on Street IO. Updated in real-time based on member readership.
        </p>

        {/* Filter Switcher: Weekly vs Monthly */}
        <div className="trending-filter" role="region" aria-label="Timeframe filter">
          <div className="trending-filter__segmented" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={timeframe === "weekly"}
              className={`trending-filter__btn${timeframe === "weekly" ? " trending-filter__btn--active" : ""}`}
              onClick={() => setTimeframe("weekly")}
            >
              <span>Weekly Top</span>
              {timeframe === "weekly" && (
                <span className="trending-filter__pill-badge">Live</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={timeframe === "monthly"}
              className={`trending-filter__btn${timeframe === "monthly" ? " trending-filter__btn--active" : ""}`}
              onClick={() => setTimeframe("monthly")}
            >
              <span>Monthly Top</span>
              {timeframe === "monthly" && (
                <span className="trending-filter__pill-badge">30d</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary Strip */}
      <section className="trending-stats-banner" aria-label="Readership summary metrics">
        <div className="trending-stats-banner__item">
          <span className="trending-stats-banner__label">Top Surge</span>
          <span className="trending-stats-banner__value">
            {timeframe === "weekly" ? "Dating & Romance Scam Defense" : "Business Email Compromise (BEC)"}
          </span>
        </div>
        <div className="trending-stats-banner__item">
          <span className="trending-stats-banner__label">
            {timeframe === "weekly" ? "Weekly Readership" : "Monthly Readership"}
          </span>
          <span className="trending-stats-banner__value">
            {totalVolume.toLocaleString()} reads
          </span>
        </div>
        <div className="trending-stats-banner__item">
          <span className="trending-stats-banner__label">Rank Metric</span>
          <span className="trending-stats-banner__value">
            {timeframe === "weekly" ? "7-Day Velocity & Completions" : "30-Day Aggregated Volume"}
          </span>
        </div>
      </section>

      {/* Ranked Articles Leaderboard */}
      <section aria-label={`Most read articles ${timeframe}`}>
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
              <CategoryIcon name="trending" size={32} />
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "var(--color-steel-900)" }}>
              No Trending Intelligence Yet
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-steel-600)", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
              Rankings and readership leaderboards will automatically populate as new educational playbooks are uploaded and accessed.
            </p>
          </div>
        ) : (
          <ol className="trending-list">
            {articles.map((article) => {
            const rankFormatted = String(article.rank).padStart(2, "0");
            const isTop3 = article.rank <= 3;

            return (
              <li key={article.id}>
                <article className="trending-card">
                  {/* Rank Column */}
                  <div className="trending-card__rank-col">
                    <span
                      className={`trending-card__rank-badge${
                        isTop3 ? ` trending-card__rank-badge--${article.rank}` : ""
                      }`}
                      aria-label={`Rank ${article.rank}`}
                    >
                      {rankFormatted}
                    </span>
                  </div>

                  {/* Content Column */}
                  <div className="trending-card__content">
                    {article.thumbnailUrl && (
                      <div className="trending-card__cover-wrap">
                        <Link
                          href={`/article/${article.slug}`}
                          tabIndex={-1}
                          aria-hidden="true"
                          className="trending-card__cover-link"
                        >
                          <img
                            src={article.thumbnailUrl}
                            alt={article.title}
                            className="trending-card__cover-img"
                          />
                        </Link>
                      </div>
                    )}

                    <div className="trending-card__meta">
                      <div className="trending-card__meta-left">
                        <span className="trending-card__category">{article.category}</span>
                        <span className="trending-card__velocity">
                          <span>🔥</span>
                          <span>{article.trendingDelta}</span>
                        </span>
                      </div>
                      <span className="trending-card__price">{article.price}</span>
                    </div>

                    <h2 className="trending-card__title">
                      <Link href={`/article/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {article.title}
                      </Link>
                    </h2>
                    <p className="trending-card__desc">{article.description}</p>

                    {article.keyTakeaways.length > 0 && (
                      <ul className="trending-card__takeaways">
                        {article.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                          <li key={i}>• {takeaway}</li>
                        ))}
                      </ul>
                    )}

                    {/* Footer */}
                    <div className="trending-card__footer">
                      <div className="trending-card__stats">
                        <span className="trending-card__reads">
                          <CategoryIcon name="trending" size={14} />
                          <span>
                            {article.currentReads.toLocaleString()}{" "}
                            {timeframe === "weekly" ? "reads this week" : "reads this month"}
                          </span>
                        </span>
                        <span className="trending-card__time">· {article.readTime}</span>
                      </div>

                      <Link
                        href={`/article/${article.slug}`}
                        className="trending-card__cta"
                      >
                        <span>Read Guide & Tools</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
        )}
      </section>
    </div>
  );
}

export default TrendingFeed;
