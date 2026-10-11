// File: component/admin/AdminHeader.tsx
"use client";

import Link from "next/link";

type AdminHeaderProps = {
  onPublishClick: () => void;
};

export function AdminHeader({ onPublishClick }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <div className="admin-header__badges">
          <span className="admin-header__clearance">
            <span className="admin-header__live-dot" aria-hidden="true" />
            ADMIN CONSOLE · CLEARANCE L4
          </span>
        </div>
        <h1 className="admin-header__title">Executive Command Center</h1>
        <p className="admin-header__subtitle">
          Manage paywalled operational playbooks, set Naira pricing, moderate user compliance, and track sold revenues.
        </p>
      </div>

      <div className="admin-header__actions">
        <Link href="/dashboard" className="admin-header__reader-link">
          ← Reader View
        </Link>
        <button
          type="button"
          onClick={onPublishClick}
          className="admin-header__publish-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Publish Article
        </button>
      </div>
    </header>
  );
}
