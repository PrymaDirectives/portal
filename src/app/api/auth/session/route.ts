import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "__session";
const EXPIRES_IN = 60 * 60 * 24 * 14 * 1000; // 14 days in ms

export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    // Verify the ID token first (throws if invalid/expired)
    await adminAuth.verifyIdToken(idToken);

    // Exchange for a long-lived session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN,
    });

    const res = NextResponse.json({ status: "ok" });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[POST /api/auth/session]", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
