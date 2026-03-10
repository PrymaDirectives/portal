// InvoiceView — top-level invoice composition component
// Full implementation in Phase 4
import type { Invoice } from "@/types/invoice";

interface InvoiceViewProps {
  invoice: Invoice;
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  return (
    <div className="invoice-view">
      <pre className="text-xs text-neutral-300">{invoice.invoiceNumber} — Phase 4</pre>
    </div>
  );
}
