// File: lib/dashboard.ts

export type Wallet = {
  balance: number;
  currency: string;
  formattedBalance: string;
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

import { getUserWalletBalance, formatNaira } from "./paga";

/**
 * Everything the dashboard needs for one user.
 * Returns default wallet state and reading history.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const balance = getUserWalletBalance(userId);

  return {
    wallet: {
      balance,
      currency: "₦",
      formattedBalance: formatNaira(balance),
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
    return "/owner/dashboard";
  }
  return "/dashboard";
}
