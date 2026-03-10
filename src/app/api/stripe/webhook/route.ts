// Placeholder — implemented in Phase 3
// Handles: checkout.session.completed, payment_intent.succeeded,
//          payment_intent.payment_failed
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json({ received: true });
}
