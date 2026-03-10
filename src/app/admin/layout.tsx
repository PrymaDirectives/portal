import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import Providers from "./providers";

export const metadata = {
  title: "Admin — Pryma Invoice Portal",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <Providers>
      <div className="min-h-screen bg-[#f7f6f3]">
        <AdminNav />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </div>
    </Providers>
  );
}
