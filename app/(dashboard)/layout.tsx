// File: app/(dashboard)/layout.tsx
import type { Metadata } from "next";

import { BottomNav } from "@/component/dashboard/BottomNav";
import { requireSession } from "@/lib/session";
import { Suspense } from "react";
import Loader from "@/component/ui/Loader";
import "@/component/dashboard/dashboard.scss";

export const metadata: Metadata = {
  title: "Dashboard · streetio",
  robots: { index: false },
};

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash">
      <Suspense fallback={<Loader />}>
        <main id="main" className="dash__main">
          {children}
        </main>
      </Suspense>
      <BottomNav />
    </div>
  );
}