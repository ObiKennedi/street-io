// File: app/(auth)/redirect/page.tsx
"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/dashboard";
import { safePath } from "@/lib/safe-path";
import { Loader } from "@/component/ui/Loader";

function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const [, startTransition] = useTransition();

  const [message, setMessage] = useState("Verifying your session...");

  useEffect(() => {
    let active = true;

    async function handleAuthRouting() {
      try {
        const { data: session } = await authClient.getSession();

        if (!active) return;

        if (!session?.user) {
          // If session is missing or expired, send to login
          router.replace("/login");
          return;
        }

        setMessage("Directing to your dashboard...");

        // Determine destination based on user role
        const userRole = (session.user as { role?: string | null })?.role ?? "user";
        const dashboardPath = getDashboardPath(userRole);

        // If next was provided and isn't a root/redirect loop, respect it; otherwise use role dashboard
        const cleanNext = nextParam ? safePath(nextParam, dashboardPath) : null;
        const target =
          cleanNext &&
          cleanNext !== "/" &&
          cleanNext !== "/redirect" &&
          cleanNext !== "/login" &&
          cleanNext !== "/register" &&
          cleanNext !== "/dashboard" &&
          cleanNext !== "/owner/dashboard"
            ? cleanNext
            : dashboardPath;

        startTransition(() => {
          router.replace(target);
          router.refresh();
        });
      } catch {
        if (active) {
          router.replace("/login");
        }
      }
    }

    handleAuthRouting();

    return () => {
      active = false;
    };
  }, [router, nextParam]);

  return (
    <Loader
      size="lg"
      label={message}
      sublabel="Preparing your workspace"
    />
  );
}

export default function AuthRedirectPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBlock: "var(--space-12, 3rem)",
        minHeight: "220px",
      }}
    >
      <Suspense
        fallback={
          <Loader
            size="lg"
            label="Loading..."
            sublabel="Preparing your workspace"
          />
        }
      >
        <RedirectHandler />
      </Suspense>
    </div>
  );
}
