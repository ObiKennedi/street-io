// File: app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";

import { ResetPasswordForm } from "@/component/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password · streetio" };
export const instant = false;

type Props = { searchParams: Promise<{ token?: string; error?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, error } = await searchParams;

  return (
    <>
      <h1 className="auth-shell__title">
        Choose a new <span>password</span>
      </h1>
      <p className="auth-shell__lead">Pick something you haven&rsquo;t used on streetio before.</p>
      {/* Better Auth redirects here with ?error=INVALID_TOKEN when the link is bad */}
      <ResetPasswordForm token={error ? null : (token ?? null)} />
    </>
  );
}