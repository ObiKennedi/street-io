// File: app/(auth)/login/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/component/auth/SignInForm";
import { safePath } from "@/lib/safe-path";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Log in · streetio" };
export const instant = false;

const ERRORS: Record<string, string> = {
  google: "Google sign-in didn't complete. Please try again.",
  access_denied: "You cancelled the Google sign-in.",
  INVALID_TOKEN: "That confirmation link has expired. Log in and we'll send you a new one.",
  TOKEN_EXPIRED: "That confirmation link has expired. Log in and we'll send you a new one.",
};

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  if (await getSession()) redirect(safePath(next));

  return (
    <>
      <h1 className="auth-shell__title">
        Welcome <span>back</span>
      </h1>
      <p className="auth-shell__lead">Log in to keep reading members-only articles.</p>

      {error && (
        <p className="auth-shell__error" role="alert">
          {ERRORS[error] ?? "Something went wrong signing you in. Please try again."}
        </p>
      )}

      <SignInForm next={next} />

      <p className="auth-shell__legal">
        By continuing you agree to our <Link href="/terms">Terms of use</Link> and confirm
        you&rsquo;ll use streetio for educational purposes only.
      </p>
    </>
  );
}