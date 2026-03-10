// InvoiceTotals — subtotal, tax, total due (Phase 4)
import type { Invoice } from "@/types/invoice";
export function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  void invoice;
  return <div className="invoice-totals" />;
}
