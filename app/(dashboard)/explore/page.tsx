// File: app/(dashboard)/explore/page.tsx
import type { Metadata } from "next";
import { ExploreSearch } from "@/component/dashboard/ExploreSearch";

export const metadata: Metadata = {
  title: "Explore Categories & Guides · streetio",
  description: "Browse 25 real-world operational categories, search guides, and get Gemini AI overviews.",
};

export const instant = false;

import { Suspense } from "react";
import Loader from "@/component/ui/Loader";

export default function ExplorePage() {
  return (
    <Suspense fallback={<Loader />}>
      <ExploreSearch />
    </Suspense>
  );
}
