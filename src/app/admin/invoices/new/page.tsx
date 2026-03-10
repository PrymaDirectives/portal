import { NewInvoiceForm } from "@/components/admin/NewInvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-neutral-800">New Invoice</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Create a new invoice for a client</p>
      </div>
      <div className="invoice-sheet rounded-sm overflow-hidden p-8">
        <NewInvoiceForm />
      </div>
    </div>
  );
}
