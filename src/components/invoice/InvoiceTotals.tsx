import type { Invoice } from "@/types/invoice";
import { formatCurrency } from "@/lib/stripe";

export function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-section">
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span className="tabular-nums">
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tax</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-3 mt-1">
            <span className="font-semibold text-sm tracking-wide uppercase text-neutral-700">
              Total Due
            </span>
            <span className="font-bold text-base tabular-nums">
              {formatCurrency(invoice.totalDue, invoice.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
