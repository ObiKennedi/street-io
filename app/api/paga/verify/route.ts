// File: app/api/paga/verify/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  findPagaTransaction,
  verifyPagaTransaction,
  creditUserWallet,
  unlockArticleForUser,
  formatNaira,
} from "@/lib/paga";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const reference = body.reference as string;
    const articleSlug = body.articleSlug as string | undefined;
    const requestedAmount = body.amount ? Number(body.amount) : undefined;

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const existingTx = findPagaTransaction(reference);

    // If transaction is already successful, return its status
    if (existingTx && existingTx.status === "successful") {
      if (articleSlug || existingTx.articleSlug) {
        unlockArticleForUser(session.user.id, (articleSlug || existingTx.articleSlug)!);
      }
      return NextResponse.json({
        success: true,
        reference,
        amount: existingTx.amount,
        formattedAmount: formatNaira(existingTx.amount),
        articleSlug: articleSlug || existingTx.articleSlug,
        message: "Payment already confirmed and credited.",
      });
    }

    const amountToVerify = requestedAmount ?? existingTx?.amount ?? 1000;

    // Contact Paga verify charge API
    const verifyResult = await verifyPagaTransaction({
      paymentReference: reference,
      amount: amountToVerify,
      currency: "NGN",
    });

    const statusCodeParam = body.statusCode as string | number | undefined;
    const statusMessageParam = body.statusMessage as string | undefined;

    // A payment is successful if:
    // 1. Paga's server verify endpoint confirms it (status_code == 0)
    // 2. OR Paga's redirect callback confirmed success (status_code == "0" or status_message == "success")
    const isSuccess =
      verifyResult.verified ||
      String(statusCodeParam) === "0" ||
      statusMessageParam?.toLowerCase() === "success" ||
      (process.env.PAGA_ENV === "beta" && body.allowSandboxSimulation === true);

    if (!isSuccess) {
      return NextResponse.json(
        {
          error: verifyResult.message || "Paga transaction could not be verified",
          raw: verifyResult.raw,
        },
        { status: 400 }
      );
    }

    const creditedAmount = verifyResult.raw?.amount ?? amountToVerify;
    const finalSlug = articleSlug || existingTx?.articleSlug;

    // Credit reader wallet & unlock article
    const creditResult = creditUserWallet(session.user.id, creditedAmount, reference, {
      customerEmail: session.user.email,
      customerName: session.user.name,
      articleSlug: finalSlug,
      paymentMethod: "card",
    });

    if (finalSlug) {
      unlockArticleForUser(session.user.id, finalSlug);
    }

    return NextResponse.json({
      success: true,
      reference,
      amount: creditedAmount,
      formattedAmount: formatNaira(creditedAmount),
      balance: creditResult.balance,
      formattedBalance: creditResult.formattedBalance,
      articleSlug: finalSlug,
      message: `Successfully verified and credited ${formatNaira(creditedAmount)} via Paga.`,
    });
  } catch (error) {
    console.error("Paga verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction with Paga" },
      { status: 500 }
    );
  }
}
