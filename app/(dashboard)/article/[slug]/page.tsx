// File: app/(dashboard)/article/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ARTICLES_DATABASE, getArticleBySlug, addArticle, type Article } from "@/lib/articles";
import { getToolsForArticle } from "@/lib/article-tools";
import { isArticleUnlockedForUser, getUserWalletBalance } from "@/lib/paga";
import { ArticleDetailView } from "@/component/dashboard/ArticleDetailView";
import { prisma } from "@/lib/prisma";
import { exploreCategories } from "@/component/dashboard/categories.config";

type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

async function resolveArticle(slug: string): Promise<Article | undefined> {
  const clean = slug?.trim()?.toLowerCase();
  if (!clean) return undefined;

  // 1. Check in-memory database first
  const memoryFound = ARTICLES_DATABASE?.find(
    (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
  if (memoryFound) return memoryFound;

  if (typeof getArticleBySlug === "function") {
    try {
      const found = getArticleBySlug(slug);
      if (found) return found;
    } catch {}
  }

  // 2. Query Prisma database directly so published articles resolve reliably on the server
  try {
    const dbArticle = await prisma.article.findFirst({
      where: {
        OR: [
          { slug: clean },
          { id: clean },
          { slug: slug },
          { id: slug },
        ],
      },
    });

    if (dbArticle) {
      const formattedPrice =
        typeof dbArticle.price === "number"
          ? `₦${dbArticle.price.toLocaleString()}`
          : String(dbArticle.price);

      const catConfig = exploreCategories.find((c) => c.slug === dbArticle.categorySlug);
      const categoryLabel = catConfig
        ? catConfig.label
        : dbArticle.categorySlug
        ? dbArticle.categorySlug.toUpperCase()
        : "GENERAL";

      const articleObj: Article = {
        id: dbArticle.id,
        slug: dbArticle.slug,
        title: dbArticle.title,
        category: categoryLabel,
        categorySlug: dbArticle.categorySlug || "general",
        price: formattedPrice,
        readTime: dbArticle.readTime || "7 min read",
        description: dbArticle.description,
        content: dbArticle.content,
        contentSnippet: dbArticle.contentSnippet || dbArticle.description,
        keyTakeaways: dbArticle.keyTakeaways || [],
        tags: dbArticle.tags || [],
        weeklyReads: dbArticle.weeklyReads || 0,
        monthlyReads: dbArticle.monthlyReads || 0,
        totalReads: dbArticle.totalReads || 0,
        trendingDelta: dbArticle.trendingDelta || "+100%",
        thumbnailUrl: dbArticle.coverImage || undefined,
        tools: undefined,
      };

      addArticle(articleObj);
      return articleObj;
    }
  } catch (err) {
    console.error("Prisma error in resolveArticle:", err);
  }

  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found · streetio",
    };
  }

  return {
    title: `${article.title} · streetio`,
    description: article.description,
  };
}

export default async function ArticleMicroPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  const article = await resolveArticle(slug);
  if (!article) {
    notFound();
  }

  const tools =
    article.tools && article.tools.length > 0
      ? article.tools
      : getToolsForArticle(article.categorySlug);
  const isUnlocked = session?.user?.id
    ? isArticleUnlockedForUser(session.user.id, article.slug)
    : false;
  const walletBalance = session?.user?.id
    ? getUserWalletBalance(session.user.id)
    : 0;

  return (
    <ArticleDetailView
      article={article}
      tools={tools}
      initialIsUnlocked={isUnlocked}
      userWalletBalance={walletBalance}
    />
  );
}
