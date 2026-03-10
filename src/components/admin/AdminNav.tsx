"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#e8e6e1] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin/invoices" className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-900">
            Pryma
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/admin/invoices"
              className={`text-xs font-medium transition ${
                pathname.startsWith("/admin/invoices")
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Invoices
            </Link>
            <Link
              href="/admin/templates"
              className={`text-xs font-medium transition ${
                pathname.startsWith("/admin/templates")
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Templates
            </Link>
            <Link
              href="/admin/subscriptions"
              className={`text-xs font-medium transition ${
                pathname.startsWith("/admin/subscriptions")
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Subscriptions
            </Link>
          </nav>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-xs text-neutral-400 hover:text-neutral-700 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
