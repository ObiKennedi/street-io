// File: app/api/wallet/fund/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  generatePagaReference,
  buildPagaCheckoutUrl,
  registerPendingPagaTransaction,
  formatNaira,
} from "@/lib/paga";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const articleSlug = body.articleSlug as string | undefined;
    const phoneNumber = body.phoneNumber as string | undefined;

    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Minimum funding amount is ₦100" },
        { status: 400 }
      );
    }

    const reference = generatePagaReference();
    const origin =
      req.headers.get("origin") ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    // Paga redirect destination after payment completes on gateway
    const chargeUrl = `${origin}/checkout/paga?reference=${encodeURIComponent(
      reference
    )}${articleSlug ? `&article=${encodeURIComponent(articleSlug)}` : ""}`;

    // Paga server-to-server webhook callback
    const callbackUrl = `${origin}/api/paga/webhook`;

    // Register pending transaction in system
    registerPendingPagaTransaction({
      reference,
      userId: session.user.id,
      amount,
      currency: "NGN",
      paymentMethod: "card",
      customerEmail: session.user.email,
      customerName: session.user.name,
      articleSlug,
    });

    // Build real Paga live checkout link with public key
    const checkoutUrl = buildPagaCheckoutUrl({
      amount,
      paymentReference: reference,
      email: session.user.email,
      phoneNumber,
      chargeUrl,
      callbackUrl,
    });

    return NextResponse.json({
      success: true,
      reference,
      checkoutUrl,
      amount,
      formattedAmount: formatNaira(amount),
      chargeUrl,
      message: `Paga checkout initialized for ${formatNaira(amount)}.`,
    });
  } catch (error) {
    console.error("Wallet funding initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize live Paga transaction" },
      { status: 500 }
    );
  }
}
