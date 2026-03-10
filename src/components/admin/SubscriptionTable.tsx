"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Subscription } from "@/types/template";
import { formatCurrency } from "@/lib/stripe";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trialing: "bg-blue-50 text-blue-700 border-blue-200",
  past_due: "bg-amber-50 text-amber-700 border-amber-200",
  canceled: "bg-neutral-50 text-neutral-500 border-neutral-200",
  incomplete: "bg-orange-50 text-orange-700 border-orange-200",
  incomplete_expired: "bg-neutral-50 text-neutral-400 border-neutral-200",
  unpaid: "bg-red-50 text-red-700 border-red-200",
};

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-neutral-50 text-neutral-500 border-neutral-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function SubscriptionTable({ subscriptions }: { subscriptions: Subscription[] }) {
  const router = useRouter();
  const [canceling, setCanceling] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState<string | null>(null);

  async function handleCancel(id: string, planName: string) {
    if (!confirm(`Cancel subscription "${planName}"? This will also cancel it in Stripe if configured.`))
      return;
    setCanceling(id);
    await fetch(`/api/admin/subscriptions/${id}`, { method: "DELETE" });
    setCanceling(null);
    router.refresh();
  }

  async function handlePortal(id: string, customerId: string) {
    setOpeningPortal(id);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        window.open(data.url, "_blank");
      } else {
        alert("Could not open Stripe portal. Make sure Stripe is configured.");
      }
    } finally {
      setOpeningPortal(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-neutral-200 py-16 text-center">
        <p className="text-sm text-neutral-400">No subscriptions yet.</p>
      </div>
    );
  }

  // Summary stats
  const active = subscriptions.filter((s) => s.status === "active" || s.status === "trialing");
  const mrr = active
    .reduce((sum, s) => sum + (s.interval === "year" ? s.amount / 12 : s.amount), 0);

  return (
    <div className="space-y-4">
      {/* MRR summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-sm border border-neutral-100 bg-white px-4 py-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Active</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{active.length}</p>
        </div>
        <div className="rounded-sm border border-neutral-100 bg-white px-4 py-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Est. MRR</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{formatCurrency(mrr)}</p>
        </div>
        <div className="rounded-sm border border-neutral-100 bg-white px-4 py-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Total</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{subscriptions.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-neutral-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                Next Billing
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 bg-white">
            {subscriptions.map((s) => (
              <tr key={s.id} className="group hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-medium text-neutral-900">{s.clientName}</p>
                  <p className="text-xs text-neutral-400">{s.clientEmail}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-neutral-800">{s.planName}</p>
                  {s.description && (
                    <p className="text-xs text-neutral-400 truncate max-w-[200px]">{s.description}</p>
                  )}
                </td>
                <td className="px-4 py-4 tabular-nums">
                  <span className="font-medium text-neutral-900">
                    {formatCurrency(s.amount)}
                  </span>
                  <span className="text-xs text-neutral-400"> /{s.interval}</span>
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-4 text-neutral-500">
                  {s.currentPeriodEnd
                    ? new Date(s.currentPeriodEnd).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {s.stripeCustomerId && s.status !== "canceled" && (
                      <button
                        onClick={() => handlePortal(s.id, s.stripeCustomerId!)}
                        disabled={openingPortal === s.id}
                        className="text-xs text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
                      >
                        {openingPortal === s.id ? "Opening…" : "Portal"}
                      </button>
                    )}
                    {s.status !== "canceled" && (
                      <button
                        onClick={() => handleCancel(s.id, s.planName)}
                        disabled={canceling === s.id}
                        className="text-xs text-neutral-300 hover:text-red-500 transition disabled:opacity-50"
                      >
                        {canceling === s.id ? "Canceling…" : "Cancel"}
                      </button>
                    )}
                    {s.status === "canceled" && s.canceledAt && (
                      <span className="text-xs text-neutral-300">
                        Canceled{" "}
                        {new Date(s.canceledAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
