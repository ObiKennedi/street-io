// File: app/(dashboard)/owner/dashboard/page.tsx
import type { Metadata } from "next";
import { AdminDashboardView } from "@/component/admin";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Owner Executive Console · streetio",
  description: "Executive console for managing articles, setting Naira pricing, policy enforcement, and Paga revenue metrics.",
};

export const instant = false;

export default async function OwnerDashboardPage() {
  await requireSession("/owner/dashboard");

  return <AdminDashboardView />;
}
