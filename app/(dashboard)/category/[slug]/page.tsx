// File: app/(dashboard)/category/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getCategoryBySlug, getArticlesByCategory } from "@/lib/articles";
import { exploreCategories } from "@/component/dashboard/categories.config";
import { CategoryDetailView } from "@/component/dashboard/CategoryDetailView";

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

  const articles = getArticlesByCategory(slug);

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
