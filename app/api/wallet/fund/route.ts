// File: app/api/wallet/fund/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { formatNaira } from "@/lib/paga";
import { MANUAL_PAYMENT_CONFIG } from "@/lib/manual-payments";

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

    const origin =
      req.headers.get("origin") ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    const checkoutUrl = `${origin}/checkout/paga?amount=${amount}${
      articleSlug ? `&article=${encodeURIComponent(articleSlug)}` : ""
    }`;

    return NextResponse.json({
      success: true,
      amount,
      formattedAmount: formatNaira(amount),
      checkoutUrl,
      bankDetails: MANUAL_PAYMENT_CONFIG,
      message: `Direct bank transfer initialized. Transfer to ${MANUAL_PAYMENT_CONFIG.bankName} (${MANUAL_PAYMENT_CONFIG.accountNumber} - ${MANUAL_PAYMENT_CONFIG.accountName}) and upload your payment slip.`,
    });
  } catch (error) {
    console.error("Wallet funding initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize wallet funding" },
      { status: 500 }
    );
  }
}
