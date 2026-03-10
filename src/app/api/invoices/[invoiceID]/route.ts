// Placeholder — implemented in Phase 2
// GET /api/invoices/[invoiceID] — public invoice fetch
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  const { invoiceID } = await params;
  return NextResponse.json({ invoiceID, data: null }, { status: 501 });
}
