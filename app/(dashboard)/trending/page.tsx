// File: app/(dashboard)/trending/page.tsx
import type { Metadata } from "next";
import { TrendingFeed } from "@/component/dashboard";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { exploreCategories } from "@/component/dashboard/categories.config";
import { addArticle, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Trending Intelligence · streetio",
  description: "Explore the most read operational guides and practical playbooks on Street IO with weekly and monthly filters.",
};

export const instant = false;

export default async function TrendingPage() {
  await requireSession("/trending");

  // Seed in-memory database with DB articles so TrendingFeed has data on first render
  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { weeklyReads: "desc" },
      take: 30,
    });

    for (const a of dbArticles) {
      const catConfig = exploreCategories.find((c) => c.slug === a.categorySlug);
      const categoryLabel = catConfig
        ? catConfig.label
        : a.categorySlug
        ? a.categorySlug.toUpperCase()
        : "GENERAL";

      const article: Article = {
        id: a.id,
        slug: a.slug,
        title: a.title,
        link: `/article/${a.slug}`,
        category: categoryLabel,
        categorySlug: a.categorySlug || "general",
        price: `₦${a.price.toLocaleString()}`,
        readTime: a.readTime || "7 min read",
        description: a.description,
        content: a.content,
        contentSnippet: a.contentSnippet || a.description,
        thumbnailUrl: a.coverImage || undefined,
        weeklyReads: a.weeklyReads,
        monthlyReads: a.monthlyReads,
        totalReads: a.totalReads,
        trendingDelta: a.trendingDelta || "+100%",
        uploadedAt: a.createdAt.toISOString(),
      };
      addArticle(article);
    }
  } catch (err) {
    console.error("Prisma error seeding trending articles:", err);
  }

  return <TrendingFeed />;
}
