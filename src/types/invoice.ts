// ─────────────────────────────────────────────
// Core Invoice Types — portal.pryma.tech
// ─────────────────────────────────────────────

export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "open"
  | "processing"
  | "paid"
  | "overdue"
  | "failed"
  | "void";

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  item: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  // Core identifiers
  id: string;
  publicInvoiceId: string;
  invoiceNumber: string;

  // Status & dates
  status: InvoiceStatus;
  dateIssued: Date;
  paymentDue: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Sender
  senderName: string;
  senderEmail: string;
  senderLocation: string;
  senderBrand: string;

  // Client
  clientName: string;
  clientContact: string;
  clientEmail: string;

  // Project
  projectName: string;
  projectDescription: string;

  // Billing
  currency: string;
  hoursWorked: number;
  hourlyRate: number;
  subtotal: number;
  taxAmount: number;
  totalDue: number;
  lineItems: InvoiceLineItem[];

  // Tools & notes
  toolsUsed: string[];
  notes: string;

  // Stripe
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripePaymentLink: string | null;
  stripeStatus: string | null;
  webhookLastSyncedAt: Date | null;

  // PDF / Storage
  pdfUrl: string | null;
  pdfVersion: number;
  pdfGeneratedAt: Date | null;

  // Admin / Internal
  internalNotes: string | null;
  createdBy: string | null;
  lastEditedBy: string | null;
}

export interface StripeWebhookEvent {
  id: string;
  stripeEventId: string;
  type: string;
  invoiceId: string | null;
  payload: Record<string, unknown>;
  processedAt: Date;
}

// API response shapes
export interface InvoiceApiResponse {
  invoice: Invoice | null;
  error?: string;
}

export interface InvoiceListApiResponse {
  invoices: Invoice[];
  total: number;
  error?: string;
}

export interface CheckoutSessionApiResponse {
  url: string | null;
  sessionId: string | null;
  error?: string;
}
