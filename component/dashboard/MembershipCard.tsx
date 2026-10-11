// File: component/dashboard/MembershipCard.tsx
import Link from "next/link";

import type { Membership, Wallet } from "@/lib/dashboard";
import { CategoryIcon } from "./CategoryIcon";

type WalletCardProps = {
  wallet?: Wallet | null;
  membership?: Membership | null;
};

export function WalletCard({ wallet }: WalletCardProps) {
  const displayBalance = wallet?.formattedBalance ?? "₦0.00";

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
            Fund your wallet with Paga (₦) to purchase and unlock paid educational guides.
          </p>
        </div>

        <span className="dash-membership__status dash-membership__status--active">
          Active
        </span>
      </div>

      <div className="dash-membership__actions">
        <Link
          href="/checkout/paga"
          className="dash-membership__btn dash-membership__btn--primary"
        >
          Fund
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