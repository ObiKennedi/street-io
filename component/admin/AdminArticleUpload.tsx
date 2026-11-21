// File: component/admin/AdminArticleUpload.tsx
"use client";

import { useRef, useState } from "react";
import type { AdminArticle } from "@/lib/admin-data";
import { exploreCategories } from "@/component/dashboard/categories.config";

type AdminArticleUploadProps = {
  onArticleCreated: (newArticle: AdminArticle) => void;
  onCancel?: () => void;
};

export function AdminArticleUpload({
  onArticleCreated,
  onCancel,
}: AdminArticleUploadProps) {
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("make-money-online");
  const [price, setPrice] = useState("3500");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [content, setContent] = useState("");

  // Tool link details
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [contentTab, setContentTab] = useState<"edit" | "preview">("edit");
  const [fileUploadNotice, setFileUploadNotice] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Cloudinary image upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleDocumentFile = (file: File) => {
    if (
      !file.name.endsWith(".md") &&
      !file.name.endsWith(".txt") &&
      file.type !== "text/plain" &&
      file.type !== "text/markdown"
    ) {
      setUploadError("Please upload a text or Markdown file (.md, .txt).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || "";
      if (text) {
        setContent(text);
        if (!title.trim()) {
          const headingMatch = text.match(/^#\s+(.+)$/m) || text.match(/^##\s+(.+)$/m);
          if (headingMatch) setTitle(headingMatch[1].trim());
        }
        const words = text.trim().split(/\s+/).length;
        setFileUploadNotice(`✓ Imported "${file.name}" (${words} words).`);
        setTimeout(() => setFileUploadNotice(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const insertTemplate = (snippet: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = content;
    const next = prev.substring(0, start) + snippet + prev.substring(end);
    setContent(next);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 20);
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
        setUploadError(data.error || "Failed to upload image to Cloudinary.");
      } else if (data.url) {
        setThumbnailUrl(data.url);
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      setThumbnailUrl(localUrl);
      setUploadError("Network error reaching upload API. Using local image preview.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setUploadError("Article title is required.");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setSuccessMessage("");

    // Generate slug from link or title
    const cleanLink = link.trim();
    let slug = "";
    if (cleanLink && !cleanLink.startsWith("http://") && !cleanLink.startsWith("https://")) {
      slug = cleanLink
        .replace(/^\/article\//, "")
        .replace(/^\/+/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .toLowerCase();
    }
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const finalDescription =
      description.trim() ||
      (content.trim()
        ? content.trim().replace(/^#+\s+/gm, "").replace(/\n+/g, " ").slice(0, 180).trim() + "..."
        : "");

    const formattedUrl = cleanLink
      ? cleanLink.startsWith("http://") || cleanLink.startsWith("https://")
        ? cleanLink
        : `https://${cleanLink}`
      : "";

    const finalTools: any[] = [];
    if (formattedUrl) {
      finalTools.push({
        id: `tool-${Date.now()}`,
        name: toolName.trim() || title.trim() || "Operational Tool",
        url: formattedUrl,
        type: "Verification",
        description: toolDescription.trim() || undefined,
        category: "Operational Tool",
        isExternal: true,
      });
    }

    const finalLink = formattedUrl || `/article/${slug}`;

    const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 3500;
    const formattedPrice = `₦${numericPrice.toLocaleString()}`;
    const selectedCategory =
      exploreCategories.find((c) => c.slug === categorySlug)?.label ||
      categorySlug.toUpperCase();

    const articlePayload = {
      id: `art-custom-${Date.now()}`,
      slug: slug || `article-${Date.now()}`,
      link: finalLink,
      title: title.trim(),
      category: selectedCategory,
      categorySlug: categorySlug,
      price: numericPrice,
      description: finalDescription,
      content: content.trim() || finalDescription,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      tools: finalTools,
    };

    (async () => {
      try {
        const res = await fetch("/api/article/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articlePayload),
        });

        const data = await res.json();
        const createdArticle: AdminArticle = (data && data.article) || {
          ...articlePayload,
          tools: finalTools,
          category: selectedCategory,
          categorySlug: categorySlug,
          price: formattedPrice,
          readTime: "5 min read",
          contentSnippet: finalDescription,
          keyTakeaways: finalTools.map((t) => JSON.stringify(t)),
          tags: [`link:${finalLink}`],
          weeklyReads: 140,
          monthlyReads: 620,
          totalReads: 850,
          trendingDelta: "+100%",
          soldCopies: 0,
          revenueGenerated: 0,
          status: "published",
          createdAt: new Date().toISOString().split("T")[0],
        };

        try {
          const stored = JSON.parse(localStorage.getItem("streetio_custom_articles") || "[]");
          const updated = [createdArticle, ...stored.filter((x: any) => x.slug !== createdArticle.slug)];
          localStorage.setItem("streetio_custom_articles", JSON.stringify(updated));
        } catch {}

        onArticleCreated(createdArticle);
        setIsSubmitting(false);
        setCreatedSlug(createdArticle.slug);
        setSuccessMessage(`"${createdArticle.title}" published successfully!`);

        // Reset form
        setTitle("");
        setDescription("");
        setCategorySlug("make-money-online");
        setPrice("3500");
        setLink("");
        setToolName("");
        setToolDescription("");
        setContent("");
        setThumbnailUrl("");
        setUploadError(null);
      } catch (err) {
        console.error("Publish error:", err);
        const fallbackArticle: AdminArticle = {
          ...articlePayload,
          tools: finalTools,
          category: selectedCategory,
          categorySlug: categorySlug,
          price: formattedPrice,
          readTime: "5 min read",
          contentSnippet: finalDescription,
          keyTakeaways: finalTools.map((t) => JSON.stringify(t)),
          tags: [`link:${finalLink}`],
          weeklyReads: 140,
          monthlyReads: 620,
          totalReads: 850,
          trendingDelta: "+100%",
          soldCopies: 0,
          revenueGenerated: 0,
          status: "published",
          createdAt: new Date().toISOString().split("T")[0],
        };

        try {
          const stored = JSON.parse(localStorage.getItem("streetio_custom_articles") || "[]");
          const updated = [fallbackArticle, ...stored.filter((x: any) => x.slug !== fallbackArticle.slug)];
          localStorage.setItem("streetio_custom_articles", JSON.stringify(updated));
        } catch {}

        onArticleCreated(fallbackArticle);
        setIsSubmitting(false);
        setCreatedSlug(fallbackArticle.slug);
        setSuccessMessage(`"${fallbackArticle.title}" published successfully!`);
      }
    })();
  };

  return (
    <section className="admin-box" aria-labelledby="upload-article-title">
      <div className="admin-box__head">
        <div>
          <h2 id="upload-article-title" className="admin-box__title">
            Publish New Article
          </h2>
          <p className="admin-box__desc">
            Provide the article title, description, link, thumbnail, and content to publish immediately.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="admin-upload-success-card" role="status">
          <span>✓ {successMessage}</span>
          {createdSlug && (
            <a
              href={`/article/${createdSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-upload-success-link"
            >
              Open Published Article ↗
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form__grid">
          {/* Article Title */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-title" className="admin-form__label">
              Article *
            </label>
            <input
              id="art-title"
              type="text"
              required
              placeholder="e.g. How to Repair Alternators at Home"
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

          {/* Price */}
          <div className="admin-form__field">
            <label htmlFor="art-price" className="admin-form__label">
              Price (₦) *
            </label>
            <input
              id="art-price"
              type="text"
              inputMode="numeric"
              required
              placeholder="3500"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              className="admin-form__input"
            />
            <span className="admin-form__hint">
              Access fee in Naira (e.g. 3500).
            </span>
          </div>

          {/* Description */}
          <div className="admin-form__field admin-form__field--full">
            <label htmlFor="art-description" className="admin-form__label">
              Description *
            </label>
            <textarea
              id="art-description"
              rows={3}
              required
              placeholder="Enter a brief, actionable summary of this article..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-form__textarea"
            />
          </div>

          {/* Tool / Resource Link */}
          <div className="admin-form__field admin-form__field--full">
            <label className="admin-form__label">
              Tool Link (Optional)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <input
                type="url"
                placeholder="Link URL (e.g. https://...)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="admin-form__input"
              />
              <input
                type="text"
                placeholder="Tool Name (e.g. Figma, Canva)"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="admin-form__input"
              />
            </div>
            <input
              type="text"
              placeholder="Very small description or note (optional)"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              className="admin-form__input"
              style={{ fontSize: "13px" }}
            />
            <span className="admin-form__hint">
              Enter the tool link, its name, and an optional small description. It will appear at the top of the article.
            </span>
          </div>

          {/* Cover Thumbnail */}
          <div className="admin-form__field admin-form__field--full">
            <label className="admin-form__label">
              Thumbnail
            </label>

            <div className="admin-thumbnail-uploader">
              {isUploadingImage ? (
                <div className="admin-thumbnail-loading">
                  <div className="admin-thumbnail-spinner" />
                  <span>Uploading thumbnail...</span>
                </div>
              ) : thumbnailUrl ? (
                <div className="admin-thumbnail-preview">
                  <div className="admin-thumbnail-preview__image-wrap">
                    <img src={thumbnailUrl} alt="Cover preview" />
                  </div>
                  <div className="admin-thumbnail-preview__details">
                    <span className="admin-thumbnail-preview__badge">
                      ✓ Thumbnail Ready
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
                    Click to browse or drag &amp; drop cover image here (PNG, JPG, WebP)
                  </div>
                  <button
                    type="button"
                    className="admin-thumbnail-dropzone__btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <span>Choose Image</span>
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
                  marginTop: "8px",
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

              {/* Direct image URL */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span className="admin-form__hint">
                  Or paste thumbnail image URL:
                </span>
                <input
                  type="url"
                  placeholder="https://..."
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

          {/* Full Article Content */}
          <div className="admin-form__field admin-form__field--full">
            <div className="admin-article-editor">
              <div className="admin-article-editor__header">
                <div className="admin-article-editor__title-group">
                  <span className="admin-article-editor__title">
                    📖 Article Content
                  </span>
                  <p className="admin-article-editor__desc">
                    Write or paste your article text. Supports Markdown formatting or upload of .md / .txt files.
                  </p>
                </div>

                <div className="admin-article-editor__header-actions">
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="admin-article-editor__file-import-btn"
                    title="Upload markdown (.md) or text (.txt) file"
                  >
                    <span>📄</span>
                    <span>Upload .md / .txt File</span>
                  </button>
                  <input
                    ref={docInputRef}
                    type="file"
                    accept=".md,.txt,text/plain,text/markdown"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentFile(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>

              {fileUploadNotice && (
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}>
                  {fileUploadNotice}
                </div>
              )}

              {/* Formatting Toolbar */}
              <div className="admin-article-editor__toolbar">
                <div className="admin-article-editor__toolbar-group">
                  <button
                    type="button"
                    onClick={() => insertTemplate("\n\n## Section Heading\n")}
                    className="admin-article-editor__tool-btn"
                    title="Insert Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("\n\n### Sub-heading\n")}
                    className="admin-article-editor__tool-btn"
                    title="Insert Heading 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("**Bold Text**")}
                    className="admin-article-editor__tool-btn"
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                </div>

                <div className="admin-article-editor__toolbar-divider" />

                <div className="admin-article-editor__toolbar-group">
                  <button
                    type="button"
                    onClick={() => insertTemplate("\n- Point 1\n- Point 2\n")}
                    className="admin-article-editor__tool-btn"
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("\n1. Step 1\n2. Step 2\n")}
                    className="admin-article-editor__tool-btn"
                    title="Numbered Steps"
                  >
                    1. Steps
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate("\n> Important note or mandate.\n")}
                    className="admin-article-editor__tool-btn"
                    title="Callout Box"
                  >
                    &gt; Callout
                  </button>
                </div>

                <div className="admin-article-editor__tabs">
                  <button
                    type="button"
                    onClick={() => setContentTab("edit")}
                    className={`admin-article-editor__tab ${contentTab === "edit" ? "admin-article-editor__tab--active" : ""}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    className={`admin-article-editor__tab ${contentTab === "preview" ? "admin-article-editor__tab--active" : ""}`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {contentTab === "edit" ? (
                <textarea
                  ref={contentTextareaRef}
                  id="art-content"
                  rows={12}
                  placeholder="Write or paste your article content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="admin-article-editor__textarea"
                />
              ) : (
                <div className="admin-article-editor__preview-box">
                  <div className="article-unlocked-body__content">
                    {content.trim() ? (
                      content.split("\n\n").map((block, idx) => {
                        const trimmed = block.trim();
                        if (trimmed.startsWith("### ")) {
                          return <h3 key={idx}>{trimmed.slice(4)}</h3>;
                        } else if (trimmed.startsWith("## ")) {
                          return <h2 key={idx}>{trimmed.slice(3)}</h2>;
                        } else if (trimmed.startsWith("# ")) {
                          return <h2 key={idx}>{trimmed.slice(2)}</h2>;
                        } else if (trimmed.startsWith("> ")) {
                          return (
                            <div key={idx} className="article-unlocked-body__callout">
                              {trimmed.slice(2)}
                            </div>
                          );
                        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                          const items = trimmed.split("\n").map((l) => l.replace(/^[-*]\s*/, ""));
                          return (
                            <ul key={idx}>
                              {items.map((it, i) => (
                                <li key={i}>{it}</li>
                              ))}
                            </ul>
                          );
                        } else if (/^\d+\.\s+/.test(trimmed)) {
                          const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s*/, ""));
                          return (
                            <ol key={idx}>
                              {items.map((it, i) => (
                                <li key={i}>{it}</li>
                              ))}
                            </ol>
                          );
                        }
                        return <p key={idx}>{trimmed}</p>;
                      })
                    ) : (
                      <p style={{ color: "var(--color-steel-500)", fontStyle: "italic" }}>
                        No content entered yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="admin-article-editor__footer">
                <div className="admin-article-editor__stats">
                  <span>{wordCount} words</span>
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
            {isSubmitting ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </section>
  );
}
