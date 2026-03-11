import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import AdminNav from "@/components/admin/AdminNav";
import Providers from "./providers";

// Force all admin routes to be server-rendered on demand (no static prerender)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Pryma Invoice Portal",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let isAuthed = false;
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;
    if (session) {
      await adminAuth.verifySessionCookie(session, true);
      isAuthed = true;
    }
  } catch {
    isAuthed = false;
  }
  return (
    <Providers>
      {isAuthed ? (
        <div className="min-h-screen bg-[#f7f6f3]">
          <AdminNav />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
      ) : (
        <>{children}</>
      )}
    </Providers>
  );
}
