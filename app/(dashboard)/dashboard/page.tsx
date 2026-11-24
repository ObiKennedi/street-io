// File: app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";

import Link from "next/link";
import {
  DashboardGreeting,
  WalletCard,
  CategoryGrid,
  RecentActivity,
  DashboardArticlesFeed,
} from "@/component/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { mapDbArticleToArticle, ARTICLES_DATABASE, type Article } from "@/lib/articles";

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

  let initialArticles: Article[] = [...ARTICLES_DATABASE];
  try {
    const dbArticles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    if (dbArticles.length > 0) {
      initialArticles = dbArticles.map(mapDbArticleToArticle);
    }
  } catch (err) {
    console.error("Error loading articles on dashboard page:", err);
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

      <CategoryGrid />

      <DashboardArticlesFeed initialArticles={initialArticles} isAdmin={isAdmin} />

      <RecentActivity items={data.recentActivity} />
    </div>
  );
}
