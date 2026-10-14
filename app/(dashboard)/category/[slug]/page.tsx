// File: app/(dashboard)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getCategoryBySlug, getArticlesByCategory, addArticle, type Article } from "@/lib/articles";
import { exploreCategories } from "@/component/dashboard/categories.config";
import { CategoryDetailView } from "@/component/dashboard/CategoryDetailView";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found · streetio",
    };
  }

  return {
    title: `${category.label} Guides & Playbooks · streetio`,
    description: category.description || `Browse actionable operational guides and playbooks in ${category.label}.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  await requireSession(`/category/${slug}`);

  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  let articles: Article[] = getArticlesByCategory(slug);

  if (articles.length === 0) {
    try {
      const records = await prisma.article.findMany({
        where: {
          categorySlug: { equals: slug, mode: "insensitive" },
          published: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (records.length > 0) {
        articles = records.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          category: category.label,
          categorySlug: a.categorySlug || slug,
          price: `₦${a.price.toLocaleString()}`,
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
        }));

        for (const art of articles) {
          addArticle(art);
        }
      }
    } catch (err) {
      console.error("Prisma error in CategoryPage:", err);
    }
  }

  // Pick 3 related categories (excluding current)
  const relatedCategories = exploreCategories
    .filter((c) => c.slug !== category.slug)
    .slice(0, 4);

  return (
    <CategoryDetailView
      category={category}
      articles={articles}
      relatedCategories={relatedCategories}
    />
  );
}
