// StatusBadge — visual payment state indicator
// Full implementation in Phase 4
import type { InvoiceStatus } from "@/types/invoice";

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft:      { label: "Draft",      className: "bg-neutral-100 text-neutral-500" },
  unpaid:     { label: "Unpaid",     className: "bg-amber-50 text-amber-700" },
  open:       { label: "Open",       className: "bg-blue-50 text-blue-700" },
  processing: { label: "Processing", className: "bg-indigo-50 text-indigo-700" },
  paid:       { label: "Paid",       className: "bg-emerald-50 text-emerald-700" },
  overdue:    { label: "Overdue",    className: "bg-red-50 text-red-700" },
  failed:     { label: "Failed",     className: "bg-red-100 text-red-800" },
  void:       { label: "Void",       className: "bg-neutral-200 text-neutral-600" },
};

interface StatusBadgeProps {
  status: InvoiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase ${className}`}
    >
      {label}
    </span>
  );
}
