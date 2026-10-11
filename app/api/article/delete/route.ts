// File: app/api/article/delete/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteArticle } from "@/lib/articles";
import { deleteAdminArticle } from "@/lib/admin-data";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string | null })?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Admin clearance required" }, { status: 403 });
    }

    const body = await req.json();
    const articleId = body.id || body.articleId || body.slug;

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // Delete in-memory
    deleteArticle(articleId);
    deleteAdminArticle(articleId);

    // Delete from PostgreSQL
    try {
      await prisma.article.deleteMany({
        where: {
          OR: [{ id: articleId }, { slug: articleId }],
        },
      });
    } catch (dbErr) {
      console.error("DB article delete error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Article ${articleId} successfully deleted.`,
    });
  } catch (err) {
    console.error("Delete article route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
