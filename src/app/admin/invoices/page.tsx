import Link from "next/link";
import { getAllInvoices } from "@/lib/invoice";
import { InvoiceTable } from "@/components/admin/InvoiceTable";

export default async function AdminInvoicesPage() {
  const invoices = await getAllInvoices();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800">Invoices</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{invoices.length} total</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="rounded-sm bg-neutral-900 px-4 py-2 text-xs font-semibold text-white tracking-wide hover:bg-neutral-800 transition"
        >
          + New Invoice
        </Link>
      </div>
      <div className="invoice-sheet rounded-sm overflow-hidden">
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
