// File: component/admin/AdminArticlesList.tsx
"use client";

import { useState } from "react";
import type { AdminArticle } from "@/lib/admin-data";

type AdminArticlesListProps = {
  articles: AdminArticle[];
  onPriceUpdate?: (articleId: string, newPriceFormatted: string) => void;
  onStatusToggle?: (articleId: string) => void;
  onDeleteArticle?: (articleId: string) => void;
};

export function AdminArticlesList({
  articles,
  onDeleteArticle,
}: AdminArticlesListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((art) => {
    const q = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      (art.description && art.description.toLowerCase().includes(q))
    );
  });

  return (
    <section className="admin-box" aria-labelledby="inventory-title">
      <div className="admin-box__head">
        <div>
          <h2 id="inventory-title" className="admin-box__title">
            Articles Inventory
          </h2>
          <p className="admin-box__desc">
            Manage your published articles, links, descriptions, and cover thumbnails.
          </p>
        </div>

        {/* Search Bar */}
        <div className="admin-box__search-bar">
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-box__search-input"
          />
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Thumbnail</th>
              <th>Article</th>
              <th>Description</th>
              <th>Link</th>
              <th className="admin-table__actions-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "48px 16px", color: "var(--color-steel-500)", fontSize: "14px" }}>
                  No articles in inventory yet. Use the <strong>Upload</strong> tab above to publish articles.
                </td>
              </tr>
            ) : (
              filteredArticles.map((art) => {
                const articleLink = art.link || `/article/${art.slug}`;

                return (
                  <tr key={art.id}>
                    {/* Thumbnail */}
                    <td style={{ width: "60px" }}>
                      {art.thumbnailUrl ? (
                        <img
                          src={art.thumbnailUrl}
                          alt={art.title}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            display: "block",
                            border: "1px solid var(--color-steel-300)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "6px",
                            background: "var(--color-steel-100)",
                            border: "1px solid var(--color-steel-200)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "16px",
                            color: "var(--color-steel-600)",
                          }}
                        >
                          📄
                        </div>
                      )}
                    </td>

                    {/* Article Title */}
                    <td className="admin-table__title-cell">
                      <span className="admin-table__article-title" title={art.title} style={{ fontWeight: 600 }}>
                        {art.title}
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ maxWidth: "280px" }}>
                      <span style={{ fontSize: "12px", color: "var(--color-steel-700)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {art.description || "—"}
                      </span>
                    </td>

                    {/* Link */}
                    <td>
                      <a
                        href={articleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#2563EB",
                          textDecoration: "underline",
                          wordBreak: "break-all",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>{articleLink}</span>
                        <span>↗</span>
                      </a>
                    </td>

                    {/* Actions */}
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
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          onDeleteArticle && (
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
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="admin-articles-mobile">
        {filteredArticles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--color-steel-500)", fontSize: "13px" }}>
            No articles match your search.
          </div>
        ) : (
          filteredArticles.map((art) => {
            const articleLink = art.link || `/article/${art.slug}`;

            return (
              <div key={art.id} className="admin-article-card" style={{ padding: "16px", borderRadius: "10px", background: "#fff", border: "1px solid var(--color-steel-200)", marginBottom: "12px" }}>
                {/* Thumbnail Cover */}
                {art.thumbnailUrl && (
                  <div style={{ width: "100%", height: "140px", borderRadius: "8px", overflow: "hidden", marginBottom: "10px", background: "#111827" }}>
                    <img src={art.thumbnailUrl} alt={art.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}

                {/* Title */}
                <h3 className="admin-article-card__title" style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--color-charcoal-900)" }}>
                  {art.title}
                </h3>

                {/* Description */}
                {art.description && (
                  <p style={{ margin: "0 0 10px", fontSize: "12.5px", color: "var(--color-steel-700)", lineHeight: 1.4 }}>
                    {art.description}
                  </p>
                )}

                {/* Link */}
                <div style={{ marginBottom: "12px" }}>
                  <a
                    href={articleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", color: "#2563EB", textDecoration: "underline", wordBreak: "break-all" }}
                  >
                    {articleLink} ↗
                  </a>
                </div>

                {/* Actions */}
                {onDeleteArticle && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {confirmDeleteId === art.id ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#B91C1C", fontWeight: "bold" }}>Delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteArticle(art.id);
                            setConfirmDeleteId(null);
                          }}
                          className="admin-table__action-btn admin-table__action-btn--danger-confirm"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="admin-table__action-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(art.id)}
                        className="admin-table__action-btn admin-table__action-btn--danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
export default AdminArticlesList;
