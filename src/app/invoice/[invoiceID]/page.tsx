import { notFound } from "next/navigation";
import { getInvoiceByPublicId } from "@/lib/invoice";
import { InvoiceView } from "@/components/invoice/InvoiceView";

interface PageProps {
  params: Promise<{ invoiceID: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { invoiceID } = await params;
  const invoice = await getInvoiceByPublicId(invoiceID);
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-[#f7f6f3] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <InvoiceView invoice={invoice} />
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 tracking-wide">
            Powered by{" "}
            <a
              href="https://pryma.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Pryma
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { invoiceID } = await params;
  const invoice = await getInvoiceByPublicId(invoiceID);
  if (!invoice) return { title: "Invoice Not Found" };
  return {
    title: `Invoice ${invoice.invoiceNumber} — Pryma`,
    description: `Invoice for ${invoice.clientName}: ${invoice.projectName}`,
    robots: { index: false, follow: false },
  };
}
