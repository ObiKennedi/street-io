// File: component/admin/AdminArticleUpload.tsx
"use client";

import { useState } from "react";
import { exploreCategories } from "@/component/dashboard/categories.config";
import type { AdminArticle } from "@/lib/admin-data";

type AdminArticleUploadProps = {
  onArticleCreated: (newArticle: AdminArticle) => void;
  onCancel?: () => void;
};

export function AdminArticleUpload({
  onArticleCreated,
  onCancel,
}: AdminArticleUploadProps) {
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(exploreCategories[0]?.slug || "dating");
  const [priceNaira, setPriceNaira] = useState("4500");
  const [readTime, setReadTime] = useState("8 min read");
  const [description, setDescription] = useState("");
  const [contentSnippet, setContentSnippet] = useState("");
  const [keyTakeawaysText, setKeyTakeawaysText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const categoryObj = exploreCategories.find((c) => c.slug === categorySlug) || exploreCategories[0];
    const numericPrice = parseInt(priceNaira.replace(/[^0-9]/g, ""), 10) || 3500;
    const formattedPrice = `₦${numericPrice.toLocaleString()}`;

    const takeaways = keyTakeawaysText
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newArticle: AdminArticle = {
      id: `art-custom-${Date.now()}`,
      slug: slug || `article-${Date.now()}`,
      title: title.trim(),
      category: categoryObj.label,
      categorySlug: categoryObj.slug,
      price: formattedPrice,
      readTime: readTime.trim() || "7 min read",
      description: description.trim(),
      contentSnippet:
        contentSnippet.trim() ||
        "Confidential operational brief detailing tradecraft protocols and countermeasures.",
      keyTakeaways:
        takeaways.length > 0
          ? takeaways
          : [
              "Standard operating procedure checklist for risk verification.",
              "Mandatory dual-authorization protocols to mitigate wire exposure.",
              "Immediate containment steps in case of credential leak.",
            ],
      tags: tags.length > 0 ? tags : [categoryObj.slug, "operational guide", "tradecraft"],
      weeklyReads: 140,
      monthlyReads: 620,
      totalReads: 850,
      trendingDelta: "+100%",
      soldCopies: 0,
      revenueGenerated: 0,
      status: "published",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTimeout(() => {
      onArticleCreated(newArticle);
      setIsSubmitting(false);
      setSuccessMessage(`"${newArticle.title}" published successfully at ${formattedPrice}!`);

      // Reset form
      setTitle("");
      setDescription("");
      setContentSnippet("");
      setKeyTakeawaysText("");
      setTagsText("");
      setPriceNaira("4500");
    }, 400);
  };

  return (
    <section className="admin-box" aria-labelledby="upload-article-title">
      <div className="admin-box__head">
        <div>
          <h2 id="upload-article-title" className="admin-box__title">
            Publish New Intelligence Article
          </h2>
          <p className="admin-box__desc">
            Upload a specialized real-world guide, configure paywall fee in Nigerian Naira (₦), and publish immediately to reader feeds.
          </p>
        </div>
      </div>

      {successMessage && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          color: "#065F46",
          fontSize: "13px",
          fontWeight: 600,
        }}>
          ✓ {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__grid">
          {/* Title */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-title" className="admin-form__label">
              Article Title *
            </label>
            <input
              id="art-title"
              type="text"
              required
              placeholder="e.g. Cross-Border FX Arbitrage: Risk Mitigation & Dual-Escrow Protocols"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-form__input"
            />
          </div>

          {/* Category */}
          <div className="admin-form__field">
            <label htmlFor="art-category" className="admin-form__label">
              Category *
            </label>
            <select
              id="art-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="admin-form__select"
            >
              {exploreCategories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price in Naira */}
          <div className="admin-form__field">
            <label htmlFor="art-price" className="admin-form__label">
              Unlock Fee (Nigerian Naira ₦) *
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "var(--font-mono)",
                fontWeight: "bold",
                color: "var(--color-steel-600)",
              }}>
                ₦
              </span>
              <input
                id="art-price"
                type="number"
                min="500"
                step="500"
                required
                style={{ paddingLeft: "32px" }}
                placeholder="4500"
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                className="admin-form__input"
              />
            </div>
            <span className="admin-form__hint">
              Paid by readers via direct Paga gateway integration.
            </span>
          </div>

          {/* Read Time */}
          <div className="admin-form__field">
            <label htmlFor="art-readtime" className="admin-form__label">
              Estimated Read Time
            </label>
            <input
              id="art-readtime"
              type="text"
              placeholder="8 min read"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="admin-form__input"
            />
          </div>

          {/* Tags */}
          <div className="admin-form__field">
            <label htmlFor="art-tags" className="admin-form__label">
              Tags (comma separated)
            </label>
            <input
              id="art-tags"
              type="text"
              placeholder="escrow, fraud defense, tradecraft, wire security"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="admin-form__input"
            />
          </div>

          {/* Description */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-desc" className="admin-form__label">
              Executive Description / Abstract *
            </label>
            <textarea
              id="art-desc"
              required
              rows={3}
              placeholder="A comprehensive breakdown of covert settlement networks, fake confirmation slip detection, and bank manager collusion."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-form__textarea"
            />
          </div>

          {/* Paywall Preview Snippet */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-snippet" className="admin-form__label">
              Paywall Content Snippet (Preview quote visible to readers)
            </label>
            <textarea
              id="art-snippet"
              rows={3}
              placeholder="Crucial excerpt that hooks the reader before the paywall barrier..."
              value={contentSnippet}
              onChange={(e) => setContentSnippet(e.target.value)}
              className="admin-form__textarea"
            />
          </div>

          {/* Key Takeaways */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-takeaways" className="admin-form__label">
              Key Operational Takeaways (One per line)
            </label>
            <textarea
              id="art-takeaways"
              rows={3}
              placeholder="Always verify routing numbers with voice callbacks.&#10;Never release commodities prior to bank ledger value dating.&#10;Maintain a secondary off-grid paper audit trail."
              value={keyTakeawaysText}
              onChange={(e) => setKeyTakeawaysText(e.target.value)}
              className="admin-form__textarea"
            />
          </div>
        </div>

        <div className="admin-form__actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="admin-form__cancel-btn"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-form__submit-btn"
          >
            {isSubmitting ? "Publishing to Network..." : "Publish Article to Readers"}
          </button>
        </div>
      </form>
    </section>
  );
}
