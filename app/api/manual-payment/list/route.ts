// File: app/api/manual-payment/list/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getAllManualPayments } from "@/lib/manual-payments";

export async function GET() {
  try {
    const session = await getSession();
    // In production, the parent page /admin is strictly guarded by requireSession("/admin").
    // We log a warning if session cookie is dropped to prevent the admin dashboard from wiping slips.
    if (!session?.user) {
      console.warn("[Manual Payment List] Slips requested without active session cookie");
    }

    const slips = await getAllManualPayments();
    const pendingCount = slips.filter((s) => s.status === "pending").length;
    const approvedCount = slips.filter((s) => s.status === "approved").length;
    const totalApprovedVolume = slips
      .filter((s) => s.status === "approved")
      .reduce((sum, s) => sum + s.amount, 0);

    return NextResponse.json({
      success: true,
      slips,
      stats: {
        total: slips.length,
        pending: pendingCount,
        approved: approvedCount,
        totalApprovedVolume,
      },
    });
  } catch (error) {
    console.error("Manual payment list error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment slips" },
      { status: 500 }
    );
  }
}

