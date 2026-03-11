/**
 * Subscription service — Stripe subscription management (Firestore)
 */
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { stripe } from "@/lib/stripe";
import type { Subscription, SubscriptionInterval, SubscriptionStatus } from "@/types/template";

const SUBS = "subscriptions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date(v as string);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docToSub(id: string, data: Record<string, any>): Subscription {
  return {
    id,
    clientName: data.clientName ?? "",
    clientEmail: data.clientEmail ?? "",
    planName: data.planName ?? "",
    description: data.description ?? "",
    amount: data.amount ?? 0,
    interval: (data.interval ?? "month") as SubscriptionInterval,
    status: (data.status ?? "active") as SubscriptionStatus,
    stripeCustomerId: data.stripeCustomerId ?? null,
    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
    stripePriceId: data.stripePriceId ?? null,
    stripeProductId: data.stripeProductId ?? null,
    currentPeriodStart: toDate(data.currentPeriodStart),
    currentPeriodEnd: toDate(data.currentPeriodEnd),
    canceledAt: toDate(data.canceledAt),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const snap = await adminDb.collection(SUBS).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => docToSub(d.id, d.data() as Record<string, unknown>));
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const doc = await adminDb.collection(SUBS).doc(id).get();
  if (!doc.exists) return null;
  return docToSub(id, doc.data() as Record<string, unknown>);
}

// ─── Create ─────────────────────────────────────────────────────────────────

export interface CreateSubscriptionInput {
  clientName: string;
  clientEmail: string;
  planName: string;
  description?: string;
  amount: number;
  interval: SubscriptionInterval;
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const now = FieldValue.serverTimestamp();
  const base = {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    planName: input.planName,
    description: input.description ?? "",
    amount: input.amount,
    interval: input.interval,
    createdAt: now,
    updatedAt: now,
  };

  if (!stripe) {
    const ref = adminDb.collection(SUBS).doc();
    await ref.set({ ...base, status: "active", stripeCustomerId: null,
      stripeSubscriptionId: null, stripePriceId: null, stripeProductId: null,
      currentPeriodStart: null, currentPeriodEnd: null, canceledAt: null });
    return (await getSubscriptionById(ref.id))!;
  }

  const customers = await stripe.customers.list({ email: input.clientEmail, limit: 1 });
  const customerId = customers.data.length > 0
    ? customers.data[0].id
    : (await stripe.customers.create({ email: input.clientEmail, name: input.clientName })).id;

  const product = await stripe.products.create({
    name: input.planName,
    description: input.description ?? undefined,
  });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(input.amount * 100),
    currency: "usd",
    recurring: { interval: input.interval },
  });
  const stripeSub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
  });

  const ref = adminDb.collection(SUBS).doc();
  await ref.set({
    ...base,
    status: stripeSub.status,
    stripeCustomerId: customerId,
    stripeSubscriptionId: stripeSub.id,
    stripePriceId: price.id,
    stripeProductId: product.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPeriodStart: Timestamp.fromMillis((stripeSub as any).current_period_start * 1000),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentPeriodEnd: Timestamp.fromMillis((stripeSub as any).current_period_end * 1000),
    canceledAt: null,
  });
  return (await getSubscriptionById(ref.id))!;
}

// ─── Cancel ─────────────────────────────────────────────────────────────────

export async function cancelSubscription(id: string): Promise<Subscription> {
  const sub = await getSubscriptionById(id);
  if (!sub) throw new Error("Subscription not found");

  if (stripe && sub.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  }

  await adminDb.collection(SUBS).doc(id).update({
    status: "canceled",
    canceledAt: Timestamp.fromDate(new Date()),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return (await getSubscriptionById(id))!;
}

// ─── Stripe Portal Session ───────────────────────────────────────────────────

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

// ─── Sync from Stripe webhook ────────────────────────────────────────────────

export async function syncSubscriptionFromStripe(stripeSubId: string): Promise<void> {
  if (!stripe) return;
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  const snap = await adminDb
    .collection(SUBS)
    .where("stripeSubscriptionId", "==", stripeSubId)
    .get();
  const batch = adminDb.batch();
  snap.docs.forEach((d) => {
    batch.update(d.ref, {
      status: stripeSub.status,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodStart: Timestamp.fromMillis((stripeSub as any).current_period_start * 1000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentPeriodEnd: Timestamp.fromMillis((stripeSub as any).current_period_end * 1000),
      ...(stripeSub.canceled_at && {
        canceledAt: Timestamp.fromMillis(stripeSub.canceled_at * 1000),
      }),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}
