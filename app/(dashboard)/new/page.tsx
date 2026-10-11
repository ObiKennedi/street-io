// File: app/(dashboard)/new/page.tsx
import type { Metadata } from "next";
import { NewArticlesFeed } from "@/component/dashboard";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Latest Releases · streetio",
  description: "Browse the latest uploaded articles, field playbooks, and operational guides on Street IO.",
};

export const instant = false;

export default async function NewPage() {
  await requireSession("/new");

  return <NewArticlesFeed />;
}
