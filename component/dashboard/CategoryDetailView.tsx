// File: component/dashboard/CategoryDetailView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type Article } from "@/lib/articles";
import { type DashboardCategory } from "./categories.config";
import { CategoryIcon } from "./CategoryIcon";
import { Loader } from "@/component/ui/Loader";
import "./category-page.scss";

type CategoryDetailViewProps = {
  category: DashboardCategory;
  articles: Article[];
  relatedCategories: DashboardCategory[];
};

export function CategoryDetailView({
  category,
  articles,
  relatedCategories,
}: CategoryDetailViewProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter articles by query within this category
  const filteredArticles = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [articles, filterQuery]);

  const totalReads = useMemo(() => {
    return articles.reduce((acc, a) => acc + (a.totalReads ?? a.monthlyReads ?? 0), 0);
  }, [articles]);

  const handleSynthesizeAi = () => {
    if (aiOverview || isLoadingAi) return;
    setIsLoadingAi(true);

    fetch("/api/ai-overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: `${category.label}: operational risks, protocols and key takeaways` }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.overview) {
          setAiOverview(data.overview);
        }
      })
      .catch((err) => {
        console.error("Category AI synthesis error:", err);
      })
      .finally(() => {
        setIsLoadingAi(false);
      });
  };

  return (
    <div className="category-page">
      {/* Top back navigation */}
      <nav aria-label="Breadcrumb">
        <Link href="/dashboard" className="category-page__back">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </nav>

      {/* Category Hero Header */}
      <header className="category-page__hero">
        <div className="category-page__hero-top">
          <div className="category-page__hero-identity">
            <span className="category-page__icon-box" aria-hidden="true">
              <CategoryIcon name={category.icon} size={28} />
            </span>
            <div>
              <div className="category-page__tagline">
                <span className="category-page__dot" aria-hidden="true" />
                <span>OPERATIONAL CATEGORY</span>
              </div>
              <h1 className="category-page__title">{category.label}</h1>
            </div>
          </div>
        </div>

        {category.description && (
          <p className="category-page__desc">{category.description}</p>
        )}

        {/* Micro metrics bar */}
        <div className="category-page__metrics">
          <div className="category-page__metric-item">
            <span className="category-page__metric-label">Available Guides</span>
            <span className="category-page__metric-value">
              {articles.length} {articles.length === 1 ? "Tactical Guide" : "Tactical Guides"}
            </span>
          </div>
          <div className="category-page__metric-item">
            <span className="category-page__metric-label">Access Pricing</span>
            <span className="category-page__metric-value">
              {articles[0]?.price ? `From ${articles[0].price} per guide` : "Wallet Balance Access"}
            </span>
          </div>
          <div className="category-page__metric-item">
            <span className="category-page__metric-label">Audited Readership</span>
            <span className="category-page__metric-value">
              {totalReads > 0 ? `${totalReads.toLocaleString()} reads` : "Vetted Curriculum"}
            </span>
          </div>
        </div>
      </header>

      {/* Gemini AI Category Intelligence Box */}
      <section className="category-page__ai-box" aria-label="Gemini AI Category Synthesis">
        <div className="category-page__ai-head">
          <span className="category-page__ai-badge">
            <CategoryIcon name="sparkles" size={13} />
            <span>Gemini AI Category Intel</span>
          </span>
          {!aiOverview && (
            <button
              type="button"
              onClick={handleSynthesizeAi}
              disabled={isLoadingAi}
              className="category-page__ai-btn"
            >
              {isLoadingAi ? "Synthesizing..." : "Generate AI Overview"}
            </button>
          )}
        </div>

        {isLoadingAi ? (
          <div style={{ padding: "var(--space-4) 0", display: "grid", placeItems: "center" }}>
            <Loader size="sm" label={`Analyzing ${category.label} playbooks with Gemini...`} />
          </div>
        ) : aiOverview ? (
          <div className="category-page__ai-content">
            {aiOverview.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <p className="category-page__ai-content" style={{ color: "var(--color-steel-800)", margin: 0 }}>
            Click &ldquo;Generate AI Overview&rdquo; to trigger real-time Gemini synthesis summarizing standard adversary mechanics, regulatory red flags, and primary defense tactics for <strong>{category.label}</strong>.
          </p>
        )}
      </section>

      {/* Articles List Section */}
      <section aria-labelledby="category-guides-heading">
        <div className="category-page__section-head">
          <h2 id="category-guides-heading" className="category-page__section-title">
            Operational Guides & Playbooks
          </h2>
          <span className="category-page__section-count">
            {filteredArticles.length} {filteredArticles.length === 1 ? "guide" : "guides"} listed
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div
            style={{
              padding: "var(--space-10) var(--space-4)",
              textAlign: "center",
              background: "var(--color-neutral-0)",
              border: "1px dashed var(--color-steel-300)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <CategoryIcon name="file" size={32} />
            <h3 style={{ margin: "var(--space-2) 0 4px", fontSize: "var(--text-base)" }}>
              No guides match &ldquo;{filterQuery}&rdquo;
            </h3>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-steel-800)" }}>
              Clear your filter to view all guides in {category.label}.
            </p>
          </div>
        ) : (
          <ul className="category-page__list">
            {filteredArticles.map((article) => (
              <li key={article.id}>
                <article className="category-page__card">
                  <div className="category-page__card-meta">
                    <span className="category-page__card-tag">{article.category}</span>
                    <span className="category-page__card-price">{article.price}</span>
                  </div>

                  <h3 className="category-page__card-title">
                    <Link href={`/article/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="category-page__card-desc">{article.description}</p>

                  {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                    <ul className="category-page__card-takeaways">
                      {article.keyTakeaways.map((takeaway, i) => (
                        <li key={i}>• {takeaway}</li>
                      ))}
                    </ul>
                  )}

                  <div className="category-page__card-footer">
                    <div className="category-page__card-stats">
                      <span>{article.readTime}</span>
                      {article.totalReads && (
                        <span>· {article.totalReads.toLocaleString()} reads</span>
                      )}
                    </div>

                    <Link
                      href={`/article/${article.slug}`}
                      className="category-page__card-cta"
                    >
                      <span>Read Guide & Tools</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Related Categories Navigation Strip */}
      {relatedCategories.length > 0 && (
        <aside className="category-page__related" aria-label="Related operational categories">
          <h3 className="category-page__related-title">Explore Related Topics</h3>
          <div className="category-page__related-pills">
            {relatedCategories.map((rel) => (
              <Link
                key={rel.slug}
                href={`/category/${rel.slug}`}
                className="category-page__related-pill"
              >
                <CategoryIcon name={rel.icon} size={15} />
                <span>{rel.label}</span>
              </Link>
            ))}
            <Link href="/explore" className="category-page__related-pill" style={{ fontStyle: "italic" }}>
              <span>View All 25 Categories →</span>
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}

export default CategoryDetailView;
