// File: app/api/article/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ARTICLES_DATABASE } from "@/lib/articles";
import { INITIAL_ADMIN_ARTICLES, type AdminArticle } from "@/lib/admin-data";
import { exploreCategories } from "@/component/dashboard/categories.config";

export async function GET() {
  try {
    const dbArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });

    const articles: AdminArticle[] = dbArticles.map((a) => {
      const formattedPrice = `₦${a.price.toLocaleString()}`;
      const catConfig = exploreCategories.find((c) => c.slug === a.categorySlug);
      const categoryLabel = catConfig ? catConfig.label : a.categorySlug ? a.categorySlug.toUpperCase() : "GENERAL";

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
        soldCopies: a.soldCopies,
        revenueGenerated: a.revenueGenerated,
        status: (a.status as any) || "published",
        createdAt: a.createdAt.toISOString().split("T")[0],
      };
    });

    // Populate in-memory database runtime
    for (const art of articles) {
      if (!ARTICLES_DATABASE.some((x) => x.slug === art.slug || x.id === art.id)) {
        ARTICLES_DATABASE.push(art);
      }
      if (!INITIAL_ADMIN_ARTICLES.some((x) => x.slug === art.slug || x.id === art.id)) {
        INITIAL_ADMIN_ARTICLES.push(art);
      }
    }

    return NextResponse.json({
      success: true,
      articles: articles.length > 0 ? articles : INITIAL_ADMIN_ARTICLES,
    });
  } catch (err) {
    console.error("Error fetching articles list from DB:", err);
    return NextResponse.json({
      success: true,
      articles: INITIAL_ADMIN_ARTICLES,
    });
  }
}
