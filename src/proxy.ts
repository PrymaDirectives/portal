import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

// Must run in Node.js runtime — firebase-admin is Node-only and the
// self-referential fetch approach causes ERR_SSL_PACKET_LENGTH_TOO_LONG
// on Cloud Run because internal routing returns plain HTTP while the
// client expects TLS.
export const runtime = "nodejs";

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

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.next();
  } catch {
    return unauthorized(req, isAdminApi);
  }
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
