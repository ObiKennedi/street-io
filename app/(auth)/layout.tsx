// File: app/(auth)/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";

import Logo from "@/component/Logo";
import "./auth.scss";

export const metadata: Metadata = {
  robots: { index: false },
};

export const instant = false;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="auth-shell">
      <div className="auth-shell__bg" aria-hidden="true">
        <span className="auth-shell__arc auth-shell__arc--1" />
        <span className="auth-shell__arc auth-shell__arc--2" />
        <span className="auth-shell__arc auth-shell__arc--3" />
      </div>

      <section className="auth-shell__card">
        <Link href="/" className="auth-shell__logo logo" aria-label="streetio home">
          <Logo />
        </Link>
        {children}
      </section>
    </main>
  );
}