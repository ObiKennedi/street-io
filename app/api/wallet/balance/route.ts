// File: app/api/wallet/balance/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { resolveUserWalletState } from "@/lib/manual-payments";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await resolveUserWalletState(
      session.user.id,
      session.user.email
    );

    return NextResponse.json({
      success: true,
      wallet,
    });
  } catch (error) {
    console.error("Wallet balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wallet balance." },
      { status: 500 }
    );
  }
}

