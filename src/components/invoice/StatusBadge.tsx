import type { InvoiceStatus } from "@/types/invoice";

const statusConfig: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:      { label: "Draft",      cls: "badge-draft" },
  unpaid:     { label: "Unpaid",     cls: "badge-unpaid" },
  open:       { label: "Open",       cls: "badge-open" },
  processing: { label: "Processing", cls: "badge-processing" },
  paid:       { label: "Paid",       cls: "badge-paid" },
  overdue:    { label: "Overdue",    cls: "badge-overdue" },
  failed:     { label: "Failed",     cls: "badge-failed" },
  void:       { label: "Void",       cls: "badge-void" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, cls } = statusConfig[status] ?? statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[0.65rem] font-semibold tracking-widest uppercase ${cls}`}
    >
      {label}
    </span>
  );
}
