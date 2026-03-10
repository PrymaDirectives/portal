// Invoice detail/edit — /admin/invoices/[invoiceID]
// Full implementation in Phase 5
interface PageProps {
  params: Promise<{ invoiceID: string }>;
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { invoiceID } = await params;
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-xl font-semibold text-neutral-800">Invoice {invoiceID}</h1>
      <p className="mt-2 text-sm text-neutral-400">Invoice detail/edit — implemented in Phase 5</p>
    </main>
  );
}
