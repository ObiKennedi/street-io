// File: components/auth/SignInForm.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { safePath, signIn } from "@/lib/auth-client";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordField } from "./PasswordField";
import "./auth-form.scss";

type Status =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "error"; message: string }
  | { type: "unverified"; email: string };

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const returnTo = safePath(next);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    setStatus({ type: "pending" });
    const { error } = await signIn.email({
      email,
      password,
      rememberMe: form.get("remember") === "on",
      callbackURL: returnTo,
    });

    if (!error) {
      router.replace(returnTo);
      router.refresh();
      return;
    }

    if (error.code === "EMAIL_NOT_VERIFIED") {
      // sendOnSignIn is enabled, so a fresh link has already gone out.
      setStatus({ type: "unverified", email });
      return;
    }

    setStatus({
      type: "error",
      message:
        error.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : "That email and password don't match. Check them and try again.",
    });
  }

  const isPending = status.type === "pending";

  return (
    <div className="auth-form">
      <GoogleSignInButton callbackURL={returnTo} />

      <div className="auth-form__divider" role="separator">
        <span>or log in with email</span>
      </div>

      {status.type === "unverified" ? (
        <div className="auth-form__notice" role="status">
          <strong>Confirm your email first.</strong> We&rsquo;ve sent a new link to{" "}
          <b>{status.email}</b>. Open it to finish signing in.
        </div>
      ) : (
        <form className="auth-form__form" onSubmit={handleSubmit} noValidate={false}>
          {status.type === "error" && (
            <p className="auth-form__error" role="alert">
              {status.message}
            </p>
          )}

          <div className="auth-form__field">
            <label htmlFor="signin-email" className="auth-form__label">
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              className="auth-form__input"
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
            action={
              <Link href="/forgot-password" className="auth-form__inline-link">
                Forgot password?
              </Link>
            }
          />

          <label className="auth-form__check">
            <input type="checkbox" name="remember" defaultChecked />
            <span>Keep me logged in</span>
          </label>

          <button type="submit" className="auth-form__submit" disabled={isPending} aria-busy={isPending}>
            {isPending ? "Logging in…" : "Log in"}
          </button>
        </form>
      )}

      <p className="auth-form__switch">
        New to streetio?{" "}
        <Link href={`/register${next ? `?next=${encodeURIComponent(returnTo)}` : ""}`}>Create an account</Link>
      </p>
    </div>
  );
}