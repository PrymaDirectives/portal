import type { InvoiceLineItem } from "@/types/invoice";
import { formatCurrency } from "@/lib/stripe";

export function WorkSummaryTable({
  lineItems,
  currency = "USD",
}: {
  lineItems: InvoiceLineItem[];
  currency?: string;
}) {
  if (lineItems.length === 0) return null;
  return (
    <div className="invoice-section !py-0">
      <table className="invoice-table w-full">
        <thead>
          <tr className="text-left">
            <th className="!pl-6">Item</th>
            <th>Description</th>
            <th className="text-right">Hrs</th>
            <th className="text-right">Rate</th>
            <th className="text-right !pr-6">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((li) => (
            <tr key={li.id}>
              <td className="!pl-6 font-medium whitespace-nowrap">{li.item}</td>
              <td className="text-neutral-500 max-w-xs">{li.description}</td>
              <td className="text-right tabular-nums text-neutral-500">
                {li.hours > 0 ? li.hours : "—"}
              </td>
              <td className="text-right tabular-nums text-neutral-500">
                {li.rate > 0 ? formatCurrency(li.rate, currency) : "—"}
              </td>
              <td className="text-right tabular-nums font-medium !pr-6">
                {formatCurrency(li.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
