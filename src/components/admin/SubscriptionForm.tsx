"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscriptionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState<"month" | "year">("month");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      clientName: fd.get("clientName") as string,
      clientEmail: fd.get("clientEmail") as string,
      planName: fd.get("planName") as string,
      description: fd.get("description") as string,
      amount: Number(amount),
      interval,
    };

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Failed to create subscription. Check all fields and try again.");
        setLoading(false);
        return;
      }

      router.push("/admin/subscriptions");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-100 transition";
  const labelCls = "invoice-label block mb-1.5";

  const monthlyTotal = Number(amount) || 0;
  const yearlyEquivalent = interval === "month" ? monthlyTotal * 12 : monthlyTotal;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Client info */}
      <div>
        <p className="invoice-label mb-3">Client</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Client / Brand Name <span className="text-red-400">*</span>
            </label>
            <input
              name="clientName"
              required
              placeholder="e.g. Crescent Creative"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Client Email <span className="text-red-400">*</span>
            </label>
            <input
              name="clientEmail"
              type="email"
              required
              placeholder="client@example.com"
              className={inputCls}
            />
            <p className="mt-1 text-xs text-neutral-400">
              Used to look up or create a Stripe customer
            </p>
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Plan details */}
      <div>
        <p className="invoice-label mb-3">Subscription Plan</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>
              Plan Name <span className="text-red-400">*</span>
            </label>
            <input
              name="planName"
              required
              placeholder="e.g. Monthly Retainer — Brand Strategy"
              className={inputCls}
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              name="description"
              rows={2}
              className={inputCls}
              placeholder="What's included in this plan…"
            />
          </div>
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Pricing */}
      <div>
        <p className="invoice-label mb-3">Pricing</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Amount (USD) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                $
              </span>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputCls} pl-6`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Billing Interval</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInterval("month")}
                className={`flex-1 rounded-sm border py-2 text-sm font-medium transition ${
                  interval === "month"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setInterval("year")}
                className={`flex-1 rounded-sm border py-2 text-sm font-medium transition ${
                  interval === "year"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
        {monthlyTotal > 0 && (
          <div className="mt-4 rounded-sm bg-neutral-50 border border-neutral-100 px-4 py-3">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">
                ${monthlyTotal.toFixed(2)} / {interval}
              </span>
              {interval === "month" && (
                <span className="ml-2 text-neutral-400">
                  — ${yearlyEquivalent.toFixed(2)}/year
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Stripe note */}
      <div className="rounded-sm bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs text-blue-700 font-medium mb-1">Stripe Integration</p>
        <p className="text-xs text-blue-600">
          When Stripe keys are configured, this will automatically create a Stripe Customer,
          Product, Price, and Subscription. The client will receive a payment link via Stripe
          Billing. Without keys, the subscription is tracked manually.
        </p>
      </div>

      {error && (
        <p className="rounded-sm bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-neutral-900 px-6 py-3 text-sm font-semibold text-white tracking-wide transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create Subscription"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-sm border border-neutral-200 px-5 py-3 text-sm text-neutral-600 hover:border-neutral-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
