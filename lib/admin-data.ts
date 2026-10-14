// File: lib/admin-data.ts
import { ARTICLES_DATABASE, type Article } from "./articles";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "blocked" | "under_review";
  joinedDate: string;
  totalPurchases: number;
  totalSpent: number;
  violationReason?: string;
  blockedAt?: string;
};

export type ArticleReport = {
  id: string;
  articleId: string;
  articleTitle: string;
  articleCategory: string;
  reporterEmail: string;
  reason: "piracy" | "inaccurate_info" | "harassment" | "chargeback_claim" | "policy_violation";
  description: string;
  timestamp: string;
  status: "pending" | "resolved" | "dismissed";
  severity: "high" | "medium" | "low";
};

export type RevenueSummary = {
  totalRevenueNaira: number;
  totalArticleSales: number;
  averageOrderValue: number;
  settledViaPaga: number;
  pendingEscrow: number;
  dailyRevenueDelta: string;
};

export type AdminArticle = Article & {
  soldCopies: number;
  revenueGenerated: number;
  status: "published" | "draft" | "archived";
  createdAt: string;
};

// All test articles and simulated sales numbers deleted - clean production slate
export const INITIAL_ADMIN_ARTICLES: AdminArticle[] = [];

export function addAdminArticle(article: AdminArticle): void {
  const clean = (article.id || article.slug).trim().toLowerCase();
  const index = INITIAL_ADMIN_ARTICLES.findIndex(
    (a) => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean
  );
  if (index !== -1) {
    INITIAL_ADMIN_ARTICLES[index] = article;
  } else {
    INITIAL_ADMIN_ARTICLES.unshift(article);
  }
}

// Admin Users - test purchases and fake transactions reset to 0
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-999",
    name: "Alex Reader (Admin)",
    email: "reader@streetio.internal",
    role: "admin",
    status: "active",
    joinedDate: "2026-10-14",
    totalPurchases: 0,
    totalSpent: 0,
  },
];

// All mock test incident reports deleted
export const INITIAL_ARTICLE_REPORTS: ArticleReport[] = [];

// Compute aggregated revenue - starts at 0 for clean slate
export function calculateRevenueSummary(articles: AdminArticle[]): RevenueSummary {
  const totalRevenue = articles.reduce((sum, a) => sum + a.revenueGenerated, 0);
  const totalSales = articles.reduce((sum, a) => sum + a.soldCopies, 0);
  const aov = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
  const settled = Math.round(totalRevenue * 0.90);
  const pending = totalRevenue - settled;

  return {
    totalRevenueNaira: totalRevenue,
    totalArticleSales: totalSales,
    averageOrderValue: aov,
    settledViaPaga: settled,
    pendingEscrow: pending,
    dailyRevenueDelta: totalRevenue > 0 ? "+0.0%" : "0%",
  };
}

export function formatAdminNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function deleteAdminArticle(articleId: string): boolean {
  const clean = articleId.trim().toLowerCase();
  const index = INITIAL_ADMIN_ARTICLES.findIndex(
    (a) => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean
  );
  if (index !== -1) {
    INITIAL_ADMIN_ARTICLES.splice(index, 1);
    return true;
  }
  return false;
}
