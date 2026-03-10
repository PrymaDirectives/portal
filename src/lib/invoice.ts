/**
 * Invoice service — all DB operations for invoices
 */
import { db } from "@/lib/db";
import type { Invoice, InvoiceLineItem } from "@/types/invoice";
import type { Invoice as PrismaInvoice, InvoiceLineItem as PrismaLineItem } from "@/generated/prisma/client";

// ─── Serializers ────────────────────────────────────────────────────────────

function serializeLineItem(item: PrismaLineItem): InvoiceLineItem {
  return {
    id: item.id,
    invoiceId: item.invoiceId,
    item: item.item,
    description: item.description,
    hours: item.hours,
    rate: item.rate,
    amount: item.amount,
  };
}

function serializeInvoice(inv: PrismaInvoice & { lineItems: PrismaLineItem[] }): Invoice {
  return {
    id: inv.id,
    publicInvoiceId: inv.publicInvoiceId,
    invoiceNumber: inv.invoiceNumber,
    status: inv.status as Invoice["status"],
    dateIssued: inv.dateIssued,
    paymentDue: inv.paymentDue,
    paidAt: inv.paidAt ?? null,
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
    senderName: inv.senderName,
    senderEmail: inv.senderEmail,
    senderLocation: inv.senderLocation,
    senderBrand: inv.senderBrand,
    clientName: inv.clientName,
    clientContact: inv.clientContact,
    clientEmail: inv.clientEmail,
    projectName: inv.projectName,
    projectDescription: inv.projectDescription,
    currency: inv.currency,
    hoursWorked: inv.hoursWorked,
    hourlyRate: inv.hourlyRate,
    subtotal: inv.subtotal,
    taxAmount: inv.taxAmount,
    totalDue: inv.totalDue,
    toolsUsed: JSON.parse(inv.toolsUsedJson) as string[],
    notes: inv.notes,
    stripeCustomerId: inv.stripeCustomerId ?? null,
    stripeCheckoutSessionId: inv.stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: inv.stripePaymentIntentId ?? null,
    stripePaymentLink: inv.stripePaymentLink ?? null,
    stripeStatus: inv.stripeStatus ?? null,
    webhookLastSyncedAt: inv.webhookLastSyncedAt ?? null,
    pdfUrl: inv.pdfUrl ?? null,
    pdfVersion: inv.pdfVersion,
    pdfGeneratedAt: inv.pdfGeneratedAt ?? null,
    internalNotes: inv.internalNotes ?? null,
    createdBy: inv.createdBy ?? null,
    lastEditedBy: inv.lastEditedBy ?? null,
    lineItems: inv.lineItems.map(serializeLineItem),
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getInvoiceByPublicId(publicInvoiceId: string): Promise<Invoice | null> {
  const inv = await db!.invoice.findUnique({
    where: { publicInvoiceId },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return inv ? serializeInvoice(inv) : null;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const inv = await db!.invoice.findUnique({
    where: { id },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return inv ? serializeInvoice(inv) : null;
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const invs = await db!.invoice.findMany({
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return invs.map(serializeInvoice);
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface CreateInvoiceInput {
  publicInvoiceId: string;
  invoiceNumber: string;
  status?: string;
  dateIssued: Date;
  paymentDue: Date;
  senderName: string;
  senderEmail: string;
  senderLocation: string;
  senderBrand: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  projectName: string;
  projectDescription: string;
  currency?: string;
  hoursWorked: number;
  hourlyRate: number;
  subtotal: number;
  taxAmount?: number;
  totalDue: number;
  toolsUsed?: string[];
  notes?: string;
  internalNotes?: string;
  createdBy?: string;
  lineItems: {
    item: string;
    description: string;
    hours: number;
    rate: number;
    amount: number;
    sortOrder?: number;
  }[];
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const inv = await db!.invoice.create({
    data: {
      publicInvoiceId: input.publicInvoiceId,
      invoiceNumber: input.invoiceNumber,
      status: input.status ?? "unpaid",
      dateIssued: input.dateIssued,
      paymentDue: input.paymentDue,
      senderName: input.senderName,
      senderEmail: input.senderEmail,
      senderLocation: input.senderLocation,
      senderBrand: input.senderBrand,
      clientName: input.clientName,
      clientContact: input.clientContact,
      clientEmail: input.clientEmail,
      projectName: input.projectName,
      projectDescription: input.projectDescription,
      currency: input.currency ?? "USD",
      hoursWorked: input.hoursWorked,
      hourlyRate: input.hourlyRate,
      subtotal: input.subtotal,
      taxAmount: input.taxAmount ?? 0,
      totalDue: input.totalDue,
      toolsUsedJson: JSON.stringify(input.toolsUsed ?? []),
      notes: input.notes ?? "",
      internalNotes: input.internalNotes,
      createdBy: input.createdBy,
      lineItems: {
        create: input.lineItems.map((li, i) => ({
          ...li,
          sortOrder: li.sortOrder ?? i,
        })),
      },
    },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return serializeInvoice(inv);
}

export interface UpdateInvoiceInput {
  status?: string;
  paymentDue?: Date;
  paidAt?: Date | null;
  clientName?: string;
  clientContact?: string;
  clientEmail?: string;
  projectName?: string;
  projectDescription?: string;
  toolsUsed?: string[];
  notes?: string;
  internalNotes?: string;
  lastEditedBy?: string;
  stripeCustomerId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripePaymentLink?: string;
  stripeStatus?: string;
  webhookLastSyncedAt?: Date;
  pdfUrl?: string;
  pdfVersion?: number;
  pdfGeneratedAt?: Date;
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
  const inv = await db!.invoice.update({
    where: { id },
    data: {
      ...input,
      toolsUsedJson: input.toolsUsed ? JSON.stringify(input.toolsUsed) : undefined,
    },
    include: { lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  return serializeInvoice(inv);
}

export async function deleteInvoice(id: string): Promise<void> {
  await db!.invoice.delete({ where: { id } });
}

export async function markInvoicePaid(
  id: string,
  stripeData: {
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    stripeStatus?: string;
  }
): Promise<Invoice> {
  return updateInvoice(id, {
    status: "paid",
    paidAt: new Date(),
    webhookLastSyncedAt: new Date(),
    ...stripeData,
  });
}
