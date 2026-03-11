/**
 * Invoice service — all DB operations for invoices (Firestore)
 */
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Invoice, InvoiceLineItem } from "@/types/invoice";

// ─── Helpers ────────────────────────────────────────────────────────────────

const INVOICES = "invoices";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDate(v: unknown): Date {
  if (!v) return new Date();
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date(v as string);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToInvoice(id: string, data: Record<string, any>, lineItems: InvoiceLineItem[]): Invoice {
  return {
    id,
    publicInvoiceId: data.publicInvoiceId ?? "",
    invoiceNumber: data.invoiceNumber ?? "",
    status: data.status ?? "unpaid",
    dateIssued: toDate(data.dateIssued),
    paymentDue: toDate(data.paymentDue),
    paidAt: data.paidAt ? toDate(data.paidAt) : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    senderName: data.senderName ?? "",
    senderEmail: data.senderEmail ?? "",
    senderLocation: data.senderLocation ?? "",
    senderBrand: data.senderBrand ?? "",
    clientName: data.clientName ?? "",
    clientContact: data.clientContact ?? "",
    clientEmail: data.clientEmail ?? "",
    projectName: data.projectName ?? "",
    projectDescription: data.projectDescription ?? "",
    currency: data.currency ?? "USD",
    hoursWorked: data.hoursWorked ?? 0,
    hourlyRate: data.hourlyRate ?? 0,
    subtotal: data.subtotal ?? 0,
    taxAmount: data.taxAmount ?? 0,
    totalDue: data.totalDue ?? 0,
    toolsUsed: data.toolsUsed ?? [],
    notes: data.notes ?? "",
    stripeCustomerId: data.stripeCustomerId ?? null,
    stripeCheckoutSessionId: data.stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: data.stripePaymentIntentId ?? null,
    stripePaymentLink: data.stripePaymentLink ?? null,
    stripeStatus: data.stripeStatus ?? null,
    webhookLastSyncedAt: data.webhookLastSyncedAt ? toDate(data.webhookLastSyncedAt) : null,
    pdfUrl: data.pdfUrl ?? null,
    pdfVersion: data.pdfVersion ?? 0,
    pdfGeneratedAt: data.pdfGeneratedAt ? toDate(data.pdfGeneratedAt) : null,
    internalNotes: data.internalNotes ?? null,
    createdBy: data.createdBy ?? null,
    lastEditedBy: data.lastEditedBy ?? null,
    lineItems,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToLineItem(id: string, invoiceId: string, data: Record<string, any>): InvoiceLineItem {
  return {
    id,
    invoiceId,
    item: data.item ?? "",
    description: data.description ?? "",
    hours: data.hours ?? 0,
    rate: data.rate ?? 0,
    amount: data.amount ?? 0,
  };
}

async function fetchLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
  const snap = await adminDb
    .collection(INVOICES)
    .doc(invoiceId)
    .collection("lineItems")
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => docToLineItem(d.id, invoiceId, d.data() as Record<string, unknown>));
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getInvoiceByPublicId(publicInvoiceId: string): Promise<Invoice | null> {
  const snap = await adminDb
    .collection(INVOICES)
    .where("publicInvoiceId", "==", publicInvoiceId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const lineItems = await fetchLineItems(doc.id);
  return docToInvoice(doc.id, doc.data() as Record<string, unknown>, lineItems);
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const doc = await adminDb.collection(INVOICES).doc(id).get();
  if (!doc.exists) return null;
  const lineItems = await fetchLineItems(id);
  return docToInvoice(id, doc.data() as Record<string, unknown>, lineItems);
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const snap = await adminDb
    .collection(INVOICES)
    .orderBy("createdAt", "desc")
    .get();
  return Promise.all(
    snap.docs.map(async (doc) => {
      const lineItems = await fetchLineItems(doc.id);
      return docToInvoice(doc.id, doc.data() as Record<string, unknown>, lineItems);
    })
  );
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
  const now = FieldValue.serverTimestamp();
  const ref = adminDb.collection(INVOICES).doc();
  const data = {
    publicInvoiceId: input.publicInvoiceId,
    invoiceNumber: input.invoiceNumber,
    status: input.status ?? "unpaid",
    dateIssued: Timestamp.fromDate(input.dateIssued),
    paymentDue: Timestamp.fromDate(input.paymentDue),
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
    toolsUsed: input.toolsUsed ?? [],
    notes: input.notes ?? "",
    internalNotes: input.internalNotes ?? null,
    createdBy: input.createdBy ?? null,
    lastEditedBy: null,
    stripeCustomerId: null,
    stripeCheckoutSessionId: null,
    stripePaymentIntentId: null,
    stripePaymentLink: null,
    stripeStatus: null,
    webhookLastSyncedAt: null,
    pdfUrl: null,
    pdfVersion: 0,
    pdfGeneratedAt: null,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const batch = adminDb.batch();
  batch.set(ref, data);
  input.lineItems.forEach((li, i) => {
    const liRef = ref.collection("lineItems").doc();
    batch.set(liRef, { ...li, sortOrder: li.sortOrder ?? i });
  });
  await batch.commit();
  const created = await getInvoiceById(ref.id);
  return created!;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
  const dateFields = ["paymentDue", "paidAt", "webhookLastSyncedAt", "pdfGeneratedAt"] as const;
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (dateFields.includes(k as typeof dateFields[number])) {
      data[k] = v instanceof Date ? Timestamp.fromDate(v) : null;
    } else {
      data[k] = v;
    }
  }
  await adminDb.collection(INVOICES).doc(id).update(data);
  return (await getInvoiceById(id))!;
}

export async function deleteInvoice(id: string): Promise<void> {
  // Delete subcollection first
  const liSnap = await adminDb.collection(INVOICES).doc(id).collection("lineItems").get();
  const batch = adminDb.batch();
  liSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection(INVOICES).doc(id));
  await batch.commit();
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

// ─── Stripe webhook event log ────────────────────────────────────────────────

export async function logWebhookEvent(params: {
  stripeEventId: string;
  type: string;
  invoiceId?: string | null;
  payload: object;
}): Promise<void> {
  const ref = adminDb
    .collection(INVOICES)
    .doc(params.invoiceId ?? "_global")
    .collection("webhookEvents")
    .doc(params.stripeEventId);
  // upsert: only write if it doesn't exist
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set({
      stripeEventId: params.stripeEventId,
      type: params.type,
      invoiceId: params.invoiceId ?? null,
      payloadJson: JSON.stringify(params.payload),
      processedAt: FieldValue.serverTimestamp(),
    });
  }
}

