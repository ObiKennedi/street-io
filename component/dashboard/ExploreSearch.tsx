// File: component/dashboard/ExploreSearch.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CategoryIcon } from "./CategoryIcon";
import {
  exploreCategories,
  moneyIncomeCategories,
  streetInfoCategories,
  type DashboardCategory,
} from "./categories.config";
import { searchArticles, type Article } from "@/lib/articles";
import { Loader } from "@/component/ui/Loader";
import "./explore.scss";

const QUICK_PROMPTS = [
  "Make money online",
  "Sales and getting clients",
  "AI and technology",
  "Blackmail extortion playbook",
  "BEC wire transfer defense",
  "Crypto investment red flags",
];

export function ExploreSearch() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "money-income" | "street-info">("all");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>("gemini-2.0-flash");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery && initialQuery !== query) {
      handleSearch(initialQuery);
    }
  }, [searchParams]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const clean = searchQuery.trim();

    if (!clean) {
      setSearchResults([]);
      setAiOverview(null);
      return;
    }

    startTransition(() => {
      const results = searchArticles(clean);
      setSearchResults(results);
    });

    // Fetch AI overview with Gemini
    setIsLoadingAi(true);
    fetch("/api/ai-overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: clean }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.overview) {
          setAiOverview(data.overview);
          setAiSource(data.source || "gemini-2.0-flash");
        }
      })
      .catch((err) => {
        console.error("AI Overview fetch error:", err);
      })
      .finally(() => {
        setIsLoadingAi(false);
      });
  };

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
    setAiOverview(null);
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="explore-container">
      {/* Header */}
      <header className="explore-head">
        <div className="explore-head__tag">
          <span className="explore-head__dot" aria-hidden="true" />
          <span>OPERATIONAL DATABASE</span>
        </div>
        <h1 className="explore-head__title">Explore Topics & Guides</h1>
        <p className="explore-head__subtitle">
          Browse 28 actionable categories across Money / Income and Street Info, or search to trigger real-time AI synthesis.
        </p>
      </header>

      {/* Search Bar */}
      <section className="explore-search" aria-label="Search articles and topics">
        <form
          className="explore-search__bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
        >
          <span className="explore-search__icon" aria-hidden="true">
            <CategoryIcon name="search" size={18} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search guides (make money, sales, AI, scams, BEC, blackmail)..."
            className="explore-search__input"
            aria-label="Search Street IO guides"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="explore-search__clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button type="submit" className="explore-search__submit">
            Search
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="explore-search__pills" role="toolbar" aria-label="Quick searches">
          <span className="explore-search__pill-label">Try:</span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="explore-search__pill"
              onClick={() => handleSearch(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      {/* Active Search Results State */}
      {isSearching ? (
        <div className="explore-search-results-wrapper">
          {/* Gemini AI Overview Card */}
          <section className="ai-overview-card" aria-label="Gemini AI Overview">
            <div className="ai-overview-card__head">
              <span className="ai-overview-card__badge">
                <CategoryIcon name="sparkles" size={14} />
                <span>Gemini AI Overview</span>
              </span>
              <span className="ai-overview-card__source">
                {aiSource === "gemini-2.0-flash" ? "Live Gemini Flash" : "Knowledge Base"}
              </span>
            </div>

            {isLoadingAi ? (
              <div className="ai-overview-card__loading">
                <Loader size="sm" label="Generating AI Overview with Gemini..." />
              </div>
            ) : aiOverview ? (
              <div className="ai-overview-card__body">
                {aiOverview.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="ai-overview-card__body">
                Analyzing practical intelligence for &ldquo;{query}&rdquo;...
              </p>
            )}
          </section>

          {/* Recommended Articles Section */}
          <section className="explore-results" aria-labelledby="recommended-guides-heading">
            <div className="explore-results__head">
              <h2 id="recommended-guides-heading" className="explore-results__title">
                Recommended Guides
              </h2>
              <span className="explore-results__count">
                {searchResults.length} {searchResults.length === 1 ? "guide" : "guides"} found
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="explore-results__empty">
                <CategoryIcon name="file" size={32} />
                <h3>No exact matches for &ldquo;{query}&rdquo;</h3>
                <p>
                  Try searching broader terms like &ldquo;money&rdquo;, &ldquo;sales&rdquo;, &ldquo;scam&rdquo;, &ldquo;career&rdquo;, or select a category below.
                </p>
              </div>
            ) : (
              <ul className="explore-results__list">
                {searchResults.map((article) => (
                  <li key={article.id} className="explore-results__item">
                    {article.thumbnailUrl && (
                      <div className="explore-results__cover-wrap">
                        <Link
                          href={`/article/${article.slug}`}
                          tabIndex={-1}
                          aria-hidden="true"
                          className="explore-results__cover-link"
                        >
                          <img
                            src={article.thumbnailUrl}
                            alt={article.title}
                            className="explore-results__cover-img"
                          />
                        </Link>
                      </div>
                    )}

                    <div className="explore-results__meta">
                      <span className="explore-results__tag">{article.category}</span>
                      <span className="explore-results__price">{article.price}</span>
                    </div>

                    <h3 className="explore-results__article-title">
                      <Link href={`/article/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="explore-results__desc">{article.description}</p>

                    {article.keyTakeaways.length > 0 && (
                      <ul className="explore-results__takeaways">
                        {article.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                          <li key={i}>• {takeaway}</li>
                        ))}
                      </ul>
                    )}

                    <div className="explore-results__footer">
                      <span className="explore-results__time">{article.readTime}</span>
                      <Link
                        href={`/article/${article.slug}`}
                        className="explore-results__cta"
                      >
                        <span>Read Guide & Tools</span> →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        /* Default State: Categorized into MONEY / INCOME and STREET INFO */
        <div className="explore-categorized-hub">
          {/* Section Filter Tabs */}
          <div className="explore-section-tabs" role="tablist" aria-label="Category sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              className={`explore-section-tab ${activeTab === "all" ? "explore-section-tab--active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <span>All Topics</span>
              <span className="explore-section-tab__count">{exploreCategories.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "money-income"}
              className={`explore-section-tab explore-section-tab--money ${activeTab === "money-income" ? "explore-section-tab--active" : ""}`}
              onClick={() => setActiveTab("money-income")}
            >
              <span className="explore-section-tab__icon" aria-hidden="true">💰</span>
              <span>MONEY / INCOME</span>
              <span className="explore-section-tab__count">{moneyIncomeCategories.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "street-info"}
              className={`explore-section-tab explore-section-tab--street ${activeTab === "street-info" ? "explore-section-tab--active" : ""}`}
              onClick={() => setActiveTab("street-info")}
            >
              <span className="explore-section-tab__icon" aria-hidden="true">🕵️</span>
              <span>STREET INFO</span>
              <span className="explore-section-tab__count">{streetInfoCategories.length}</span>
            </button>
          </div>

          {/* 1. MONEY / INCOME SECTION */}
          {(activeTab === "all" || activeTab === "money-income") && (
            <section className="explore-group-section" aria-labelledby="money-income-heading">
              <div className="explore-group-section__head">
                <div className="explore-group-section__title-group">
                  <div className="explore-group-section__eyebrow">
                    <span className="explore-group-section__eyebrow-pill explore-group-section__eyebrow-pill--money">
                      FINANCIAL & CAREER
                    </span>
                  </div>
                  <h2 id="money-income-heading" className="explore-group-section__title">
                    MONEY / INCOME
                  </h2>
                </div>
                <div className="explore-group-section__badge-count">
                  {moneyIncomeCategories.length} categories
                </div>
              </div>
              <p className="explore-group-section__desc">
                Real-world monetization models, business building, client acquisition, in-demand digital skills, and wealth creation.
              </p>

              <ul className="explore-grid-section__grid">
                {moneyIncomeCategories.map((category) => (
                  <li key={category.slug} className="explore-grid-section__item">
                    <Link
                      href={`/category/${category.slug}`}
                      className="explore-grid-section__card explore-grid-section__card--money"
                      aria-label={`Explore ${category.label}`}
                    >
                      <span className="explore-grid-section__icon" aria-hidden="true">
                        <CategoryIcon name={category.icon} size={20} />
                      </span>
                      <div className="explore-grid-section__body">
                        <div className="explore-grid-section__title-row">
                          <span className="explore-grid-section__label">{category.label}</span>
                          {category.isNew && (
                            <span className="explore-grid-section__badge">New</span>
                          )}
                        </div>
                        {category.description && (
                          <span className="explore-grid-section__desc">{category.description}</span>
                        )}
                      </div>
                      <span className="explore-grid-section__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 2. STREET INFO SECTION */}
          {(activeTab === "all" || activeTab === "street-info") && (
            <section className="explore-group-section" aria-labelledby="street-info-heading">
              <div className="explore-group-section__head">
                <div className="explore-group-section__title-group">
                  <div className="explore-group-section__eyebrow">
                    <span className="explore-group-section__eyebrow-pill explore-group-section__eyebrow-pill--street">
                      TACTICAL INTELLIGENCE
                    </span>
                  </div>
                  <h2 id="street-info-heading" className="explore-group-section__title">
                    STREET INFO
                  </h2>
                </div>
                <div className="explore-group-section__badge-count">
                  {streetInfoCategories.length} categories
                </div>
              </div>
              <p className="explore-group-section__desc">
                Tactical street awareness, extortion defense, executive fraud protection, OSINT forensics, and unpublished insider advisories.
              </p>

              <ul className="explore-grid-section__grid">
                {streetInfoCategories.map((category) => (
                  <li key={category.slug} className="explore-grid-section__item">
                    <Link
                      href={`/category/${category.slug}`}
                      className="explore-grid-section__card"
                      aria-label={`Explore ${category.label}`}
                    >
                      <span className="explore-grid-section__icon" aria-hidden="true">
                        <CategoryIcon name={category.icon} size={20} />
                      </span>
                      <div className="explore-grid-section__body">
                        <div className="explore-grid-section__title-row">
                          <span className="explore-grid-section__label">{category.label}</span>
                          {category.isNew && (
                            <span className="explore-grid-section__badge">New</span>
                          )}
                        </div>
                        {category.description && (
                          <span className="explore-grid-section__desc">{category.description}</span>
                        )}
                      </div>
                      <span className="explore-grid-section__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default ExploreSearch;

