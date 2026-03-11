/**
 * Invoice Template service — CRUD for saved templates
 */
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { InvoiceTemplate, TemplateLineItem } from "@/types/template";

const TEMPLATES = "templates";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDate(v: unknown): Date {
  if (!v) return new Date();
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date(v as string);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToLineItem(id: string, templateId: string, data: Record<string, any>): TemplateLineItem {
  return {
    id,
    templateId,
    item: data.item ?? "",
    description: data.description ?? "",
    hours: data.hours ?? 0,
    rate: data.rate ?? 0,
    amount: data.amount ?? 0,
    sortOrder: data.sortOrder ?? 0,
  };
}

async function fetchLineItems(templateId: string): Promise<TemplateLineItem[]> {
  const snap = await adminDb
    .collection(TEMPLATES)
    .doc(templateId)
    .collection("lineItems")
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((d) => docToLineItem(d.id, templateId, d.data() as Record<string, unknown>));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToTemplate(id: string, data: Record<string, any>, lineItems: TemplateLineItem[]): InvoiceTemplate {
  return {
    id,
    name: data.name ?? "",
    ownerEmail: data.ownerEmail ?? "",
    description: data.description ?? "",
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
    hourlyRate: data.hourlyRate ?? 0,
    taxAmount: data.taxAmount ?? 0,
    toolsUsed: data.toolsUsed ?? [],
    notes: data.notes ?? "",
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lineItems,
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getAllTemplates(): Promise<InvoiceTemplate[]> {
  const snap = await adminDb.collection(TEMPLATES).orderBy("createdAt", "desc").get();
  return Promise.all(
    snap.docs.map(async (doc) => {
      const lineItems = await fetchLineItems(doc.id);
      return docToTemplate(doc.id, doc.data() as Record<string, unknown>, lineItems);
    })
  );
}

export async function getTemplateById(id: string): Promise<InvoiceTemplate | null> {
  const doc = await adminDb.collection(TEMPLATES).doc(id).get();
  if (!doc.exists) return null;
  const lineItems = await fetchLineItems(id);
  return docToTemplate(id, doc.data() as Record<string, unknown>, lineItems);
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export interface TemplateInput {
  name: string;
  ownerEmail?: string;
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
  const now = FieldValue.serverTimestamp();
  const ref = adminDb.collection(TEMPLATES).doc();
  const data = {
    name: input.name,
    ownerEmail: input.ownerEmail ?? "",
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
    toolsUsed: input.toolsUsed ?? [],
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const batch = adminDb.batch();
  batch.set(ref, data);
  (input.lineItems ?? []).forEach((li, i) => {
    const liRef = ref.collection("lineItems").doc();
    batch.set(liRef, {
      item: li.item,
      description: li.description ?? "",
      hours: li.hours ?? 0,
      rate: li.rate ?? 0,
      amount: li.amount ?? 0,
      sortOrder: li.sortOrder ?? i,
    });
  });
  await batch.commit();
  return (await getTemplateById(ref.id))!;
}

export async function updateTemplate(
  id: string,
  input: Partial<TemplateInput>
): Promise<InvoiceTemplate> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
  const fields = [
    "name","ownerEmail","description","senderName","senderEmail","senderLocation",
    "senderBrand","clientName","clientContact","clientEmail","projectName",
    "projectDescription","currency","hourlyRate","taxAmount","notes",
  ] as const;
  for (const f of fields) {
    if (input[f] !== undefined) data[f] = input[f];
  }
  if (input.toolsUsed !== undefined) data.toolsUsed = input.toolsUsed;

  const batch = adminDb.batch();
  batch.update(adminDb.collection(TEMPLATES).doc(id), data);

  if (input.lineItems !== undefined) {
    const oldSnap = await adminDb.collection(TEMPLATES).doc(id).collection("lineItems").get();
    oldSnap.docs.forEach((d) => batch.delete(d.ref));
    input.lineItems.forEach((li, i) => {
      const liRef = adminDb.collection(TEMPLATES).doc(id).collection("lineItems").doc();
      batch.set(liRef, {
        item: li.item,
        description: li.description ?? "",
        hours: li.hours ?? 0,
        rate: li.rate ?? 0,
        amount: li.amount ?? 0,
        sortOrder: li.sortOrder ?? i,
      });
    });
  }

  await batch.commit();
  return (await getTemplateById(id))!;
}

export async function deleteTemplate(id: string): Promise<void> {
  const liSnap = await adminDb.collection(TEMPLATES).doc(id).collection("lineItems").get();
  const batch = adminDb.batch();
  liSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection(TEMPLATES).doc(id));
  await batch.commit();
}
