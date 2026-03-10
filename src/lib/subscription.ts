/**
 * Subscription service — Stripe subscription management
 */
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type { Subscription, SubscriptionInterval, SubscriptionStatus } from "@/types/template";
import type { Subscription as PrismaSubscription } from "@/generated/prisma/client";

// ─── Serializer ─────────────────────────────────────────────────────────────

function serializeSub(s: PrismaSubscription): Subscription {
  return {
    id: s.id,
    clientName: s.clientName,
    clientEmail: s.clientEmail,
    planName: s.planName,
    description: s.description,
    amount: s.amount,
    interval: s.interval as SubscriptionInterval,
    status: s.status as SubscriptionStatus,
    stripeCustomerId: s.stripeCustomerId ?? null,
    stripeSubscriptionId: s.stripeSubscriptionId ?? null,
    stripePriceId: s.stripePriceId ?? null,
    stripeProductId: s.stripeProductId ?? null,
    currentPeriodStart: s.currentPeriodStart ?? null,
    currentPeriodEnd: s.currentPeriodEnd ?? null,
    canceledAt: s.canceledAt ?? null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const subs = await db!.subscription.findMany({ orderBy: { createdAt: "desc" } });
  return subs.map(serializeSub);
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const s = await db!.subscription.findUnique({ where: { id } });
  return s ? serializeSub(s) : null;
}

// ─── Create ─────────────────────────────────────────────────────────────────

export interface CreateSubscriptionInput {
  clientName: string;
  clientEmail: string;
  planName: string;
  description?: string;
  amount: number; // dollars
  interval: SubscriptionInterval;
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  if (!stripe) {
    // Create without Stripe (manual/offline mode)
    const s = await db!.subscription.create({
      data: {
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        planName: input.planName,
        description: input.description ?? "",
        amount: input.amount,
        interval: input.interval,
        status: "active",
      },
    });
    return serializeSub(s);
  }

  // 1. Create or find Stripe customer
  const customers = await stripe.customers.list({ email: input.clientEmail, limit: 1 });
  let customerId: string;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: input.clientEmail,
      name: input.clientName,
    });
    customerId = customer.id;
  }

  // 2. Create a one-off product for this plan
  const product = await stripe.products.create({
    name: input.planName,
    description: input.description ?? undefined,
  });

  // 3. Create a price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(input.amount * 100), // convert to cents
    currency: "usd",
    recurring: { interval: input.interval },
  });

  // 4. Create the subscription
  const stripeSub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  const s = await db!.subscription.create({
    data: {
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      planName: input.planName,
      description: input.description ?? "",
      amount: input.amount,
      interval: input.interval,
      status: stripeSub.status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: price.id,
      stripeProductId: product.id,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });
  return serializeSub(s);
}

// ─── Cancel ─────────────────────────────────────────────────────────────────

export async function cancelSubscription(id: string): Promise<Subscription> {
  const sub = await db!.subscription.findUnique({ where: { id } });
  if (!sub) throw new Error("Subscription not found");

  if (stripe && sub.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  }

  const updated = await db!.subscription.update({
    where: { id },
    data: { status: "canceled", canceledAt: new Date() },
  });
  return serializeSub(updated);
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
  await db!.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubId },
    data: {
      status: stripeSub.status,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      ...(stripeSub.canceled_at && { canceledAt: new Date(stripeSub.canceled_at * 1000) }),
    },
  });
}
