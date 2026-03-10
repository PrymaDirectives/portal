// Public invoice page — portal.pryma.tech/invoice/{invoiceID}
// Full implementation in Phase 4
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ invoiceID: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { invoiceID } = await params;

  // TODO (Phase 2+): fetch invoice from DB
  if (!invoiceID) notFound();

  return (
    <main className="min-h-screen bg-neutral-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-sm text-neutral-400">
          Invoice <code>{invoiceID}</code> — full UI in Phase 4
        </p>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { invoiceID } = await params;
  return {
    title: `Invoice ${invoiceID} — Pryma`,
  };
}
