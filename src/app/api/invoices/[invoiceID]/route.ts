import { NextRequest, NextResponse } from "next/server";
import { getInvoiceByPublicId } from "@/lib/invoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  try {
    const { invoiceID } = await params;
    const invoice = await getInvoiceByPublicId(invoiceID);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("[GET /api/invoices/[invoiceID]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
