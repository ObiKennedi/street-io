// File: components/auth/registerForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { safePath, sendVerificationEmail, signIn, signUp } from "@/lib/auth-client";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordField } from "./PasswordField";
import { DisclaimerModal } from "./DisclaimerModal";
import "./auth-form.scss";

type Status =
  | { type: "idle" }
  | { type: "pending" }
  | { type: "error"; message: React.ReactNode }
  | { type: "sent"; email: string };

export function SignUpForm({ next }: { next?: string }) {
  const returnTo = next ? safePath(next, "/redirect") : "/redirect";
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [resent, setResent] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [pendingGoogle, setPendingGoogle] = useState(false);

  // Triggered when clicking "Sign up" on the form
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim().toLowerCase();
    const password = String(formData.get("password"));

    setPendingValues({ name, email, password });
    setPendingGoogle(false);
    setIsDisclaimerOpen(true);
  }

  // Triggered when user confirms the disclaimer in the modal
  async function handleConfirmDisclaimer() {
    if (pendingGoogle) {
      setIsDisclaimerOpen(false);
      await signIn.social({
        provider: "google",
        callbackURL: returnTo,
        errorCallbackURL: "/login?error=google",
      });
      return;
    }

    if (!pendingValues) return;

    setStatus({ type: "pending" });
    const { error } = await signUp.email({
      name: pendingValues.name,
      email: pendingValues.email,
      password: pendingValues.password,
      // Where the verification link lands (signed in, via autoSignInAfterVerification).
      callbackURL: returnTo,
    });

    if (!error) {
      setIsDisclaimerOpen(false);
      setStatus({ type: "sent", email: pendingValues.email });
      return;
    }

    setIsDisclaimerOpen(false);

    if (error.code === "USER_ALREADY_EXISTS" || error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      setStatus({
        type: "error",
        message: (
          <>
            An account with this email already exists. <Link href="/login">Log in</Link> or{" "}
            <Link href="/forgot-password">reset your password</Link>.
          </>
        ),
      });
      return;
    }

    if (error.code === "PASSWORD_TOO_SHORT") {
      setStatus({ type: "error", message: "Use at least 8 characters for your password." });
      return;
    }

    setStatus({
      type: "error",
      message:
        error.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : (error.message ?? "We couldn't create your account. Please try again."),
    });
  }

  async function resend(email: string) {
    await sendVerificationEmail({ email, callbackURL: returnTo });
    setResent(true);
  }

  if (status.type === "sent") {
    return (
      <div className="auth-form">
        <div className="auth-form__notice auth-form__notice--success" role="status">
          <strong>Check your inbox.</strong> We sent a confirmation link to <b>{status.email}</b>.
          Open it to activate your account &mdash; the link expires in 1 hour.
        </div>
        <p className="auth-form__switch">
          Didn&rsquo;t get it? Check spam, or{" "}
          <button
            type="button"
            className="auth-form__text-button"
            onClick={() => resend(status.email)}
            disabled={resent}
          >
            {resent ? "link sent again" : "send it again"}
          </button>
          .
        </p>
      </div>
    );
  }

  const isPending = status.type === "pending";

  return (
    <div className="auth-form">
      <GoogleSignInButton
        callbackURL={returnTo}
        label="Sign up with Google"
        onPreClick={() => {
          setPendingValues(null);
          setPendingGoogle(true);
          setIsDisclaimerOpen(true);
          return false;
        }}
      />

      <div className="auth-form__divider" role="separator">
        <span>or sign up with email</span>
      </div>

      <form className="auth-form__form" onSubmit={handleFormSubmit}>
        {status.type === "error" && (
          <p className="auth-form__error" role="alert">
            {status.message}
          </p>
        )}

        <div className="auth-form__field">
          <label htmlFor="signup-name" className="auth-form__label">
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            className="auth-form__input"
            autoComplete="name"
            maxLength={80}
            required
          />
        </div>

        <div className="auth-form__field">
          <label htmlFor="signup-email" className="auth-form__label">
            Email
          </label>
          <input
            id="signup-email"
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
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters. A short phrase is easier to remember and harder to guess."
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label className="auth-form__check auth-form__check--terms">
            <input type="checkbox" name="terms" required />
            <span>
              I agree to the <Link href="/terms">Terms of use</Link> and{" "}
              <Link href="/privacy">Privacy policy</Link>, and acknowledge the Mandatory Disclaimer.
            </span>
          </label>

          <div>
            <button
              type="button"
              className="auth-disclaimer-trigger"
              onClick={() => {
                setPendingValues(null);
                setPendingGoogle(false);
                setIsDisclaimerOpen(true);
              }}
            >
              ⚠️ Read Mandatory Important Notice &amp; Disclaimer
            </button>
          </div>
        </div>

        <button type="submit" className="auth-form__submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="auth-form__switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>

      {/* Mandatory Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        onConfirm={handleConfirmDisclaimer}
        isPending={isPending}
      />
    </div>
  );
}