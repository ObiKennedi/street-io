// File: app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";

import {
  DashboardGreeting,
  WalletCard,
  CategoryGrid,
  RecentActivity,
} from "@/component/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard · streetio",
  description: "Your streetio member dashboard, wallet, and learning activity.",
};

export const instant = false;

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");
  const data = await getDashboardData(session.user.id);

  return (
    <div className="dash-feed">
      <DashboardGreeting
        name={session.user.name}
        image={session.user.image}
        unreadAlerts={0}
      />

      <WalletCard wallet={data.wallet} />

      <RecentActivity items={data.recentActivity} />

      <CategoryGrid />
    </div>
  );
}
