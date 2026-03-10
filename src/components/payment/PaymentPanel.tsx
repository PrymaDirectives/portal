"use client";

import { useState } from "react";
import type { Invoice, InvoiceStatus } from "@/types/invoice";
import { formatCurrency } from "@/lib/stripe";

const paidStatuses: InvoiceStatus[] = ["paid"];
const payableStatuses: InvoiceStatus[] = ["unpaid", "open", "overdue", "failed"];
const voidStatuses: InvoiceStatus[] = ["void"];

export function PaymentPanel({ invoice }: { invoice: Invoice }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = paidStatuses.includes(invoice.status);
  const isPayable = payableStatuses.includes(invoice.status);
  const isVoid = voidStatuses.includes(invoice.status);
  const isProcessing = invoice.status === "processing";

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicInvoiceId: invoice.publicInvoiceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // ─── Paid ────────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className="invoice-section bg-[#f0fdf4]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm">
            ✓
          </span>
          <div>
            <p className="font-semibold text-emerald-800 text-sm">Payment received</p>
            {invoice.paidAt && (
              <p className="text-xs text-emerald-600">
                Paid on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(invoice.paidAt))}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Void ────────────────────────────────────────────────────────────────
  if (isVoid) {
    return (
      <div className="invoice-section">
        <p className="text-sm text-neutral-400">This invoice has been voided.</p>
      </div>
    );
  }

  // ─── Processing ──────────────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="invoice-section">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
          <p className="text-sm text-neutral-500">Payment is processing…</p>
        </div>
      </div>
    );
  }

  // ─── Payable ─────────────────────────────────────────────────────────────
  if (isPayable) {
    return (
      <div className="invoice-section bg-neutral-50">
        {invoice.status === "overdue" && (
          <div className="mb-4 rounded-sm bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-xs font-medium text-red-700">
              This invoice is past due. Please arrange payment at your earliest convenience.
            </p>
          </div>
        )}
        {invoice.status === "failed" && (
          <div className="mb-4 rounded-sm bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs font-medium text-amber-700">
              Your previous payment attempt was unsuccessful. Please try again.
            </p>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-sm bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-sm bg-neutral-900 px-6 py-4 text-sm font-semibold text-white tracking-wide transition hover:bg-neutral-800 active:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Redirecting to payment…
            </>
          ) : (
            <>
              Pay {formatCurrency(invoice.totalDue, invoice.currency)}
              <span className="opacity-60">→</span>
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Secured by Stripe &middot; Your payment info is never stored by Pryma
        </p>
      </div>
    );
  }

  return null;
}
