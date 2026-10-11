// File: app/api/article/unlock/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { debitUserWallet, unlockArticleForUser, isArticleUnlockedForUser } from "@/lib/paga";
import { getArticleBySlug } from "@/lib/articles";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const articleSlug = body.articleSlug as string;

    if (!articleSlug) {
      return NextResponse.json({ error: "Article slug is required" }, { status: 400 });
    }

    const article = getArticleBySlug(articleSlug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const numericPrice = parseInt(article.price.replace(/[^0-9]/g, ""), 10) || 3500;

    // Check if user has sufficient wallet balance
    const debitResult = debitUserWallet(session.user.id, numericPrice);
    if (!debitResult.success) {
      return NextResponse.json(
        {
          error: "Insufficient reader wallet balance",
          required: numericPrice,
          balance: debitResult.balance,
          needsFunding: true,
        },
        { status: 402 }
      );
    }

    // Unlock article
    unlockArticleForUser(session.user.id, articleSlug);

    return NextResponse.json({
      success: true,
      articleSlug,
      balance: debitResult.balance,
      formattedBalance: debitResult.formattedBalance,
      message: `Unlocked "${article.title}" successfully!`,
    });
  } catch (error) {
    console.error("Unlock article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleSlug = searchParams.get("slug");
  const session = await getSession();

  if (!session || !articleSlug) {
    return NextResponse.json({ isUnlocked: false });
  }

  const isUnlocked = isArticleUnlockedForUser(session.user.id, articleSlug);
  return NextResponse.json({ isUnlocked });
}
