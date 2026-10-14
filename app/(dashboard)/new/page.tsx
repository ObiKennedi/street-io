import type { Metadata } from "next";
import { NewArticlesFeed } from "@/component/dashboard";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { exploreCategories } from "@/component/dashboard/categories.config";
import { ARTICLES_DATABASE, addArticle, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Latest Releases · streetio",
  description: "Browse the latest uploaded articles, field playbooks, and operational guides on Street IO.",
};

export const instant = false;

export default async function NewPage() {
  await requireSession("/new");

  let initialArticles: Article[] = [...ARTICLES_DATABASE];

  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    if (dbArticles.length > 0) {
      const mapped: Article[] = dbArticles.map((a) => {
        const formattedPrice = `₦${a.price.toLocaleString()}`;
        const catConfig = exploreCategories.find((c) => c.slug === a.categorySlug);
        const categoryLabel = catConfig
          ? catConfig.label
          : a.categorySlug
          ? a.categorySlug.toUpperCase()
          : "GENERAL";

        return {
          id: a.id,
          slug: a.slug,
          title: a.title,
          category: categoryLabel,
          categorySlug: a.categorySlug || "general",
          price: formattedPrice,
          readTime: a.readTime || "7 min read",
          description: a.description,
          content: a.content,
          contentSnippet: a.contentSnippet || a.description,
          keyTakeaways: a.keyTakeaways || [],
          tags: a.tags || [],
          weeklyReads: a.weeklyReads,
          monthlyReads: a.monthlyReads,
          totalReads: a.totalReads,
          trendingDelta: a.trendingDelta || "+100%",
          thumbnailUrl: a.coverImage || undefined,
          uploadedAt: a.createdAt.toISOString(),
        };
      });

      for (const item of mapped) {
        addArticle(item);
      }
      initialArticles = mapped;
    }
  } catch (err) {
    console.error("Prisma error fetching articles in /new:", err);
  }

  return <NewArticlesFeed initialArticles={initialArticles} />;
}
