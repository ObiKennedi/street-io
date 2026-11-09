// File: app/api/manual-payment/approve/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { approveManualPayment } from "@/lib/manual-payments";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const slipId = body.slipId as string;

    if (!slipId) {
      return NextResponse.json({ error: "Slip ID is required" }, { status: 400 });
    }

    const adminName = session.user.name || session.user.email || "Admin";
    const result = await approveManualPayment(slipId, adminName);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      slip: result.slip,
      message: "Payment slip approved and reader access granted.",
    });
  } catch (error) {
    console.error("Approve manual payment error:", error);
    return NextResponse.json(
      { error: "Failed to approve payment slip." },
      { status: 500 }
    );
  }
}

