// BillTo — client details section (Phase 4)
import type { Invoice } from "@/types/invoice";
export function BillTo({ invoice }: { invoice: Invoice }) {
  void invoice;
  return <div className="bill-to" />;
}
