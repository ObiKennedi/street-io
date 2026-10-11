import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/component/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password · streetio" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="auth-shell__title">
        Forgot your <span>password?</span>
      </h1>
      <p className="auth-shell__lead">
        Enter the email on your account and we&rsquo;ll send you a link to choose a new one.
      </p>
      <ForgotPasswordForm />
    </>
  );
}