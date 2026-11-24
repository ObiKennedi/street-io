// File: lib/dashboard.ts

export type Wallet = {
  balance: number;
  currency: string;
  formattedBalance: string;
  pendingAmount?: number;
  formattedPendingAmount?: string;
  hasPending?: boolean;
};

export type Membership = {
  plan: string; // e.g. "Monthly", "Yearly"
  status: "active" | "past_due" | "cancelled";
  renewsAt: Date | null;
};

export type ReadingActivity = {
  id: string;
  title: string;
  href: string;
  category: string;
  progress: number; // 0–100
  readAt: Date;
};

export type DashboardData = {
  wallet: Wallet;
  membership?: Membership | null;
  recentActivity: ReadingActivity[];
};

import { resolveUserWalletState } from "./manual-payments";

/**
 * Everything the dashboard needs for one user.
 * Accurately aggregates reader wallet balance from verified bank transfers,
 * PostgreSQL DB, and tracks pending transfers awaiting verification.
 */
export async function getDashboardData(
  userId: string,
  userEmail?: string
): Promise<DashboardData> {
  const walletState = await resolveUserWalletState(userId, userEmail);

  let recentActivity: ReadingActivity[] = [];
  if (walletState.unlockedSlugs && walletState.unlockedSlugs.length > 0) {
    try {
      const { prisma } = await import("./prisma");
      const dbArticles = await prisma.article.findMany({
        where: {
          slug: { in: walletState.unlockedSlugs },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          categorySlug: true,
          updatedAt: true,
        },
        take: 6,
      });

      recentActivity = dbArticles.map((art) => ({
        id: art.id,
        title: art.title,
        href: `/article/${encodeURIComponent(art.slug)}`,
        category: art.categorySlug
          ? art.categorySlug.replace(/-/g, " ").toUpperCase()
          : "PLAYBOOK",
        progress: 100,
        readAt: art.updatedAt || new Date(),
      }));
    } catch (err) {
      console.error("Error loading unlocked articles for recentActivity:", err);
    }
  }

  return {
    wallet: {
      balance: walletState.balance,
      currency: "₦",
      formattedBalance: walletState.formattedBalance,
      pendingAmount: walletState.pendingAmount,
      formattedPendingAmount: walletState.formattedPendingAmount,
      hasPending: walletState.hasPending,
    },
    membership: null,
    recentActivity,
  };
}

export type UserRole = "user" | "admin" | "owner" | string;

/**
 * Returns the appropriate dashboard destination based on user role.
 * - Admins and owners are routed to `/owner/dashboard`.
 * - Regular users are routed to `/dashboard`.
 */
export function getDashboardPath(role?: string | null): string {
  if (role === "admin" || role === "owner") {
    return "/admin";
  }
  return "/dashboard";
}
