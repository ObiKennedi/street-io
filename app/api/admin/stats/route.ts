// File: app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAdminPlatformStats } from "@/lib/manual-payments";
import { ARTICLES_DATABASE } from "@/lib/articles";
import { INITIAL_ADMIN_ARTICLES, type AdminArticle } from "@/lib/admin-data";
import { exploreCategories } from "@/component/dashboard/categories.config";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const platformStats = await getAdminPlatformStats();

    // Reconcile articles from PostgreSQL or in-memory database
    let dbArticles: any[] = [];
    try {
      const { prisma } = await import("@/lib/prisma");
      dbArticles = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Offline fallback
    }

    const sourceArticles = dbArticles.length > 0 ? dbArticles : (ARTICLES_DATABASE.length > 0 ? ARTICLES_DATABASE : INITIAL_ADMIN_ARTICLES);

    const articles: AdminArticle[] = sourceArticles.map((a: any) => {
      const formattedPrice = typeof a.price === "number" ? `₦${a.price.toLocaleString()}` : String(a.price);
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
        content: a.content || "",
        contentSnippet: a.contentSnippet || a.description,
        keyTakeaways: a.keyTakeaways || [],
        tags: a.tags || [],
        weeklyReads: a.weeklyReads || 0,
        monthlyReads: a.monthlyReads || 0,
        totalReads: a.totalReads || 0,
        trendingDelta: a.trendingDelta || "+100%",
        thumbnailUrl: a.coverImage || a.thumbnailUrl || undefined,
        soldCopies: a.soldCopies || 0,
        revenueGenerated: a.revenueGenerated || 0,
        status: (a.status as any) || "published",
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString().split("T")[0] : (typeof a.createdAt === "string" ? a.createdAt.split("T")[0] : "2026-11-01"),
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenueNaira: platformStats.totalRevenueNaira,
        totalArticleSales: platformStats.totalArticleSales,
        averageOrderValue: platformStats.averageOrderValue,
        settledViaPaga: platformStats.settledViaPaga,
        pendingEscrow: platformStats.pendingEscrow,
        dailyRevenueDelta: platformStats.dailyRevenueDelta,
      },
      users: platformStats.users,
      articles,
      pendingSlipsCount: platformStats.pendingSlipsCount,
      totalSlipsCount: platformStats.totalSlipsCount,
    });
  } catch (error) {
    console.error("Admin stats route error:", error);
    return NextResponse.json(
      { error: "Failed to compute admin statistics" },
      { status: 500 }
    );
  }
}

