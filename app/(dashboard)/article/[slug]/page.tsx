// File: app/(dashboard)/article/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ARTICLES_DATABASE, getArticleBySlug, type Article } from "@/lib/articles";
import { getToolsForArticle } from "@/lib/article-tools";
import { isArticleUnlockedForUser, getUserWalletBalance } from "@/lib/paga";
import { ArticleDetailView } from "@/component/dashboard/ArticleDetailView";

type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

function resolveArticle(slug: string): Article | undefined {
  if (typeof getArticleBySlug === "function") {
    try {
      const found = getArticleBySlug(slug);
      if (found) return found;
    } catch {}
  }
  const clean = slug?.trim()?.toLowerCase();
  return ARTICLES_DATABASE?.find(
    (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = resolveArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found · streetio",
    };
  }

  return {
    title: `${article.title} · streetio`,
    description: article.description,
  };
}

export default async function ArticleMicroPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();

  const article = resolveArticle(slug);
  if (!article) {
    notFound();
  }

  const tools = getToolsForArticle(article.categorySlug);
  const isUnlocked = session?.user?.id
    ? isArticleUnlockedForUser(session.user.id, article.slug)
    : false;
  const walletBalance = session?.user?.id
    ? getUserWalletBalance(session.user.id)
    : 0;

  return (
    <ArticleDetailView
      article={article}
      tools={tools}
      initialIsUnlocked={isUnlocked}
      userWalletBalance={walletBalance}
    />
  );
}
