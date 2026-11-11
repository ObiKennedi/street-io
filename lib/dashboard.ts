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
    recentActivity: [],
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
