import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { sessionCookie } = (await req.json()) as { sessionCookie?: string };
    if (!sessionCookie) {
      return NextResponse.json({ error: "No cookie" }, { status: 401 });
    }
    // checkRevoked=true so sign-out is immediate
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
