import { auth } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";
import Providers from "./providers";

export const metadata = {
  title: "Admin — Pryma Invoice Portal",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <Providers>
      {session ? (
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
