// File: components/auth/ResetPasswordForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { resetPassword } from "@/lib/auth-client";
import { PasswordField } from "./PasswordField";
import "./auth-form.scss";

type Status = "idle" | "pending" | "done" | "mismatch" | "invalid" | "error";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(token ? "idle" : "invalid");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== String(form.get("confirm"))) {
      setStatus("mismatch");
      return;
    }

    setStatus("pending");
    const { error } = await resetPassword({ newPassword, token });

    if (!error) setStatus("done");
    else if (error.code === "INVALID_TOKEN") setStatus("invalid");
    else setStatus("error");
  }

  if (status === "done") {
    return (
      <div className="auth-form">
        <div className="auth-form__notice auth-form__notice--success" role="status">
          <strong>Password updated.</strong> You&rsquo;ve been signed out on other devices. Log in
          with your new password.
        </div>
        <Link href="/login" className="auth-form__submit">
          Log in
        </Link>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="auth-form">
        <div className="auth-form__notice" role="alert">
          <strong>This link has expired or was already used.</strong> Reset links last 1 hour and
          work once.
        </div>
        <Link href="/forgot-password" className="auth-form__submit">
          Get a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <form className="auth-form__form" onSubmit={handleSubmit}>
        {(status === "mismatch" || status === "error") && (
          <p className="auth-form__error" role="alert">
            {status === "mismatch"
              ? "Those passwords don't match."
              : "We couldn't update your password. Please try again."}
          </p>
        )}

        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
        />
        <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" minLength={8} />

        <button
          type="submit"
          className="auth-form__submit"
          disabled={status === "pending"}
          aria-busy={status === "pending"}
        >
          {status === "pending" ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}