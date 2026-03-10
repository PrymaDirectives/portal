// ─────────────────────────────────────────────
// Invoice Template Types
// ─────────────────────────────────────────────

export interface TemplateLineItem {
  id: string;
  templateId: string;
  item: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  sortOrder: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  ownerEmail: string;
  description: string;

  // Sender defaults
  senderName: string;
  senderEmail: string;
  senderLocation: string;
  senderBrand: string;

  // Client defaults
  clientName: string;
  clientContact: string;
  clientEmail: string;

  // Project defaults
  projectName: string;
  projectDescription: string;

  // Billing defaults
  currency: string;
  hourlyRate: number;
  taxAmount: number;

  toolsUsed: string[];
  notes: string;

  createdAt: Date;
  updatedAt: Date;
  lineItems: TemplateLineItem[];
}

// ─────────────────────────────────────────────
// Subscription Types
// ─────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

export type SubscriptionInterval = "month" | "year";

export interface Subscription {
  id: string;
  clientName: string;
  clientEmail: string;
  planName: string;
  description: string;
  amount: number;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;

  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;

  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
