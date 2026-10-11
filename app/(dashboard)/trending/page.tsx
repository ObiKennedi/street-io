// File: app/(dashboard)/trending/page.tsx
import type { Metadata } from "next";
import { TrendingFeed } from "@/component/dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Trending Intelligence · streetio",
  description: "Explore the most read operational guides and practical playbooks on Street IO with weekly and monthly filters.",
};

export const instant = false;

export default async function TrendingPage() {
  await requireSession("/trending");

  return <TrendingFeed />;
}
