// File: app/(auth)/redirect/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboardPath } from "@/lib/dashboard";
import { safePath } from "@/lib/safe-path";
import { prisma } from "@/lib/prisma";

export const instant = false;

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AuthRedirectPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get the most up-to-date role directly from Postgres to bypass any cookie cache
  let userRole = (session.user as { role?: string | null })?.role ?? "user";
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (dbUser?.role) {
      userRole = String(dbUser.role);
    }
  } catch {
    // Fall back to session user role if DB lookup fails
  }

  const roleDashboard = getDashboardPath(userRole);

  const cleanNext = next ? safePath(next, roleDashboard) : null;
  const target =
    cleanNext &&
    cleanNext !== "/" &&
    cleanNext !== "/redirect" &&
    cleanNext !== "/login" &&
    cleanNext !== "/register" &&
    cleanNext !== "/dashboard" &&
    cleanNext !== "/admin" &&
    cleanNext !== "/owner/dashboard"
      ? cleanNext
      : roleDashboard;

  redirect(target);
}
