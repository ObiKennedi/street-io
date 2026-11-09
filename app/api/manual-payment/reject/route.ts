// File: app/api/manual-payment/reject/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rejectManualPayment } from "@/lib/manual-payments";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const slipId = body.slipId as string;
    const reason = (body.reason as string) || "Payment not seen in bank account.";

    if (!slipId) {
      return NextResponse.json({ error: "Slip ID is required" }, { status: 400 });
    }

    const adminName = session.user.name || session.user.email || "Admin";
    const result = await rejectManualPayment(slipId, reason, adminName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      slip: result.slip,
      message: "Payment slip marked as rejected.",
    });
  } catch (error) {
    console.error("Reject manual payment error:", error);
    return NextResponse.json(
      { error: "Failed to reject payment slip." },
      { status: 500 }
    );
  }
}

