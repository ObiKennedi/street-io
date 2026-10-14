// File: component/admin/AdminArticleUpload.tsx
"use client";

import { useRef, useState } from "react";
import { exploreCategories } from "@/component/dashboard/categories.config";
import type { AdminArticle } from "@/lib/admin-data";
import type { ArticleTool } from "@/lib/article-tools";

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

  // Cloudinary image upload states
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tools & verification links states
  type ToolDraft = {
    id: string;
    name: string;
    url: string;
    type: "Verification" | "Forensics" | "Defense" | "Regulatory" | "Intelligence" | "Security";
    description?: string;
  };
  const [toolsList, setToolsList] = useState<ToolDraft[]>([]);
  const [newToolName, setNewToolName] = useState("");
  const [newToolUrl, setNewToolUrl] = useState("");
  const [newToolType, setNewToolType] = useState<ToolDraft["type"]>("Verification");
  const [newToolDesc, setNewToolDesc] = useState("");
  const [toolSuccessNotice, setToolSuccessNotice] = useState<string | null>(null);
  const toolNameInputRef = useRef<HTMLInputElement>(null);

  const handleAddTool = () => {
    if (!newToolName.trim() || !newToolUrl.trim()) return;
    const formattedUrl =
      newToolUrl.trim().startsWith("http://") || newToolUrl.trim().startsWith("https://")
        ? newToolUrl.trim()
        : `https://${newToolUrl.trim()}`;

    const addedName = newToolName.trim();

    setToolsList((prev) => [
      ...prev,
      {
        id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: addedName,
        url: formattedUrl,
        type: newToolType,
        description: newToolDesc.trim() || undefined,
      },
    ]);
    setNewToolName("");
    setNewToolUrl("");
    setNewToolDesc("");
    setToolSuccessNotice(`✓ Tool "${addedName}" added. Click "Add More" to attach another.`);
    setTimeout(() => {
      setToolSuccessNotice(null);
    }, 4500);
    setTimeout(() => {
      toolNameInputRef.current?.focus();
    }, 60);
  };

  const handleRemoveTool = (idToRemove: string) => {
    setToolsList((prev) => prev.filter((t) => t.id !== idToRemove));
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds the 10MB limit.");
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "streetio_articles");

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.missingConfig) {
          // Cloudinary env vars not filled yet: provide local preview fallback so client isn't blocked
          const localUrl = URL.createObjectURL(file);
          setThumbnailUrl(localUrl);
          setUploadError(
            "Note: Cloudinary credentials are not set in .env yet. Using local preview. Fill in CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY in .env to save to Cloudinary cloud."
          );
        } else {
          setUploadError(data.error || "Failed to upload image to Cloudinary.");
        }
      } else if (data.url) {
        setThumbnailUrl(data.url);
      }
    } catch {
      // Local preview fallback
      const localUrl = URL.createObjectURL(file);
      setThumbnailUrl(localUrl);
      setUploadError("Network error reaching upload API. Using local image preview.");
    } finally {
      setIsUploadingImage(false);
    }
  };

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

    const finalDrafts = [...toolsList];
    if (newToolName.trim() && newToolUrl.trim()) {
      const formattedUrl =
        newToolUrl.trim().startsWith("http://") || newToolUrl.trim().startsWith("https://")
          ? newToolUrl.trim()
          : `https://${newToolUrl.trim()}`;
      finalDrafts.push({
        id: `tool-${Date.now()}`,
        name: newToolName.trim(),
        url: formattedUrl,
        type: newToolType,
        description: newToolDesc.trim() || undefined,
      });
    }

    const compiledTools: ArticleTool[] = finalDrafts.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || `${t.type} tool link for ${categoryObj.label}`,
      category: categoryObj.label,
      type: t.type,
      url: t.url,
      isExternal: true,
      badge: "Curated",
    }));

    const newArticle: AdminArticle = {
      id: `art-custom-${Date.now()}`,
      slug: slug || `article-${Date.now()}`,
      title: title.trim(),
      category: categoryObj.label,
      categorySlug: categoryObj.slug,
      price: formattedPrice,
      readTime: readTime.trim() || "7 min read",
      description: description.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      tools: compiledTools.length > 0 ? compiledTools : undefined,
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
      setThumbnailUrl("");
      setUploadError(null);
      setToolsList([]);
      setNewToolName("");
      setNewToolUrl("");
      setNewToolDesc("");
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
            Upload a specialized real-world guide, upload a Cloudinary cover thumbnail, configure paywall fee in Nigerian Naira (₦), and publish immediately to reader feeds.
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

          {/* Article Cover Thumbnail (Cloudinary) */}
          <div className="admin-form__field admin-form__field--full">
            <label className="admin-form__label">
              Article Cover Thumbnail (Cloudinary)
            </label>

            <div className="admin-thumbnail-uploader">
              {isUploadingImage ? (
                <div className="admin-thumbnail-loading">
                  <div className="admin-thumbnail-spinner" />
                  <span>Uploading thumbnail to Cloudinary...</span>
                </div>
              ) : thumbnailUrl ? (
                <div className="admin-thumbnail-preview">
                  <div className="admin-thumbnail-preview__image-wrap">
                    <img src={thumbnailUrl} alt="Cover preview" />
                  </div>
                  <div className="admin-thumbnail-preview__details">
                    <span className="admin-thumbnail-preview__badge">
                      ✓ Thumbnail Uploaded to Cloudinary
                    </span>
                    <span className="admin-thumbnail-preview__url" title={thumbnailUrl}>
                      {thumbnailUrl}
                    </span>
                    <div className="admin-thumbnail-preview__actions">
                      <button
                        type="button"
                        className="admin-thumbnail-preview__change-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        className="admin-thumbnail-preview__remove-btn"
                        onClick={() => {
                          setThumbnailUrl("");
                          setUploadError(null);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`admin-thumbnail-dropzone ${isDragOver ? "admin-thumbnail-dropzone--dragover" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="admin-thumbnail-dropzone__icon">🖼️</div>
                  <div className="admin-thumbnail-dropzone__title">
                    Upload Article Thumbnail
                  </div>
                  <div className="admin-thumbnail-dropzone__sub">
                    Click to browse or drag &amp; drop your cover image here (PNG, JPG, WebP up to 10MB)
                  </div>
                  <button
                    type="button"
                    className="admin-thumbnail-dropzone__btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <span>Choose Image (Cloudinary)</span>
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="admin-thumbnail-dropzone__file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  e.target.value = "";
                }}
              />

              {uploadError && (
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}>
                  <span>⚠️ {uploadError}</span>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#B91C1C",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "0 4px",
                    }}
                    onClick={() => setUploadError(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Optional URL manual override */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="admin-form__hint">
                  Or paste direct image URL:
                </span>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => {
                    setThumbnailUrl(e.target.value);
                    setUploadError(null);
                  }}
                  className="admin-form__input"
                  style={{ flex: 1, height: "34px", fontSize: "12px", padding: "4px 8px" }}
                />
              </div>
            </div>
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

          {/* Operational Tools / Links to the Tools Space */}
          <div className="admin-form__field admin-form__field--full">
            <div className="admin-tools-manager">
              <div className="admin-tools-manager__header">
                <span className="admin-tools-manager__title">
                  🛠️ Operational Field Tools &amp; Verification Links
                </span>
                <p className="admin-tools-manager__desc">
                  Curate links to field verification utilities, forensic tools, lookup portals, or registries for this task. These links are prominently displayed in the reader&apos;s playbook footer.
                </p>
              </div>

              {toolSuccessNotice && (
                <div className="admin-tools-manager__added-pill" role="status">
                  <span>{toolSuccessNotice}</span>
                </div>
              )}

              {toolsList.length > 0 && (
                <div className="admin-tools-manager__list">
                  <div className="admin-tools-manager__list-header">
                    <span className="admin-tools-manager__list-count">
                      Attached Task Tools ({toolsList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        toolNameInputRef.current?.focus();
                        toolNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="admin-tools-manager__add-more-link-btn"
                    >
                      + Add More
                    </button>
                  </div>

                  {toolsList.map((tool) => (
                    <div key={tool.id} className="admin-tools-manager__item">
                      <div className="admin-tools-manager__item-left">
                        <div className="admin-tools-manager__item-title-row">
                          <span className="admin-tools-manager__item-name">{tool.name}</span>
                          <span className="admin-tools-manager__item-badge">{tool.type}</span>
                        </div>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-tools-manager__item-url"
                        >
                          {tool.url} ↗
                        </a>
                        {tool.description && (
                          <span className="admin-tools-manager__item-desc">{tool.description}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool.id)}
                        className="admin-tools-manager__item-del-btn"
                        title="Remove tool link"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Explicit Add More button right after adding links */}
                  <button
                    type="button"
                    onClick={() => {
                      toolNameInputRef.current?.focus();
                      toolNameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="admin-tools-manager__add-more-btn"
                  >
                    <span aria-hidden="true">+</span>
                    <span>Add More Tools</span>
                  </button>
                </div>
              )}

              <div className="admin-tools-manager__add-box">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--dash-text)" }}>
                    {toolsList.length > 0 ? "Attach Another Tool Link" : "Add Tool Link"}
                  </span>
                  {toolsList.length > 0 && (
                    <span style={{ fontSize: "11px", color: "var(--color-steel-600)" }}>
                      Step: Multi-tool task support
                    </span>
                  )}
                </div>

                <div className="admin-tools-manager__inputs-row">
                  <div>
                    <label className="admin-form__label" style={{ fontSize: "10px" }}>Tool Name</label>
                    <input
                      ref={toolNameInputRef}
                      type="text"
                      placeholder="e.g. NumVerify, TinEye, ExifTool"
                      value={newToolName}
                      onChange={(e) => setNewToolName(e.target.value)}
                      className="admin-form__input"
                      style={{ height: "38px", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label className="admin-form__label" style={{ fontSize: "10px" }}>Tool Link / URL</label>
                    <input
                      type="url"
                      placeholder="https://numverify.com"
                      value={newToolUrl}
                      onChange={(e) => setNewToolUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTool();
                        }
                      }}
                      className="admin-form__input"
                      style={{ height: "38px", fontSize: "13px" }}
                    />
                  </div>
                  <div>
                    <label className="admin-form__label" style={{ fontSize: "10px" }}>Classification</label>
                    <select
                      value={newToolType}
                      onChange={(e) => setNewToolType(e.target.value as any)}
                      className="admin-form__select"
                      style={{ height: "38px", fontSize: "13px" }}
                    >
                      <option value="Verification">Verification</option>
                      <option value="Forensics">Forensics</option>
                      <option value="Defense">Defense</option>
                      <option value="Intelligence">Intelligence</option>
                      <option value="Security">Security</option>
                      <option value="Regulatory">Regulatory</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="admin-form__label" style={{ fontSize: "10px" }}>Tool Purpose / Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Short description of what the user executes with this tool"
                    value={newToolDesc}
                    onChange={(e) => setNewToolDesc(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTool();
                      }
                    }}
                    className="admin-form__input"
                    style={{ height: "38px", fontSize: "13px" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleAddTool}
                    disabled={!newToolName.trim() || !newToolUrl.trim()}
                    className="admin-tools-manager__add-btn"
                    style={{ opacity: !newToolName.trim() || !newToolUrl.trim() ? 0.5 : 1 }}
                  >
                    {toolsList.length > 0 ? "+ Add More Tool" : "+ Add Tool Link"}
                  </button>
                  {toolsList.length > 0 && (
                    <span style={{ fontSize: "11px", color: "var(--color-steel-600)" }}>
                      {toolsList.length} {toolsList.length === 1 ? "tool" : "tools"} attached to this task
                    </span>
                  )}
                </div>
              </div>
            </div>
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
