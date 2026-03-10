import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, updateTemplate, deleteTemplate } from "@/lib/template";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional(),
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
  lineItems: z
    .array(
      z.object({
        item: z.string().min(1),
        description: z.string().optional(),
        hours: z.number().optional(),
        rate: z.number().optional(),
        amount: z.number().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const template = await getTemplateById(id);
    if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ template });
  } catch (err) {
    console.error("[GET /api/admin/templates/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const template = await updateTemplate(id, parsed.data);
    return NextResponse.json({ template });
  } catch (err) {
    console.error("[PATCH /api/admin/templates/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteTemplate(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/templates/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
