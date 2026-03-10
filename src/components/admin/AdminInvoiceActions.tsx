"use client";

import { useState } from "react";
import type { Invoice } from "@/types/invoice";

export function AdminInvoiceActions({
  invoice,
  publicUrl,
}: {
  invoice: Invoice;
  publicUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionResult, setSessionResult] = useState<string | null>(null);

  function copyLink() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function regenerateSession() {
    setSessionLoading(true);
    setSessionResult(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicInvoiceId: invoice.publicInvoiceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        setSessionResult(`Stripe session created: ${data.url.slice(0, 48)}…`);
      } else {
        setSessionResult(data.error ?? "Failed to create session.");
      }
    } catch {
      setSessionResult("Something went wrong.");
    }
    setSessionLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {invoice.pdfUrl && (
        <a
          href={invoice.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-500 hover:text-neutral-800 transition underline underline-offset-2"
        >
          PDF
        </a>
      )}
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-neutral-500 hover:text-neutral-800 transition"
      >
        View public ↗
      </a>
      <button
        onClick={copyLink}
        className="text-xs text-neutral-500 hover:text-neutral-800 transition"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      {invoice.status !== "paid" && invoice.status !== "void" && (
        <button
          onClick={regenerateSession}
          disabled={sessionLoading}
          className="rounded-sm border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:border-neutral-400 hover:text-neutral-800 transition disabled:opacity-50"
        >
          {sessionLoading ? "…" : "Regenerate Stripe session"}
        </button>
      )}
      {sessionResult && (
        <span className="text-xs text-neutral-400 max-w-xs truncate">{sessionResult}</span>
      )}
    </div>
  );
}
