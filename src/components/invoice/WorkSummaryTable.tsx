// WorkSummaryTable — line items: Item, Description, Hours, Rate, Amount (Phase 4)
import type { InvoiceLineItem } from "@/types/invoice";
export function WorkSummaryTable({ lineItems }: { lineItems: InvoiceLineItem[] }) {
  void lineItems;
  return <div className="work-summary-table" />;
}
