import { NextRequest, NextResponse } from "next/server";
import { getAllTemplates, createTemplate } from "@/lib/template";
import { z } from "zod";

const LineItemSchema = z.object({
  item: z.string().min(1),
  description: z.string().optional(),
  hours: z.number().optional(),
  rate: z.number().optional(),
  amount: z.number().optional(),
  sortOrder: z.number().optional(),
});

const CreateSchema = z.object({
  name: z.string().min(1),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  senderLocation: z.string().optional(),
  senderBrand: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  clientEmail: z.string().optional(),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  currency: z.string().optional(),
  hourlyRate: z.number().optional(),
  taxAmount: z.number().optional(),
  toolsUsed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  lineItems: z.array(LineItemSchema).optional(),
});

export async function GET() {
  try {
    const templates = await getAllTemplates();
    return NextResponse.json({ templates, total: templates.length });
  } catch (err) {
    console.error("[GET /api/admin/templates]", err);
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
    const template = await createTemplate(parsed.data);
    return NextResponse.json({ template }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/templates]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
