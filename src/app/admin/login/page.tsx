"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/invoices";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials. Check your admin email and password.");
      setLoading(false);
    } else {
      router.push(callbackUrl as never);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-neutral-900">
            Pryma
          </p>
          <p className="mt-1 text-xs text-neutral-400 tracking-wide">Invoice Portal — Admin</p>
        </div>

        {/* Card */}
        <div className="invoice-sheet rounded-sm p-8">
          <h1 className="text-base font-semibold text-neutral-800 mb-6">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="invoice-label block mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 transition"
                placeholder="admin@pryma.tech"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="invoice-label block mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-200 transition"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="rounded-sm bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-neutral-900 px-4 py-3 text-sm font-semibold text-white tracking-wide transition hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
