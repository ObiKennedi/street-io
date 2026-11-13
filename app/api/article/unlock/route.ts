// File: app/api/article/unlock/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { unlockArticleForUser, isArticleUnlockedForUser } from "@/lib/paga";
import { getArticleBySlug, ARTICLES_DATABASE } from "@/lib/articles";
import { debitUserWalletState, resolveUserWalletState } from "@/lib/manual-payments";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const articleSlug = (body.articleSlug as string)?.trim()?.toLowerCase();

    if (!articleSlug) {
      return NextResponse.json({ error: "Article slug is required." }, { status: 400 });
    }

    // Resolve article from in-memory database or PostgreSQL
    let article = getArticleBySlug(articleSlug) || ARTICLES_DATABASE.find(
      (a) => a.slug.toLowerCase() === articleSlug || a.id.toLowerCase() === articleSlug
    );

    if (!article) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const dbArticle = await prisma.article.findFirst({
          where: { OR: [{ slug: articleSlug }, { id: articleSlug }] },
        });
        if (dbArticle) {
          article = {
            id: dbArticle.id,
            slug: dbArticle.slug,
            title: dbArticle.title,
            category: dbArticle.categorySlug || "GENERAL",
            categorySlug: dbArticle.categorySlug || "general",
            price: typeof dbArticle.price === "number" ? `₦${dbArticle.price.toLocaleString()}` : String(dbArticle.price),
            readTime: dbArticle.readTime || "7 min read",
            description: dbArticle.description,
            content: dbArticle.content,
            contentSnippet: dbArticle.contentSnippet || dbArticle.description,
            keyTakeaways: dbArticle.keyTakeaways || [],
            tags: dbArticle.tags || [],
            weeklyReads: dbArticle.weeklyReads,
            monthlyReads: dbArticle.monthlyReads,
            totalReads: dbArticle.totalReads,
            trendingDelta: dbArticle.trendingDelta || "+100%",
          };
        }
      } catch {}
    }

    if (!article) {
      return NextResponse.json({ error: "Playbook guide not found." }, { status: 404 });
    }

    // If user already owns access to this article, do not debit them again
    const walletState = await resolveUserWalletState(session.user.id, session.user.email);
    const isAlreadyUnlocked =
      walletState.unlockedSlugs.includes(articleSlug) ||
      isArticleUnlockedForUser(session.user.id, articleSlug);

    if (isAlreadyUnlocked) {
      unlockArticleForUser(session.user.id, articleSlug);
      return NextResponse.json({
        success: true,
        articleSlug,
        balance: walletState.balance,
        formattedBalance: walletState.formattedBalance,
        message: `You already have unlocked access to "${article.title}".`,
      });
    }

    const numericPrice = parseInt(article.price.replace(/[^0-9]/g, ""), 10) || 3500;

    // Debit user wallet using multi-source authoritative balance (checks approved slips & DB)
    const debitResult = await debitUserWalletState(
      session.user.id,
      numericPrice,
      session.user.email,
      articleSlug,
      `Unlocked guide: ${article.title}`
    );

    if (!debitResult.success) {
      return NextResponse.json(
        {
          error: debitResult.error || "Insufficient reader wallet balance",
          required: numericPrice,
          balance: debitResult.balance,
          formattedBalance: debitResult.formattedBalance,
          needsFunding: true,
        },
        { status: 402 }
      );
    }

    // Ensure marked unlocked in runtime
    unlockArticleForUser(session.user.id, articleSlug);

    return NextResponse.json({
      success: true,
      articleSlug,
      balance: debitResult.balance,
      formattedBalance: debitResult.formattedBalance,
      message: `Unlocked "${article.title}" successfully! Access granted.`,
    });
  } catch (error) {
    console.error("Unlock article error:", error);
    return NextResponse.json({ error: "Internal server error unlocking article." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleSlug = searchParams.get("slug")?.trim()?.toLowerCase();
  const session = await getSession();

  if (!session?.user?.id || !articleSlug) {
    return NextResponse.json({ isUnlocked: false });
  }

  const walletState = await resolveUserWalletState(session.user.id, session.user.email);
  const isUnlocked =
    walletState.unlockedSlugs.includes(articleSlug) ||
    isArticleUnlockedForUser(session.user.id, articleSlug);

  return NextResponse.json({ isUnlocked, balance: walletState.balance, formattedBalance: walletState.formattedBalance });
}
