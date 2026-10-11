// File: components/auth/ForgotPasswordForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { requestPasswordReset } from "@/lib/auth-client";
import "./auth-form.scss";

export function ForgotPasswordForm() {
  const [state, setState] = useState<"idle" | "pending" | "sent" | "limited">("idle");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("pending");

    const { error } = await requestPasswordReset({
      email: email.trim().toLowerCase(),
      // Better Auth validates the token, then redirects here with ?token=…
      redirectTo: "/reset-password",
    });

    // Same message whether or not the account exists — no email enumeration.
    setState(error?.status === 429 ? "limited" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="auth-form">
        <div className="auth-form__notice auth-form__notice--success" role="status">
          <strong>Check your inbox.</strong> If an account exists for <b>{email}</b>, we&rsquo;ve
          sent a link to reset your password. It expires in 1 hour.
        </div>
        <p className="auth-form__switch">
          <Link href="/login">Back to log in</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <form className="auth-form__form" onSubmit={handleSubmit}>
        {state === "limited" && (
          <p className="auth-form__error" role="alert">
            Too many requests. Wait a minute and try again.
          </p>
        )}

        <div className="auth-form__field">
          <label htmlFor="forgot-email" className="auth-form__label">
            Email
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            className="auth-form__input"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={state === "pending"}
          aria-busy={state === "pending"}
        >
          {state === "pending" ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="auth-form__switch">
        Remembered it? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}