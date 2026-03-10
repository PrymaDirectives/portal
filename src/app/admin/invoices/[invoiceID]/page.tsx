import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvoiceById } from "@/lib/invoice";
import { InvoiceView } from "@/components/invoice/InvoiceView";
import { AdminInvoiceActions } from "@/components/admin/AdminInvoiceActions";

interface PageProps {
  params: Promise<{ invoiceID: string }>;
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { invoiceID } = await params;
  const invoice = await getInvoiceById(invoiceID);
  if (!invoice) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicInvoiceId}`;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/invoices"
            className="text-xs text-neutral-400 hover:text-neutral-700 transition"
          >
            &larr; All invoices
          </Link>
          <span className="text-neutral-200">/</span>
          <span className="text-xs font-medium text-neutral-700">{invoice.invoiceNumber}</span>
        </div>
        <AdminInvoiceActions invoice={invoice} publicUrl={publicUrl} />
      </div>

      {/* Invoice preview */}
      <div className="mb-6">
        <InvoiceView invoice={invoice} />
      </div>

      {/* Internal notes */}
      {invoice.internalNotes && (
        <div className="invoice-sheet rounded-sm p-6">
          <p className="invoice-label mb-2">Internal Notes</p>
          <p className="text-sm text-neutral-600 whitespace-pre-line">{invoice.internalNotes}</p>
        </div>
      )}
    </div>
  );
}
