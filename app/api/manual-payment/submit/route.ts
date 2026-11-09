// File: app/api/manual-payment/submit/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { submitManualPayment, MANUAL_PAYMENT_CONFIG } from "@/lib/manual-payments";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const receiptUrl = body.receiptUrl as string;
    const receiptPublicId = body.receiptPublicId as string | undefined;
    const senderName = body.senderName as string | undefined;
    const purpose = (body.purpose as "wallet_funding" | "article_purchase") || "wallet_funding";
    const articleSlug = body.articleSlug as string | undefined;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    if (!receiptUrl || typeof receiptUrl !== "string") {
      return NextResponse.json(
        { error: "Payment receipt image is required." },
        { status: 400 }
      );
    }

    const slip = await submitManualPayment({
      userId: session.user.id,
      userName: session.user.name || "Reader",
      userEmail: session.user.email || "",
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

