// File: app/api/wallet/fund/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { creditUserWallet, generatePagaReference, formatNaira, unlockArticleForUser } from "@/lib/paga";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const articleSlug = body.articleSlug as string | undefined;

    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Minimum funding amount is ₦100" },
        { status: 400 }
      );
    }

    const reference = generatePagaReference();

    const result = creditUserWallet(session.user.id, amount, reference, {
      customerEmail: session.user.email,
      customerName: session.user.name,
      articleSlug,
    });

    if (articleSlug) {
      unlockArticleForUser(session.user.id, articleSlug);
    }

    return NextResponse.json({
      success: true,
      reference,
      amount,
      balance: result.balance,
      formattedBalance: result.formattedBalance,
      message: `Successfully credited ${formatNaira(amount)} via Paga.`,
    });
  } catch (error) {
    console.error("Wallet funding error:", error);
    return NextResponse.json(
      { error: "Failed to process Paga transaction" },
      { status: 500 }
    );
  }
}
