// InvoiceTable — admin list view for all invoices (Phase 5)
import type { Invoice } from "@/types/invoice";
export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  void invoices;
  return <div className="invoice-table" />;
}
