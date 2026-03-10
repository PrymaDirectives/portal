import { NextRequest, NextResponse } from "next/server";
import { createPortalSession } from "@/lib/subscription";
import { z } from "zod";

const PortalSchema = z.object({
  customerId: z.string().min(1),
  returnUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PortalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const returnUrl = parsed.data.returnUrl ?? `${protocol}://${host}/admin/subscriptions`;

    const url = await createPortalSession(parsed.data.customerId, returnUrl);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
