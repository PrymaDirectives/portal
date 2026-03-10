import type { Invoice } from "@/types/invoice";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/stripe";

export function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-section">
      {/* Top row: brand + INVOICE label */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[1.1rem] font-bold tracking-[0.15em] uppercase text-neutral-900">
            {invoice.senderBrand}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{invoice.senderEmail}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-light tracking-[0.3em] uppercase text-neutral-200 select-none">
            Invoice
          </p>
        </div>
      </div>

      {/* Bottom row: sender info + invoice meta */}
      <div className="grid grid-cols-2 gap-8">
        {/* Sender */}
        <div className="space-y-1">
          <p className="invoice-label mb-2">From</p>
          <p className="invoice-value font-medium">{invoice.senderName}</p>
          <p className="invoice-value text-neutral-500">{invoice.senderEmail}</p>
          <p className="invoice-value text-neutral-500">{invoice.senderLocation}</p>
        </div>

        {/* Invoice meta */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="invoice-label">Invoice</span>
            <span className="invoice-value font-mono font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="invoice-label">Issued</span>
            <span className="invoice-value">{formatDate(invoice.dateIssued)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="invoice-label">Due</span>
            <span className="invoice-value">{formatDate(invoice.paymentDue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="invoice-label">Status</span>
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
