// File: lib/articles.ts
import { exploreCategories, type DashboardCategory } from "@/component/dashboard/categories.config";
import type { ArticleTool } from "@/lib/article-tools";

export type Article = {
  id: string;
  slug: string;
  title: string;
  description: string;
  link?: string;
  thumbnailUrl?: string;
  content?: string;
  // Optional / backwards-compatibility
  category?: string;
  categorySlug?: string;
  price?: string;
  isUnlocked?: boolean;
  readTime?: string;
  contentSnippet?: string;
  keyTakeaways?: string[];
  tags?: string[];
  weeklyReads?: number;
  monthlyReads?: number;
  totalReads?: number;
  trendingDelta?: string;
  uploadedAt?: string;
  tools?: ArticleTool[];
};

export type TrendingTimeframe = "weekly" | "monthly";

export type TrendingArticle = Article & {
  rank: number;
  currentReads: number;
};

// All test articles deleted - fresh database ready for real operational publications
export const ARTICLES_DATABASE: Article[] = [];

export function addArticle(article: Article): void {
  const clean = (article.id || article.slug).trim().toLowerCase();
  const index = ARTICLES_DATABASE.findIndex(
    (a) => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean
  );
  if (index !== -1) {
    ARTICLES_DATABASE[index] = article;
  } else {
    ARTICLES_DATABASE.unshift(article);
  }
}

export function getTrendingArticles(timeframe: TrendingTimeframe = "weekly"): TrendingArticle[] {
  const sorted = [...ARTICLES_DATABASE].sort((a, b) => {
    const readsA = (timeframe === "weekly" ? a.weeklyReads : a.monthlyReads) ?? 0;
    const readsB = (timeframe === "weekly" ? b.weeklyReads : b.monthlyReads) ?? 0;
    return readsB - readsA;
  });

  return sorted.map((article, index) => ({
    ...article,
    rank: index + 1,
    currentReads: (timeframe === "weekly" ? article.weeklyReads : article.monthlyReads) ?? 0,
  }));
}

export function getLatestArticles(): (Article & { uploadTag: string })[] {
  const timestamps = [
    "Uploaded 2 hours ago",
    "Uploaded 5 hours ago",
    "Uploaded today",
    "Uploaded yesterday",
    "Uploaded 2 days ago",
    "Uploaded 3 days ago",
    "Uploaded this week",
    "Uploaded this week",
    "Uploaded last week",
    "Uploaded last week",
  ];

  return [...ARTICLES_DATABASE].slice(0, 16).map((article, idx) => ({
    ...article,
    uploadTag: timestamps[idx % timestamps.length],
  }));
}

export function getArticleBySlug(slug: string): Article | undefined {
  const clean = slug.trim().toLowerCase();
  return ARTICLES_DATABASE.find(
    (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  const clean = categorySlug.trim().toLowerCase();
  const aliasMap: Record<string, string[]> = {
    "make-money-online": ["make-money-online", "e-commerce-info"],
    "business": ["business", "e-commerce-info", "billing-strategy-scope"],
    "sales-and-getting-clients": ["sales-and-getting-clients", "billing-strategy-scope"],
    "jobs-and-career": ["jobs-and-career", "employment-info"],
    "digital-skills": ["digital-skills", "web-development"],
    "content-creation": ["content-creation", "tiktok-info"],
    "ai-and-technology": ["ai-and-technology"],
    "investing-and-personal-finance": ["investing-and-personal-finance", "investment-info"],
  };

  const allowedSlugs = aliasMap[clean] || [clean];
  return ARTICLES_DATABASE.filter((a) =>
    allowedSlugs.includes((a.categorySlug || "").toLowerCase())
  );
}

export function deleteArticle(articleIdOrSlug: string): boolean {
  const clean = articleIdOrSlug.trim().toLowerCase();
  const index = ARTICLES_DATABASE.findIndex(
    (a) => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean
  );
  if (index !== -1) {
    ARTICLES_DATABASE.splice(index, 1);
    return true;
  }
  return false;
}

export function getCategoryBySlug(slug: string): DashboardCategory | undefined {
  const clean = slug.trim().toLowerCase();
  const found = exploreCategories.find((c) => c.slug.toLowerCase() === clean);
  if (found) return found;

  const aliases: Record<string, string> = {
    "billing-strategy-scope": "sales-and-getting-clients",
    "investment-info": "investing-and-personal-finance",
    "web-development": "digital-skills",
    "employment-info": "jobs-and-career",
    "e-commerce-info": "business",
  };
  const targetSlug = aliases[clean];
  if (targetSlug) {
    return exploreCategories.find((c) => c.slug.toLowerCase() === targetSlug);
  }

  return undefined;
}

export function searchArticles(query: string): Article[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter((t) => t.length > 1);

  return ARTICLES_DATABASE.map((article) => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    const snippetLower = (article.contentSnippet || "").toLowerCase();
    const catLower = (article.category || "").toLowerCase();
    const tagsLower = (article.tags || []).map((t) => t.toLowerCase());

    // Full match bonuses
    if (titleLower.includes(clean)) score += 15;
    if (catLower.includes(clean)) score += 12;
    if (descLower.includes(clean)) score += 8;
    if (snippetLower.includes(clean)) score += 6;

    // Token matches
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 5;
      if (catLower.includes(token)) score += 4;
      if (tagsLower.some((t) => t.includes(token))) score += 4;
      if (descLower.includes(token)) score += 2;
      if (snippetLower.includes(token)) score += 1;
    }

    return { article, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article);
}

export function mapDbArticleToArticle(a: any): Article {
  const formattedPrice =
    typeof a.price === "number"
      ? `₦${a.price.toLocaleString()}`
      : String(a.price || "₦3,500");

  const catConfig = exploreCategories.find(
    (c) => c.slug.toLowerCase() === (a.categorySlug || "").toLowerCase()
  );
  const categoryLabel = catConfig
    ? catConfig.label
    : a.categorySlug
    ? a.categorySlug.replace(/-/g, " ").toUpperCase()
    : "GENERAL";

  const parsedTools: ArticleTool[] = [];
  if (Array.isArray(a.keyTakeaways)) {
    for (const item of a.keyTakeaways) {
      try {
        if (typeof item === "string" && item.startsWith("{") && item.includes('"url"')) {
          const parsed = JSON.parse(item);
          if (parsed && parsed.url) parsedTools.push(parsed);
        }
      } catch {}
    }
  }

  let articleLink: string | undefined = undefined;
  if (Array.isArray(a.tags)) {
    const linkTag = a.tags.find((t: string) => typeof t === "string" && t.startsWith("link:"));
    if (linkTag) {
      articleLink = linkTag.replace(/^link:/, "");
    }
  }
  if (!articleLink && parsedTools.length > 0) {
    articleLink = parsedTools[0].url;
  }

  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description || "",
    link: articleLink,
    thumbnailUrl: a.coverImage || undefined,
    tools: parsedTools.length > 0 ? parsedTools : undefined,
    category: categoryLabel,
    categorySlug: a.categorySlug || "general",
    price: formattedPrice,
    readTime: a.readTime || "7 min read",
    content: a.content,
    contentSnippet: a.contentSnippet || a.description || "",
    keyTakeaways: a.keyTakeaways || [],
    tags: a.tags || [],
    weeklyReads: a.weeklyReads,
    monthlyReads: a.monthlyReads,
    totalReads: a.totalReads,
    trendingDelta: a.trendingDelta || "+100%",
    uploadedAt:
      a.createdAt instanceof Date
        ? a.createdAt.toISOString()
        : typeof a.createdAt === "string"
        ? a.createdAt
        : undefined,
  };
}

