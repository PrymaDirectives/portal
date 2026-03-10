import type { Invoice } from "@/types/invoice";
import { InvoiceHeader } from "./InvoiceHeader";
import { BillTo } from "./BillTo";
import { ProjectSection } from "./ProjectSection";
import { WorkSummaryTable } from "./WorkSummaryTable";
import { InvoiceTotals } from "./InvoiceTotals";
import { ToolsUsed } from "./ToolsUsed";
import { InvoiceNotes } from "./InvoiceNotes";
import { PaymentPanel } from "@/components/payment/PaymentPanel";

export function InvoiceView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-sheet rounded-sm overflow-hidden">
      <InvoiceHeader invoice={invoice} />
      <BillTo invoice={invoice} />
      <ProjectSection invoice={invoice} />
      <WorkSummaryTable lineItems={invoice.lineItems} currency={invoice.currency} />
      <InvoiceTotals invoice={invoice} />
      <ToolsUsed tools={invoice.toolsUsed} />
      <InvoiceNotes notes={invoice.notes} />
      <PaymentPanel invoice={invoice} />
    </div>
  );
}
