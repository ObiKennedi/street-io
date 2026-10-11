import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/** Current session or null — use in Server Components, Route Handlers and Actions. */
export async function getSession() {
  try {
    const reqHeaders = await headers();
    const cookieHeader = reqHeaders?.get("cookie") || "";

    if (
      cookieHeader.includes("better-auth.session_token") ||
      cookieHeader.includes("__Secure-better-auth.session_token")
    ) {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session && (session as any).user) return session;
    }
  } catch {
    // Headers or auth lookup failure during prerendering or invalid session
  }

  return null;
}

/** Session or redirect to /login, preserving where the user was going. */
export async function requireSession(returnTo = "/") {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return session;
}