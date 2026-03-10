import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions, createSubscription } from "@/lib/subscription";
import { z } from "zod";

const CreateSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  planName: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().positive(),
  interval: z.enum(["month", "year"]),
});

export async function GET() {
  try {
    const subscriptions = await getAllSubscriptions();
    return NextResponse.json({ subscriptions, total: subscriptions.length });
  } catch (err) {
    console.error("[GET /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const subscription = await createSubscription(parsed.data);
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
