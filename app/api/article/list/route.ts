// File: app/api/article/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ARTICLES_DATABASE, mapDbArticleToArticle } from "@/lib/articles";
import { INITIAL_ADMIN_ARTICLES, type AdminArticle } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });

    const articles: AdminArticle[] = dbArticles.map((a) => {
      const art = mapDbArticleToArticle(a);
      return {
        ...art,
        soldCopies: a.soldCopies || 0,
        revenueGenerated: a.revenueGenerated || 0,
        status: (a.status as any) || "published",
        createdAt:
          a.createdAt instanceof Date
            ? a.createdAt.toISOString().split("T")[0]
            : String(a.createdAt || ""),
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

    return NextResponse.json(
      {
        success: true,
        articles: articles.length > 0 ? articles : INITIAL_ADMIN_ARTICLES,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("Error fetching articles list from DB:", err);
    return NextResponse.json(
      {
        success: true,
        articles: INITIAL_ADMIN_ARTICLES,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
