// File: component/dashboard/DashboardArticlesFeed.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Article, addArticle } from "@/lib/articles";
import { CategoryIcon } from "./CategoryIcon";
import "./dashboard-articles.scss";

type DashboardArticlesFeedProps = {
  initialArticles?: Article[];
  isAdmin?: boolean;
};

export function DashboardArticlesFeed({
  initialArticles = [],
  isAdmin = false,
}: DashboardArticlesFeedProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    // 1. Sync custom published articles from localStorage (instant preview after admin upload)
    try {
      const local = localStorage.getItem("streetio_custom_articles");
      if (local) {
        const parsed: Article[] = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles((prev) => {
            const combined = [...parsed, ...prev];
            const seen = new Set<string>();
            return combined.filter((a) => {
              const key = (a.slug || a.id).toLowerCase();
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }
      }
    } catch {}

    // 2. Fetch live articles from PostgreSQL via /api/article/list
    fetch("/api/article/list")
      .then((res) => res.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
          for (const a of data.articles) {
            addArticle(a);
          }
        }
      })
      .catch((err) => console.error("Error fetching articles for dashboard feed:", err));
  }, []);

  return (
    <section className="dash-section dash-articles-section" aria-labelledby="dash-articles-title">
      <div className="dash-section__head">
        <h2 id="dash-articles-title" className="dash-section__title">
          Latest Published Articles
        </h2>
        <Link href="/new" className="dash-section__link">
          View all ({articles.length})
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="dash-articles-empty">
          <span className="dash-articles-empty__icon" aria-hidden="true">
            <CategoryIcon name="file" size={28} />
          </span>
          <h3 className="dash-articles-empty__title">No Articles Published Yet</h3>
          <p className="dash-articles-empty__text">
            Actionable educational guides, verified playbooks, and practical skills will appear
            here immediately once published.
          </p>
          {isAdmin && (
            <Link href="/admin" className="dash-articles-empty__action">
              <span>+ Publish First Article</span>
            </Link>
          )}
        </div>
      ) : (
        <ul className="dash-articles-grid">
          {articles.slice(0, 6).map((article) => {
            const articleUrl = `/article/${encodeURIComponent(article.slug)}`;

            return (
              <li key={article.id} className="dash-articles-grid__item">
                <article className="dash-article-card">
                  {article.thumbnailUrl ? (
                    <Link
                      href={articleUrl}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="dash-article-card__cover-link"
                    >
                      <img
                        src={article.thumbnailUrl}
                        alt={article.title}
                        className="dash-article-card__cover-img"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={articleUrl}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="dash-article-card__cover-link"
                    >
                      <div className="dash-article-card__cover-placeholder">
                        <CategoryIcon name="file" size={24} />
                        <span>Field Guide</span>
                      </div>
                    </Link>
                  )}

                  <div className="dash-article-card__body">
                    <div className="dash-article-card__meta-row">
                      {article.category && (
                        <span className="dash-article-card__category-badge">
                          {article.category}
                        </span>
                      )}
                      <span className="dash-article-card__price-chip">
                        {article.price || "₦3,500"}
                      </span>
                    </div>

                    <h3 className="dash-article-card__title">
                      <Link href={articleUrl}>{article.title}</Link>
                    </h3>

                    {article.description && (
                      <p className="dash-article-card__desc">{article.description}</p>
                    )}

                    <div className="dash-article-card__footer">
                      <span className="dash-article-card__read-time">
                        <CategoryIcon name="book" size={14} />
                        <span>{article.readTime || "7 min read"}</span>
                      </span>

                      <Link href={articleUrl} className="dash-article-card__cta">
                        <span>Read Guide</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
