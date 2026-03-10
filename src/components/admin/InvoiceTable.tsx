import Link from "next/link";
import type { Invoice } from "@/types/invoice";
import { StatusBadge } from "@/components/invoice/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/stripe";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm text-neutral-400">No invoices yet.</p>
        <Link
          href="/admin/invoices/new"
          className="mt-4 inline-block text-xs font-medium text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
        >
          Create your first invoice
        </Link>
      </div>
    );
  }

  return (
    <table className="invoice-table w-full">
      <thead>
        <tr className="text-left">
          <th className="!pl-6">Invoice</th>
          <th>Client</th>
          <th>Project</th>
          <th>Due</th>
          <th className="text-right">Amount</th>
          <th className="text-center">Status</th>
          <th className="!pr-6" />
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id}>
            <td className="!pl-6">
              <Link
                href={`/admin/invoices/${inv.id}`}
                className="font-mono text-xs font-medium text-neutral-700 hover:text-neutral-900 transition"
              >
                {inv.invoiceNumber}
              </Link>
            </td>
            <td>
              <p className="text-sm font-medium">{inv.clientName}</p>
              <p className="text-xs text-neutral-400">{inv.clientEmail}</p>
            </td>
            <td className="max-w-[180px]">
              <p className="text-sm truncate">{inv.projectName}</p>
            </td>
            <td className="text-sm whitespace-nowrap">{formatDate(inv.paymentDue)}</td>
            <td className="text-right tabular-nums font-medium text-sm">
              {formatCurrency(inv.totalDue, inv.currency)}
            </td>
            <td className="text-center">
              <StatusBadge status={inv.status} />
            </td>
            <td className="!pr-6 text-right">
              <Link
                href={`/admin/invoices/${inv.id}`}
                className="text-xs text-neutral-400 hover:text-neutral-700 transition"
              >
                View &rarr;
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
