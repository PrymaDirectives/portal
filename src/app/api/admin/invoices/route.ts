import { NextRequest, NextResponse } from "next/server";
import { getAllInvoices, createInvoice } from "@/lib/invoice";
import { z } from "zod";

const CreateSchema = z.object({
  publicInvoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  status: z.string().optional(),
  dateIssued: z.string(),
  paymentDue: z.string(),
  senderName: z.string().min(1),
  senderEmail: z.string().email(),
  senderLocation: z.string().min(1),
  senderBrand: z.string().min(1),
  clientName: z.string().min(1),
  clientContact: z.string().min(1),
  clientEmail: z.string().email(),
  projectName: z.string().min(1),
  projectDescription: z.string().min(1),
  currency: z.string().optional(),
  hoursWorked: z.number(),
  hourlyRate: z.number(),
  subtotal: z.number(),
  taxAmount: z.number().optional(),
  totalDue: z.number(),
  toolsUsed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  lineItems: z.array(
    z.object({
      item: z.string().min(1),
      description: z.string(),
      hours: z.number(),
      rate: z.number(),
      amount: z.number(),
      sortOrder: z.number().optional(),
    })
  ),
});

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json({ invoices, total: invoices.length });
  } catch (err) {
    console.error("[GET /api/admin/invoices]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const invoice = await createInvoice({
      ...d,
      dateIssued: new Date(d.dateIssued),
      paymentDue: new Date(d.paymentDue),
    });
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/invoices]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
