import type { Invoice } from "@/types/invoice";

export function BillTo({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-section">
      <p className="invoice-label mb-3">Bill To</p>
      <div className="space-y-1">
        <p className="invoice-value font-semibold text-base">{invoice.clientName}</p>
        {invoice.clientContact && (
          <p className="invoice-value text-neutral-500">{invoice.clientContact}</p>
        )}
        <p className="invoice-value text-neutral-500">{invoice.clientEmail}</p>
      </div>
    </div>
  );
}
