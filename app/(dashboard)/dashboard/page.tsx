// File: app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";

import Link from "next/link";
import {
  DashboardGreeting,
  WalletCard,
  CategoryGrid,
  RecentActivity,
  NewArticlesFeed,
} from "@/component/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { exploreCategories } from "@/component/dashboard/categories.config";
import { addArticle, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Dashboard · streetio",
  description: "Your streetio member dashboard, wallet, and learning activity.",
};

export const instant = false;

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");
  const data = await getDashboardData(session.user.id, session.user.email);
  const userRole = (session.user as { role?: string | null })?.role;
  const isAdmin = userRole === "admin" || userRole === "owner";

  // Fetch published articles from DB and seed in-memory list
  let initialArticles: Article[] = [];
  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    initialArticles = dbArticles.map((a) => {
      const catConfig = exploreCategories.find((c) => c.slug === a.categorySlug);
      const categoryLabel = catConfig
        ? catConfig.label
        : a.categorySlug
        ? a.categorySlug.toUpperCase()
        : "GENERAL";

      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        link: `/article/${a.slug}`,
        category: categoryLabel,
        categorySlug: a.categorySlug || "general",
        price: `₦${a.price.toLocaleString()}`,
        readTime: a.readTime || "7 min read",
        description: a.description,
        content: a.content,
        contentSnippet: a.contentSnippet || a.description,
        thumbnailUrl: a.coverImage || undefined,
        weeklyReads: a.weeklyReads,
        monthlyReads: a.monthlyReads,
        totalReads: a.totalReads,
        trendingDelta: a.trendingDelta || "+100%",
        uploadedAt: a.createdAt.toISOString(),
      } satisfies Article;
    });

    for (const article of initialArticles) {
      addArticle(article);
    }
  } catch (err) {
    console.error("Prisma error fetching articles for dashboard:", err);
  }

  return (
    <div className="dash-feed">
      {isAdmin && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "var(--radius-lg)",
            background: "var(--brand-charcoal, #1E293B)",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 6px #10B981",
              }}
              aria-hidden="true"
            />
            <span>Admin Clearance Active</span>
          </div>
          <Link
            href="/admin"
            style={{
              color: "#38BDF8",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            Open Admin Command Center →
          </Link>
        </div>
      )}

      <DashboardGreeting
        name={session.user.name}
        image={session.user.image}
        unreadAlerts={0}
      />

      <WalletCard wallet={data.wallet} />

      <RecentActivity items={data.recentActivity} />

      <NewArticlesFeed initialArticles={initialArticles} />

      <CategoryGrid />
    </div>
  );
}
