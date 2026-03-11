import { NextRequest, NextResponse } from "next/server";

/**
 * Auth middleware — verifies Firebase session cookie via the Admin SDK.
 * We call the /api/auth/verify edge-compatible helper rather than
 * importing firebase-admin directly (firebase-admin is Node-only).
 */
export async function proxy(req: NextRequest) {
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/admin") &&
    req.nextUrl.pathname !== "/admin/login";
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApi) return NextResponse.next();

  const sessionCookie = req.cookies.get("__session")?.value;

  if (!sessionCookie) {
    return unauthorized(req, isAdminApi);
  }

  // Verify session cookie by calling our own internal verify endpoint
  const verifyUrl = new URL("/api/auth/verify", req.nextUrl.origin);
  const verifyRes = await fetch(verifyUrl.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionCookie }),
  });

  if (!verifyRes.ok) {
    return unauthorized(req, isAdminApi);
  }

  return NextResponse.next();
}

function unauthorized(req: NextRequest, isApi: boolean) {
  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.nextUrl);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/((?!login).*)", "/api/admin/:path*"],
};
