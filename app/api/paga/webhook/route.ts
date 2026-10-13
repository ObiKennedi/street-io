// File: app/api/paga/webhook/route.ts
import { NextResponse } from "next/server";
import {
  findPagaTransaction,
  creditUserWallet,
  verifyPagaWebhookHash,
  unlockArticleForUser,
} from "@/lib/paga";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      statusCode,
      paymentReference,
      amount,
      timeStamp,
      customerEmail,
      customerName,
      hash,
    } = payload;

    if (!paymentReference) {
      return NextResponse.json(
        { error: "paymentReference is missing" },
        { status: 400 }
      );
    }

    // Verify hash integrity if HMAC is set
    if (hash && timeStamp && amount) {
      const isValid = verifyPagaWebhookHash({
        amount,
        timeStamp,
        paymentReference,
        hash,
      });

      if (!isValid) {
        console.warn("Paga webhook hash mismatch:", paymentReference);
        return NextResponse.json({ error: "Invalid hash signature" }, { status: 401 });
      }
    }

    const isSuccess = String(statusCode) === "0" || payload.statusMessage?.toLowerCase() === "success";

    if (!isSuccess) {
      return NextResponse.json({ message: "Transaction not successful, ignored" }, { status: 200 });
    }

    const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
    const existingTx = findPagaTransaction(paymentReference);

    if (existingTx) {
      creditUserWallet(existingTx.userId, numericAmount, paymentReference, {
        customerEmail: customerEmail || existingTx.customerEmail,
        customerName: customerName || existingTx.customerName,
        articleSlug: existingTx.articleSlug,
        paymentMethod: "card",
      });

      if (existingTx.articleSlug) {
        unlockArticleForUser(existingTx.userId, existingTx.articleSlug);
      }
    }

    return NextResponse.json({ status: "success", received: true }, { status: 200 });
  } catch (error) {
    console.error("Paga webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
