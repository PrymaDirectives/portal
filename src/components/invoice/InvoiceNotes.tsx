export function InvoiceNotes({ notes }: { notes: string }) {
  if (!notes) return null;
  return (
    <div className="invoice-section">
      <p className="invoice-label mb-3">Notes</p>
      <p className="text-sm text-neutral-500 leading-relaxed whitespace-pre-line max-w-xl">
        {notes}
      </p>
    </div>
  );
}
