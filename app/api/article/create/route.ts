// File: app/api/article/create/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { addArticle } from "@/lib/articles";
import { addAdminArticle, type AdminArticle } from "@/lib/admin-data";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    // Allow admin/owner, or fallback for dev/staff
    const userRole = (session?.user as { role?: string | null })?.role;
    if (session && userRole !== "admin" && userRole !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Admin or Owner privileges required to publish articles." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      content,
      contentSnippet,
      category,
      categorySlug,
      price,
      readTime,
      thumbnailUrl,
      keyTakeaways,
      tags,
      tools,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Article title is required." }, { status: 400 });
    }
    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json({ error: "Article description is required." }, { status: 400 });
    }

    // Clean slug
    const baseSlug = (body.slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = baseSlug || `article-${Date.now()}`;

    // Price parsing
    const numericPrice =
      typeof price === "number"
        ? price
        : parseInt(String(price || "").replace(/[^0-9]/g, ""), 10) || 3500;
    const formattedPrice = `₦${numericPrice.toLocaleString()}`;

    // Full content handling
    const fullContent =
      content && typeof content === "string" && content.trim()
        ? content.trim()
        : contentSnippet && typeof contentSnippet === "string" && contentSnippet.trim()
        ? contentSnippet.trim()
        : description.trim();

    const snippet =
      contentSnippet && typeof contentSnippet === "string" && contentSnippet.trim()
        ? contentSnippet.trim()
        : description.trim();

    const articleId = body.id || `art-${Date.now()}`;
    const cleanCategorySlug = categorySlug || "dating";

    // 1. Persist to PostgreSQL via Prisma
    let savedInDb = false;
    try {
      await prisma.article.upsert({
        where: { slug },
        update: {
          title: title.trim(),
          description: description.trim(),
          content: fullContent,
          contentSnippet: snippet,
          price: numericPrice,
          readTime: readTime?.trim() || "7 min read",
          coverImage: thumbnailUrl?.trim() || null,
          categorySlug: cleanCategorySlug,
          keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
          tags: Array.isArray(tags) ? tags : [],
          status: "published",
          published: true,
          updatedAt: new Date(),
        },
        create: {
          id: articleId,
          slug,
          title: title.trim(),
          description: description.trim(),
          content: fullContent,
          contentSnippet: snippet,
          price: numericPrice,
          readTime: readTime?.trim() || "7 min read",
          coverImage: thumbnailUrl?.trim() || null,
          categorySlug: cleanCategorySlug,
          keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : [],
          tags: Array.isArray(tags) ? tags : [],
          status: "published",
          published: true,
          weeklyReads: 140,
          monthlyReads: 620,
          totalReads: 850,
          trendingDelta: "+100%",
          soldCopies: 0,
          revenueGenerated: 0,
        },
      });
      savedInDb = true;
    } catch (dbErr) {
      console.error("Prisma article upsert error:", dbErr);
    }

    // 2. Keep in-memory runtime synchronous
    const newArticle: AdminArticle = {
      id: articleId,
      slug,
      title: title.trim(),
      category: category || "Operational Guide",
      categorySlug: cleanCategorySlug,
      price: formattedPrice,
      readTime: readTime?.trim() || "7 min read",
      description: description.trim(),
      content: fullContent,
      contentSnippet: snippet,
      thumbnailUrl: thumbnailUrl?.trim() || undefined,
      tools: Array.isArray(tools) && tools.length > 0 ? tools : undefined,
      keyTakeaways: Array.isArray(keyTakeaways) && keyTakeaways.length > 0 ? keyTakeaways : [],
      tags: Array.isArray(tags) && tags.length > 0 ? tags : [],
      weeklyReads: 140,
      monthlyReads: 620,
      totalReads: 850,
      trendingDelta: "+100%",
      soldCopies: 0,
      revenueGenerated: 0,
      status: "published",
      createdAt: new Date().toISOString().split("T")[0],
    };

    addArticle(newArticle);
    addAdminArticle(newArticle);

    return NextResponse.json({
      success: true,
      article: newArticle,
      savedInDb,
      slug,
    });
  } catch (err: any) {
    console.error("Article create route error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create article." },
      { status: 500 }
    );
  }
}
