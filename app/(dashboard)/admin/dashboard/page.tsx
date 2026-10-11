// File: app/(dashboard)/admin/dashboard/page.tsx
import type { Metadata } from "next";
import { AdminDashboardView } from "@/component/admin";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin Executive Dashboard · streetio",
  description: "Operations console for managing articles, setting Naira pricing, policy enforcement, and Paga revenue metrics.",
};

export const instant = false;

export default async function AdminDashboardPage() {
  await requireSession("/admin/dashboard");

  return <AdminDashboardView />;
}
