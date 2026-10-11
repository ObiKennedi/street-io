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

// Initial Seed for Admin Articles with sales figures
export const INITIAL_ADMIN_ARTICLES: AdminArticle[] = ARTICLES_DATABASE.map((art, idx) => {
  const priceNumber = parseInt(art.price.replace(/[^0-9]/g, ""), 10) || 3500;
  // Generate realistic sales figures based on reads
  const soldCopies = Math.max(12, Math.floor(art.weeklyReads / 180));
  const revenueGenerated = soldCopies * priceNumber;

  return {
    ...art,
    soldCopies,
    revenueGenerated,
    status: "published",
    createdAt: idx < 5 ? "2026-10-10" : "2026-09-28",
  };
});

// Seed for Users with Moderation Status
export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-881",
    name: "Emeka Okafor",
    email: "emeka.o@investigations.ng",
    role: "user",
    status: "active",
    joinedDate: "2026-08-14",
    totalPurchases: 14,
    totalSpent: 48500,
  },
  {
    id: "usr-902",
    name: "Fatima Al-Hassan",
    email: "fatima.h@cyberdefense.org",
    role: "user",
    status: "active",
    joinedDate: "2026-09-02",
    totalPurchases: 22,
    totalSpent: 86000,
  },
  {
    id: "usr-334",
    name: "Scraper Bot Network",
    email: "crawler_node_42@proxynet.io",
    role: "user",
    status: "blocked",
    joinedDate: "2026-10-01",
    totalPurchases: 1,
    totalSpent: 3500,
    violationReason: "Automated headless scraper detected attempting bulk content theft.",
    blockedAt: "2026-10-05",
  },
  {
    id: "usr-512",
    name: "David Adeleke",
    email: "david.a@finsec.co",
    role: "user",
    status: "active",
    joinedDate: "2026-07-19",
    totalPurchases: 9,
    totalSpent: 31500,
  },
  {
    id: "usr-609",
    name: "Piracy Mirror Agent",
    email: "streetleaks_tg@protonmail.com",
    role: "user",
    status: "blocked",
    joinedDate: "2026-09-25",
    totalPurchases: 2,
    totalSpent: 8500,
    violationReason: "Redistributing proprietary paywalled operational guides on Telegram channels.",
    blockedAt: "2026-09-29",
  },
  {
    id: "usr-741",
    name: "Zainab Balogun",
    email: "zainab.b@corporaterisk.ng",
    role: "user",
    status: "active",
    joinedDate: "2026-09-18",
    totalPurchases: 17,
    totalSpent: 62000,
  },
  {
    id: "usr-819",
    name: "Chargeback Abuser",
    email: "dispute_cycle_99@burner.com",
    role: "user",
    status: "blocked",
    joinedDate: "2026-09-10",
    totalPurchases: 3,
    totalSpent: 12000,
    violationReason: "Initiated 3 fraudulent chargebacks with Paga after unlocking high-value guides.",
    blockedAt: "2026-09-12",
  },
  {
    id: "usr-999",
    name: "Alex Reader (You)",
    email: "reader@streetio.internal",
    role: "admin",
    status: "active",
    joinedDate: "2026-05-01",
    totalPurchases: 38,
    totalSpent: 142000,
  },
];

// Seed for Incident Reports on Articles
export const INITIAL_ARTICLE_REPORTS: ArticleReport[] = [
  {
    id: "rep-101",
    articleId: "art-2",
    articleTitle: "BEC (Business Email Compromise): Wire Intercept & Executive Impersonation",
    articleCategory: "Corporate Fraud",
    reporterEmail: "auditor@bankgroup.ng",
    reason: "policy_violation",
    description: "Please update the vendor callback verification template to reference recent CBN circular guidelines on swift payments.",
    timestamp: "2 hours ago",
    status: "pending",
    severity: "medium",
  },
  {
    id: "rep-102",
    articleId: "art-1",
    articleTitle: "How to Spot a Romance Scam: Operational Playbook & Red Flags",
    articleCategory: "Dating",
    reporterEmail: "victim_support@safety.ng",
    reason: "piracy",
    description: "Third-party blog copied the biometric verification section verbatim without attribution. DMCA request filed.",
    timestamp: "5 hours ago",
    status: "pending",
    severity: "high",
  },
  {
    id: "rep-103",
    articleId: "art-4",
    articleTitle: "Land Registry Due Diligence: Certificate of Occupancy Validation",
    articleCategory: "Real Estate",
    reporterEmail: "legal@surveyafrika.com",
    reason: "inaccurate_info",
    description: "Lagos State Land Bureau digitization fee increased from ₦5,000 to ₦10,000 this month. Guide price estimate needs minor update.",
    timestamp: "Yesterday",
    status: "resolved",
    severity: "low",
  },
  {
    id: "rep-104",
    articleId: "art-5",
    articleTitle: "SIM Swap Defense: Telecom Port-Out Lock & SS7 Intercept Countermeasures",
    articleCategory: "Cybersecurity",
    reporterEmail: "telecom_sec@mtnops.ng",
    reason: "policy_violation",
    description: "Verified excellent operational coverage of USSD blocking protocols. Reader recommended tagging as essential.",
    timestamp: "2 days ago",
    status: "dismissed",
    severity: "low",
  },
];

// Compute aggregated revenue
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
    dailyRevenueDelta: "+18.4%",
  };
}

export function formatAdminNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
