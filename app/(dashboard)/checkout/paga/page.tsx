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
  searchParams: Promise<{ article?: string; amount?: string }>;
};

export default async function PagaCheckoutPage({ searchParams }: Props) {
  const session = await requireSession("/checkout/paga");
  const { article: articleSlug, amount: amountParam } = await searchParams;

  const targetArticle = articleSlug
    ? ARTICLES_DATABASE.find((a) => a.slug === articleSlug) ?? null
    : null;

  // If target article found, parse its price e.g. "₦3,500" -> 3500
  let initialAmount = 5000;
  if (targetArticle) {
    const parsed = parseInt(targetArticle.price.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) initialAmount = parsed;
  } else if (amountParam) {
    const parsed = parseInt(amountParam, 10);
    if (!isNaN(parsed) && parsed > 0) initialAmount = parsed;
  }

  return (
    <PagaCheckoutView
      initialAmount={initialAmount}
      targetArticle={targetArticle}
      customerName={session.user.name}
      customerEmail={session.user.email}
    />
  );
}
