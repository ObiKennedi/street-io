// File: component/admin/AdminArticlesList.tsx
"use client";

import { useState } from "react";
import type { AdminArticle } from "@/lib/admin-data";
import { formatAdminNaira } from "@/lib/admin-data";

type AdminArticlesListProps = {
  articles: AdminArticle[];
  onPriceUpdate: (articleId: string, newPriceFormatted: string) => void;
  onStatusToggle?: (articleId: string) => void;
  onDeleteArticle?: (articleId: string) => void;
};

export function AdminArticlesList({
  articles,
  onPriceUpdate,
  onStatusToggle,
  onDeleteArticle,
}: AdminArticlesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (article: AdminArticle) => {
    const numericOnly = article.price.replace(/[^0-9]/g, "");
    setEditingId(article.id);
    setEditingPrice(numericOnly);
  };

  const handleSavePrice = (articleId: string) => {
    const numeric = parseInt(editingPrice.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numeric) && numeric > 0) {
      onPriceUpdate(articleId, `₦${numeric.toLocaleString()}`);
    }
    setEditingId(null);
  };

  return (
    <section className="admin-box" aria-labelledby="inventory-title">
      <div className="admin-box__head">
        <div>
          <h2 id="inventory-title" className="admin-box__title">
            Articles Inventory & Pricing Controls
          </h2>
          <p className="admin-box__desc">
            Monitor read traffic, copies sold, revenue generated, and update micro-pricing in real-time.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="admin-box__search-bar">
          <input
            type="search"
            placeholder="Search playbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-box__search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-box__filter-select"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Category</th>
              <th>Unlock Price</th>
              <th>Sold Unlocks</th>
              <th>Revenue Generated</th>
              <th>Status</th>
              <th className="admin-table__actions-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((art) => {
              const isEditing = editingId === art.id;

              return (
                <tr key={art.id}>
                  <td className="admin-table__title-cell">
                    <span className="admin-table__article-title" title={art.title}>
                      {art.title}
                    </span>
                    <span className="admin-table__article-meta">
                      {art.readTime} • {art.weeklyReads.toLocaleString()} reads this wk
                    </span>
                  </td>

                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-steel-100)",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--color-steel-800)",
                      whiteSpace: "nowrap",
                    }}>
                      {art.category}
                    </span>
                  </td>

                  {/* Unlock Price with Inline Editor */}
                  <td>
                    {isEditing ? (
                      <div className="admin-table__price-input-group">
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>₦</span>
                        <input
                          type="number"
                          step="500"
                          min="500"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          className="admin-table__inline-price-input"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePrice(art.id)}
                          className="admin-table__save-price-btn"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="admin-table__cancel-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="admin-table__price-badge">
                        {art.price}
                      </span>
                    )}
                  </td>

                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>
                    {art.soldCopies.toLocaleString()} copies
                  </td>

                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: "bold", color: "#059669" }}>
                    {formatAdminNaira(art.revenueGenerated)}
                  </td>

                  <td>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: art.status === "published" ? "#065F46" : "#6B7280",
                      background: art.status === "published" ? "#ECFDF5" : "#F3F4F6",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      border: art.status === "published" ? "1px solid #A7F3D0" : "1px solid #E5E7EB",
                    }}>
                      <span style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: art.status === "published" ? "#10B981" : "#9CA3AF",
                      }} />
                      {art.status}
                    </span>
                  </td>

                  <td className="admin-table__actions-cell">
                    <div className="admin-table__action-group">
                      {confirmDeleteId === art.id ? (
                        <div className="admin-table__delete-confirm-box">
                          <span style={{ fontSize: "11px", color: "#B91C1C", fontWeight: "bold" }}>
                            Delete?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteArticle?.(art.id);
                              setConfirmDeleteId(null);
                            }}
                            className="admin-table__action-btn admin-table__action-btn--danger-confirm"
                            title="Permanently remove article"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="admin-table__action-btn"
                            title="Cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(art)}
                              className="admin-table__action-btn"
                              title="Adjust Article Price in Naira"
                            >
                              Set Price
                            </button>
                          )}
                          {onStatusToggle && (
                            <button
                              type="button"
                              onClick={() => onStatusToggle(art.id)}
                              className="admin-table__action-btn"
                            >
                              {art.status === "published" ? "Archive" : "Publish"}
                            </button>
                          )}
                          {onDeleteArticle && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(art.id)}
                              className="admin-table__action-btn admin-table__action-btn--danger"
                              title="Delete this article permanently"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Column View (< 768px) */}
      <div className="admin-articles-mobile">
        {filteredArticles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--color-steel-500)", fontSize: "13px" }}>
            No articles match your search or category filter.
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isEditing = editingId === art.id;

            return (
              <div key={art.id} className="admin-article-card">
                {/* Top Badges */}
                <div className="admin-article-card__top">
                  <span className="admin-article-card__cat-badge">{art.category}</span>
                  <span className={`admin-article-card__status-badge admin-article-card__status-badge--${art.status}`}>
                    <span className="admin-article-card__status-dot" />
                    {art.status.toUpperCase()}
                  </span>
                </div>

                {/* Title & Reading Meta */}
                <div className="admin-article-card__info">
                  <h3 className="admin-article-card__title">{art.title}</h3>
                  <p className="admin-article-card__meta">
                    {art.readTime} • {art.weeklyReads.toLocaleString()} reads this week
                  </p>
                </div>

                {/* Performance Stats Column */}
                <div className="admin-article-card__stats">
                  <div className="admin-article-card__stat-item">
                    <span className="admin-article-card__stat-label">Sold Copies</span>
                    <span className="admin-article-card__stat-value">{art.soldCopies.toLocaleString()} copies</span>
                  </div>
                  <div className="admin-article-card__stat-item">
                    <span className="admin-article-card__stat-label">Revenue Generated</span>
                    <span className="admin-article-card__stat-value admin-article-card__stat-value--revenue">
                      {formatAdminNaira(art.revenueGenerated)}
                    </span>
                  </div>
                </div>

                {/* Price Management */}
                <div className="admin-article-card__price-section">
                  <span className="admin-article-card__price-label">Unlock Price (₦)</span>
                  {isEditing ? (
                    <div className="admin-article-card__price-edit-row">
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>₦</span>
                      <input
                        type="number"
                        step="500"
                        min="500"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className="admin-article-card__price-input"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePrice(art.id)}
                        className="admin-article-card__save-btn"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="admin-article-card__cancel-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="admin-article-card__price-display-row">
                      <span className="admin-article-card__price-badge">{art.price}</span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(art)}
                        className="admin-article-card__edit-price-btn"
                      >
                        Set Price
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Controls Column */}
                <div className="admin-article-card__actions">
                  {confirmDeleteId === art.id ? (
                    <div className="admin-article-card__delete-confirm">
                      <span style={{ fontSize: "12px", color: "#B91C1C", fontWeight: "bold" }}>
                        Permanently delete this article?
                      </span>
                      <div className="admin-article-card__delete-buttons">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteArticle?.(art.id);
                            setConfirmDeleteId(null);
                          }}
                          className="admin-article-card__btn admin-article-card__btn--danger-confirm"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="admin-article-card__btn admin-article-card__btn--cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-article-card__action-buttons">
                      {onStatusToggle && (
                        <button
                          type="button"
                          onClick={() => onStatusToggle(art.id)}
                          className="admin-article-card__btn admin-article-card__btn--secondary"
                        >
                          {art.status === "published" ? "Archive Article" : "Publish Article"}
                        </button>
                      )}
                      {onDeleteArticle && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(art.id)}
                          className="admin-article-card__btn admin-article-card__btn--danger"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
