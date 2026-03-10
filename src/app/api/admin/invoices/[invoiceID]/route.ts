import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById, updateInvoice, deleteInvoice } from "@/lib/invoice";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.string().optional(),
  paymentDue: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  clientEmail: z.string().email().optional(),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  toolsUsed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lastEditedBy: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  try {
    const { invoiceID } = await params;
    const invoice = await getInvoiceById(invoiceID);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  try {
    const { invoiceID } = await params;
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const invoice = await updateInvoice(invoiceID, {
      ...d,
      paymentDue: d.paymentDue ? new Date(d.paymentDue) : undefined,
    });
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceID: string }> }
) {
  try {
    const { invoiceID } = await params;
    await deleteInvoice(invoiceID);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
