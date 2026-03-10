import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionById, cancelSubscription } from "@/lib/subscription";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const subscription = await getSubscriptionById(id);
    if (!subscription) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("[GET /api/admin/subscriptions/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const subscription = await cancelSubscription(id);
    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("[DELETE /api/admin/subscriptions/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
