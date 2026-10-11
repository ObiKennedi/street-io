// File: app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/component/auth/SignUpForm";
import { safePath } from "@/lib/safe-path";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create an account · streetio" };
export const instant = false;

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
  const { next } = await searchParams;
  if (await getSession()) redirect(safePath(next));

  return (
    <>
      <h1 className="auth-shell__title">
        Join <span>streetio</span>
      </h1>
      <p className="auth-shell__lead">Create a free account, then unlock members-only articles.</p>
      <SignUpForm next={next} />
    </>
  );
}