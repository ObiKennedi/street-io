// File: app/(dashboard)/checkout/paga/page.tsx
import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { ARTICLES_DATABASE } from "@/lib/articles";
import { PagaCheckoutView } from "@/component/dashboard/PagaCheckoutView";

export const metadata: Metadata = {
  title: "Paga Secure Checkout · streetio",
  description: "Complete your payment directly with Paga for Street IO reader wallet and educational guides.",
};

export const instant = false;

type Props = {
  searchParams: Promise<{
    article?: string;
    amount?: string;
    reference?: string;
    charge_reference?: string;
    status_code?: string;
    status_message?: string;
  }>;
};

import { getUserWalletBalance } from "@/lib/paga";

export default async function PagaCheckoutPage({ searchParams }: Props) {
  const session = await requireSession("/checkout/paga");
  const params = await searchParams;
  const {
    article: articleSlug,
    amount: amountParam,
    reference,
    charge_reference,
    status_code: statusCode,
    status_message: statusMessage,
  } = params;

  let targetArticle = articleSlug
    ? ARTICLES_DATABASE.find((a) => a.slug === articleSlug) ?? null
    : null;

  if (!targetArticle && articleSlug) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const dbArticle = await prisma.article.findFirst({
        where: { OR: [{ slug: articleSlug }, { id: articleSlug }] },
      });
      if (dbArticle) {
        targetArticle = {
          id: dbArticle.id,
          slug: dbArticle.slug,
          title: dbArticle.title,
          category: dbArticle.categorySlug || "GENERAL",
          categorySlug: dbArticle.categorySlug || "general",
          price: `₦${dbArticle.price.toLocaleString()}`,
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
        };
      }
    } catch {}
  }

  // If target article found, parse its price e.g. "₦3,500" -> 3500
  let initialAmount = 5000;
  if (targetArticle) {
    const parsed = parseInt(targetArticle.price.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) initialAmount = parsed;
  } else if (amountParam) {
    const parsed = parseInt(amountParam, 10);
    if (!isNaN(parsed) && parsed > 0) initialAmount = parsed;
  }

  const returnReference = charge_reference || reference || null;
  const walletBalance = getUserWalletBalance(session.user.id);

  return (
    <PagaCheckoutView
      initialAmount={initialAmount}
      targetArticle={targetArticle}
      customerName={session.user.name}
      customerEmail={session.user.email}
      userWalletBalance={walletBalance}
      returnReference={returnReference}
      returnStatusCode={statusCode}
      returnStatusMessage={statusMessage}
    />
  );
}
