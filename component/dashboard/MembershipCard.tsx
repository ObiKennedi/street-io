// File: component/dashboard/MembershipCard.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Membership, Wallet } from "@/lib/dashboard";
import { CategoryIcon } from "./CategoryIcon";

type WalletCardProps = {
  wallet?: Wallet | null;
  membership?: Membership | null;
};

export function WalletCard({ wallet: initialWallet }: WalletCardProps) {
  const [wallet, setWallet] = useState<Wallet | null>(initialWallet ?? null);

  // Sync state if initialWallet prop changes
  useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet);
    }
  }, [initialWallet]);

  // If there is a pending payment transfer, poll the wallet balance endpoint every 5s
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const checkBalance = async () => {
      try {
        const res = await fetch("/api/wallet/balance");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.wallet) {
            setWallet((prev) => ({
              ...prev,
              balance: data.wallet.balance,
              currency: data.wallet.currency,
              formattedBalance: data.wallet.formattedBalance,
              pendingAmount: data.wallet.pendingAmount,
              formattedPendingAmount: data.wallet.formattedPendingAmount,
              hasPending: data.wallet.hasPending,
            }));
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    // If there is a pending transfer, poll to catch instant admin approvals
    if (wallet?.hasPending) {
      timer = setInterval(checkBalance, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [wallet?.hasPending]);

  const displayBalance = wallet?.formattedBalance ?? "₦0.00";
  const hasPending = Boolean(wallet?.hasPending && wallet?.pendingAmount && wallet.pendingAmount > 0);
  const hasActiveBalance = Boolean(wallet?.balance && wallet.balance > 0);

  return (
    <section className="dash-membership dash-wallet" aria-labelledby="dash-wallet-label">
      <div className="dash-membership__top">
        <div>
          <div className="dash-wallet__tag">
            <CategoryIcon name="wallet" size={14} />
            <p id="dash-wallet-label" className="dash-membership__label">
              Reader Wallet (NGN)
            </p>
          </div>
          <p className="dash-membership__plan dash-wallet__balance">
            {displayBalance}
          </p>
          <p className="dash-membership__meta">
            Fund your reader wallet via bank transfer to purchase and unlock paid educational guides.
          </p>
        </div>

        {hasPending && !hasActiveBalance ? (
          <span className="dash-membership__status dash-membership__status--pending">
            Transfer Pending
          </span>
        ) : hasActiveBalance ? (
          <span className="dash-membership__status dash-membership__status--active">
            Active
          </span>
        ) : (
          <span className="dash-membership__status dash-membership__status--idle">
            Ready to Fund
          </span>
        )}
      </div>

      {hasPending && (
        <div className="dash-wallet__pending-notice">
          <div className="dash-wallet__pending-icon">⏳</div>
          <div className="dash-wallet__pending-details">
            <p className="dash-wallet__pending-title">
              {wallet?.formattedPendingAmount} transfer pending verification
            </p>
            <p className="dash-wallet__pending-sub">
              Your payment receipt has been submitted. The admin team has been notified and will verify your transfer shortly.
            </p>
          </div>
          <span className="dash-wallet__pending-badge">Under Review</span>
        </div>
      )}

      <div className="dash-membership__actions">
        <Link
          href="/checkout/paga"
          className="dash-membership__btn dash-membership__btn--primary"
        >
          {hasPending ? "Upload Another Slip" : "Fund"}
        </Link>
        <Link href="/explore" className="dash-membership__btn dash-membership__btn--ghost">
          Buy Articles
        </Link>
      </div>
    </section>
  );
}

// Alias for backwards compatibility with any existing imports
export const MembershipCard = WalletCard;
