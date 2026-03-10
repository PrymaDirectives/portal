// Placeholder — implemented in Phase 2
// GET /api/admin/invoices — list all invoices (authenticated)
// POST /api/admin/invoices — create invoice (authenticated)
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ invoices: [] }, { status: 501 });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ invoice: null }, { status: 501 });
}
