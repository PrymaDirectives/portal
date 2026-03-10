// Placeholder — implemented in Phase 2
// GET/PATCH/DELETE /api/admin/invoices/[invoiceID] (authenticated)
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  const { invoiceID } = await params;
  return NextResponse.json({ invoiceID, data: null }, { status: 501 });
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  const { invoiceID } = await params;
  return NextResponse.json({ invoiceID, updated: false }, { status: 501 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  const { invoiceID } = await params;
  return NextResponse.json({ invoiceID, deleted: false }, { status: 501 });
}
