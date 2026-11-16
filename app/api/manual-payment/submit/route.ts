// File: app/api/manual-payment/submit/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { submitManualPayment, MANUAL_PAYMENT_CONFIG } from "@/lib/manual-payments";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    const amount = Number(body.amount);
    const receiptUrl = body.receiptUrl as string;
    const receiptPublicId = body.receiptPublicId as string | undefined;
    const senderName = body.senderName as string | undefined;
    const purpose = (body.purpose as "wallet_funding" | "article_purchase") || "wallet_funding";
    const articleSlug = body.articleSlug as string | undefined;

    // Resolve user credentials from session or payload
    const customerEmail = (session?.user?.email || body.customerEmail || "").trim();
    const customerName = (session?.user?.name || body.customerName || body.senderName || "Reader").trim();
    const userId =
      session?.user?.id ||
      (customerEmail ? `user_${customerEmail.toLowerCase().replace(/[^a-z0-9]/g, "_")}` : `user_${Date.now()}`);

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    if (purpose === "wallet_funding" && amount < 5000) {
      return NextResponse.json(
        { error: "Minimum wallet deposit amount is ₦5,000." },
        { status: 400 }
      );
    }

    if (!receiptUrl || typeof receiptUrl !== "string") {
      return NextResponse.json(
        { error: "Payment receipt image is required." },
        { status: 400 }
      );
    }

    const slip = await submitManualPayment({
      userId,
      userName: customerName,
      userEmail: customerEmail,
      amount,
      receiptUrl,
      receiptPublicId,
      senderName,
      purpose,
      articleSlug,
    });

    return NextResponse.json({
      success: true,
      slip,
      message:
        "Your payment slip has been uploaded successfully! The admin has been alerted and will verify your transfer shortly.",
    });
  } catch (error) {
    console.error("Manual payment submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment receipt." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    bankDetails: MANUAL_PAYMENT_CONFIG,
  });
}
