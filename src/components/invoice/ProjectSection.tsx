import type { Invoice } from "@/types/invoice";

export function ProjectSection({ invoice }: { invoice: Invoice }) {
  return (
    <div className="invoice-section">
      <p className="invoice-label mb-3">Project</p>
      <p className="text-base font-semibold text-neutral-900 mb-1.5">{invoice.projectName}</p>
      <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
        {invoice.projectDescription}
      </p>
    </div>
  );
}
