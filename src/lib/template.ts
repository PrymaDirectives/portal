/**
 * Invoice Template service — CRUD for saved templates
 */
import { db } from "@/lib/db";
import type { InvoiceTemplate, TemplateLineItem } from "@/types/template";
import type {
  InvoiceTemplate as PrismaTemplate,
  TemplateLineItem as PrismaTemplateLineItem,
} from "@/generated/prisma/client";

// ─── Serializers ────────────────────────────────────────────────────────────

function serializeLineItem(item: PrismaTemplateLineItem): TemplateLineItem {
  return {
    id: item.id,
    templateId: item.templateId,
    item: item.item,
    description: item.description,
    hours: item.hours,
    rate: item.rate,
    amount: item.amount,
    sortOrder: item.sortOrder,
  };
}

function serializeTemplate(
  t: PrismaTemplate & { lineItems: PrismaTemplateLineItem[] }
): InvoiceTemplate {
  return {
    id: t.id,
    name: t.name,
    ownerEmail: t.ownerEmail,
    description: t.description,
    senderName: t.senderName,
    senderEmail: t.senderEmail,
    senderLocation: t.senderLocation,
    senderBrand: t.senderBrand,
    clientName: t.clientName,
    clientContact: t.clientContact,
    clientEmail: t.clientEmail,
    projectName: t.projectName,
    projectDescription: t.projectDescription,
    currency: t.currency,
    hourlyRate: t.hourlyRate,
    taxAmount: t.taxAmount,
    toolsUsed: JSON.parse(t.toolsUsedJson) as string[],
    notes: t.notes,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    lineItems: t.lineItems.map(serializeLineItem),
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getAllTemplates(): Promise<InvoiceTemplate[]> {
  const templates = await db!.invoiceTemplate.findMany({
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return templates.map(serializeTemplate);
}

export async function getTemplateById(id: string): Promise<InvoiceTemplate | null> {
  const t = await db!.invoiceTemplate.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return t ? serializeTemplate(t) : null;
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface TemplateInput {
  name: string;
  ownerEmail: string;
  description?: string;
  senderName?: string;
  senderEmail?: string;
  senderLocation?: string;
  senderBrand?: string;
  clientName?: string;
  clientContact?: string;
  clientEmail?: string;
  projectName?: string;
  projectDescription?: string;
  currency?: string;
  hourlyRate?: number;
  taxAmount?: number;
  toolsUsed?: string[];
  notes?: string;
  lineItems?: {
    item: string;
    description?: string;
    hours?: number;
    rate?: number;
    amount?: number;
    sortOrder?: number;
  }[];
}

export async function createTemplate(input: TemplateInput): Promise<InvoiceTemplate> {
  const t = await db!.invoiceTemplate.create({
    data: {
      name: input.name,
      ownerEmail: input.ownerEmail,
      description: input.description ?? "",
      senderName: input.senderName ?? "",
      senderEmail: input.senderEmail ?? "",
      senderLocation: input.senderLocation ?? "",
      senderBrand: input.senderBrand ?? "",
      clientName: input.clientName ?? "",
      clientContact: input.clientContact ?? "",
      clientEmail: input.clientEmail ?? "",
      projectName: input.projectName ?? "",
      projectDescription: input.projectDescription ?? "",
      currency: input.currency ?? "USD",
      hourlyRate: input.hourlyRate ?? 0,
      taxAmount: input.taxAmount ?? 0,
      toolsUsedJson: JSON.stringify(input.toolsUsed ?? []),
      notes: input.notes ?? "",
      lineItems: {
        create: (input.lineItems ?? []).map((li, i) => ({
          item: li.item,
          description: li.description ?? "",
          hours: li.hours ?? 0,
          rate: li.rate ?? 0,
          amount: li.amount ?? 0,
          sortOrder: li.sortOrder ?? i,
        })),
      },
    },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return serializeTemplate(t);
}

export async function updateTemplate(
  id: string,
  input: Partial<TemplateInput>
): Promise<InvoiceTemplate> {
  // Delete + recreate line items if provided
  if (input.lineItems !== undefined) {
    await db!.templateLineItem.deleteMany({ where: { templateId: id } });
  }

  const t = await db!.invoiceTemplate.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.ownerEmail && { ownerEmail: input.ownerEmail }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.senderName !== undefined && { senderName: input.senderName }),
      ...(input.senderEmail !== undefined && { senderEmail: input.senderEmail }),
      ...(input.senderLocation !== undefined && { senderLocation: input.senderLocation }),
      ...(input.senderBrand !== undefined && { senderBrand: input.senderBrand }),
      ...(input.clientName !== undefined && { clientName: input.clientName }),
      ...(input.clientContact !== undefined && { clientContact: input.clientContact }),
      ...(input.clientEmail !== undefined && { clientEmail: input.clientEmail }),
      ...(input.projectName !== undefined && { projectName: input.projectName }),
      ...(input.projectDescription !== undefined && { projectDescription: input.projectDescription }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.hourlyRate !== undefined && { hourlyRate: input.hourlyRate }),
      ...(input.taxAmount !== undefined && { taxAmount: input.taxAmount }),
      ...(input.toolsUsed !== undefined && { toolsUsedJson: JSON.stringify(input.toolsUsed) }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.lineItems !== undefined && {
        lineItems: {
          create: input.lineItems.map((li, i) => ({
            item: li.item,
            description: li.description ?? "",
            hours: li.hours ?? 0,
            rate: li.rate ?? 0,
            amount: li.amount ?? 0,
            sortOrder: li.sortOrder ?? i,
          })),
        },
      }),
    },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return serializeTemplate(t);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db!.invoiceTemplate.delete({ where: { id } });
}
