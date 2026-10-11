// File: app/(dashboard)/dashboard/profile/page.tsx
import type { Metadata } from "next";
import { ProfileView } from "@/component/dashboard";
import { getDashboardData } from "@/lib/dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Profile & Account · streetio",
  description: "View your Street IO reader profile, manage your Naira balance via Paga, and manage account security.",
};

export const instant = false;

export default async function DashboardProfilePage() {
  const session = await requireSession("/dashboard/profile");
  const data = await getDashboardData(session.user.id);

  return (
    <ProfileView
      user={{
        id: session.user.id,
        name: session.user.name || "Reader Member",
        email: session.user.email,
        image: session.user.image,
        role: (session.user as { role?: string | null }).role,
        createdAt: session.user.createdAt,
      }}
      wallet={data.wallet}
    />
  );
}
