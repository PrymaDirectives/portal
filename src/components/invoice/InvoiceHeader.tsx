// InvoiceHeader — title, sender info, invoice meta, status
// Full implementation in Phase 4
import type { Invoice } from "@/types/invoice";

export function InvoiceHeader({ invoice }: { invoice: Invoice }) {
  void invoice;
  return <div className="invoice-header" />;
}
