// File: component/dashboard/ProfileView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import type { Wallet } from "@/lib/dashboard";
import { CategoryIcon } from "./CategoryIcon";
import "./profile.scss";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  createdAt?: Date | string | null;
};

type ProfileViewProps = {
  user: ProfileUser;
  wallet: Wallet;
};

export function ProfileView({ user, wallet }: ProfileViewProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Member Header Card */}
      <section className="profile-card" aria-label="Member details">
        <div className="profile-card__avatar-wrap">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={96}
              height={96}
              className="profile-card__avatar-img"
              unoptimized
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="profile-card__info">
          <div className="profile-card__badge-row">
            <span className="profile-card__tier-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Reader
            </span>
            {user.role && user.role !== "user" && (
              <span className="profile-card__tier-badge" style={{ background: "#FEF3C7", borderColor: "#FDE68A", color: "#92400E" }}>
                {user.role.toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="profile-card__name">{user.name || "Reader Member"}</h1>
          <p className="profile-card__email">{user.email}</p>

          <div className="profile-card__meta">
            <span>MEMBER ID: #{user.id.slice(-6).toUpperCase()}</span>
            <span>•</span>
            <span>SECURE CLEARANCE LEVEL 1</span>
          </div>
        </div>
      </section>

      {/* Reader Wallet Card */}
      <section className="profile-wallet" aria-label="Reader wallet balance and funding">
        <div className="profile-wallet__top">
          <span className="profile-wallet__label">READER WALLET</span>
          <span className="profile-wallet__gateway-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            PAGA DIRECT
          </span>
        </div>

        <div className="profile-wallet__balance-row">
          <span className="profile-wallet__amount">{wallet.formattedBalance}</span>
          <span className="profile-wallet__currency">{wallet.currency} NGN</span>
        </div>

        <p className="profile-wallet__subtext">
          Instant micro-payment balance used to unlock pay-to-access operational guides and situational playbooks.
        </p>

        <div className="profile-wallet__actions">
          <Link href="/checkout/paga" className="profile-wallet__fund-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Fund Wallet via Paga
          </Link>
          <Link href="/checkout/paga" className="profile-wallet__history-btn">
            Checkout History
          </Link>
        </div>
      </section>

      {/* Reading Intel Stats */}
      <section className="profile-stats-grid" aria-label="Account reading metrics">
        <div className="profile-stats-grid__item">
          <span className="profile-stats-grid__value">25</span>
          <span className="profile-stats-grid__label">Available Topics</span>
        </div>
        <div className="profile-stats-grid__item">
          <span className="profile-stats-grid__value">NGN (₦)</span>
          <span className="profile-stats-grid__label">Default Currency</span>
        </div>
        <div className="profile-stats-grid__item">
          <span className="profile-stats-grid__value">100%</span>
          <span className="profile-stats-grid__label">Field Verified</span>
        </div>
      </section>

      {/* Quick Navigation Hub */}
      <section className="profile-section" aria-label="Platform destinations">
        <h2 className="profile-section__title">Navigation & Intelligence Hubs</h2>
        <ul className="profile-section__list">
          <li>
            <Link href="/new" className="profile-section__row">
              <div className="profile-section__row-left">
                <span className="profile-section__row-icon">
                  <CategoryIcon name="sparkles" size={18} />
                </span>
                <div>
                  <div className="profile-section__row-title">Latest Uploads</div>
                  <div className="profile-section__row-desc">Newly uploaded operational playbooks and briefs</div>
                </div>
              </div>
              <span className="profile-section__row-right">
                View feed →
              </span>
            </Link>
          </li>
          <li>
            <Link href="/trending" className="profile-section__row">
              <div className="profile-section__row-left">
                <span className="profile-section__row-icon">
                  <CategoryIcon name="trending" size={18} />
                </span>
                <div>
                  <div className="profile-section__row-title">Trending Leaderboard</div>
                  <div className="profile-section__row-desc">Most read operational guides with weekly & monthly filters</div>
                </div>
              </div>
              <span className="profile-section__row-right">
                View trends →
              </span>
            </Link>
          </li>
          <li>
            <Link href="/explore" className="profile-section__row">
              <div className="profile-section__row-left">
                <span className="profile-section__row-icon">
                  <CategoryIcon name="compass" size={18} />
                </span>
                <div>
                  <div className="profile-section__row-title">Explore All Categories</div>
                  <div className="profile-section__row-desc">Search through all 25 operational subject areas</div>
                </div>
              </div>
              <span className="profile-section__row-right">
                Browse catalog →
              </span>
            </Link>
          </li>
          {user.role && (user.role === "admin" || user.role === "owner") && (
            <li>
              <Link href="/admin/dashboard" className="profile-section__row" style={{ background: "var(--color-steel-50)" }}>
                <div className="profile-section__row-left">
                  <span className="profile-section__row-icon" style={{ background: "var(--brand-charcoal)", color: "#FFFFFF" }}>
                    <CategoryIcon name="sparkles" size={18} />
                  </span>
                  <div>
                    <div className="profile-section__row-title">Admin Command Center</div>
                    <div className="profile-section__row-desc">Upload articles, set pricing, block policy violators & track revenue</div>
                  </div>
                </div>
                <span className="profile-section__row-right" style={{ fontWeight: "bold", color: "#059669" }}>
                  Open console →
                </span>
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* Danger Zone / Sign Out */}
      <section className="profile-danger-zone" aria-label="Session termination">
        <div className="profile-danger-zone__top">
          <div className="profile-danger-zone__info">
            <h2 className="profile-danger-zone__title">Account Session</h2>
            <p className="profile-danger-zone__desc">Terminate your active session on this device.</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="profile-danger-zone__signout-btn"
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfileView;
