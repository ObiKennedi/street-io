// File: app/(dashboard)/dashboard/wallet/fund/page.tsx
import { redirect } from "next/navigation";

export const instant = false;

type Props = {
  searchParams: Promise<{ article?: string; amount?: string }>;
};

export default async function WalletFundPage({ searchParams }: Props) {
  const { article, amount } = await searchParams;

  const query = new URLSearchParams();
  if (article) query.set("article", article);
  if (amount) query.set("amount", amount);

  const qs = query.toString();
  redirect(qs ? `/checkout/paga?${qs}` : "/checkout/paga");
}
